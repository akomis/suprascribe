import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { BATCH_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts/email-discovery'
import { BatchEmailAnalysisResultSchema } from '@/lib/schemas/subscription'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { EmailData } from '@/lib/types/email'
import { stripHtmlFromEmail } from '@/lib/utils/email-html-parser'
import {
  deduplicateAndMerge,
  normalizeDiscoveredSubscription,
} from '@/lib/utils/subscription-normalizer'
import { generateObject, NoObjectGeneratedError, type LanguageModel } from 'ai'
import type { z } from 'zod'
import { createModel, type ProviderConfig } from './ai-provider'

export type { EmailData }

const API_TIMEOUT_MS = 30_000

// Scaled by prompt size rather than email count: chunks are packed to a token
// budget, so a chunk of few long emails is as much work as many short ones.
const TIMEOUT_PER_1K_TOKENS_MS = 1_500

const MAX_API_TIMEOUT_MS = 180_000

const MAX_CHUNK_SPLIT_DEPTH = 2

const CHARS_PER_TOKEN = 4

const MAX_GENERATION_ATTEMPTS = 3

// Fixed seed so repeat scans of an unchanged inbox return the same set.
const GENERATION_SEED = 1

// Two-label public suffixes, so mail.service.co.uk groups as service.co.uk
// rather than collapsing every .co.uk sender into one group.
const MULTI_LABEL_PUBLIC_SUFFIXES = new Set([
  'co.uk',
  'org.uk',
  'ac.uk',
  'com.au',
  'net.au',
  'org.au',
  'co.nz',
  'co.jp',
  'co.kr',
  'com.br',
  'com.mx',
  'com.ar',
  'co.za',
  'co.in',
  'com.sg',
  'com.hk',
  'com.tr',
])

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms: ${label}`)), ms),
    ),
  ])
}

function getDefaultModel(): LanguageModel {
  const apiKey = process.env.MODEL_API_KEY

  if (!apiKey) {
    throw new Error(
      'MODEL_API_KEY environment variable is not set. Please add it to your .env.local file.',
    )
  }

  return createModel({
    provider: 'openrouter',
    apiKey,
    model: EMAIL_DISCOVERY_CONFIG.analysisModel.modelName,
  })
}

export interface TokenUsage {
  inputTokens: number
  outputTokens: number
}

export interface AnalysisConfig {
  byokConfig?: ProviderConfig
}

/** One sender domain's emails, pre-rendered so we strip HTML and size it once. */
interface SenderSection {
  domain: string
  emailCount: number
  text: string
  estimatedTokens: number
}

function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Reduces a From header to the service's registrable domain so every receipt
 * for one service lands in the same group. Providers hand us different shapes
 * ('"Anthropic" <no-reply@mail.anthropic.com>' from Gmail, a bare address from
 * Outlook) and services rotate the local part (billing@, noreply@, receipts@),
 * so neither the raw header nor the full address is a stable key.
 */
function extractSenderDomain(from: string | undefined): string {
  if (!from) return 'unknown'

  const angled = from.match(/<([^>]+)>/)
  const address = (angled ? angled[1] : from).trim().toLowerCase()

  const at = address.lastIndexOf('@')
  if (at === -1) return address || 'unknown'

  const labels = address
    .slice(at + 1)
    .replace(/[^a-z0-9.-]/g, '')
    .split('.')
    .filter(Boolean)

  if (labels.length < 2) return labels.join('.') || 'unknown'

  const lastTwo = labels.slice(-2).join('.')
  if (labels.length > 2 && MULTI_LABEL_PUBLIC_SUFFIXES.has(lastTwo)) {
    return labels.slice(-3).join('.')
  }

  return lastTwo
}

function buildSenderSections(emails: EmailData[]): SenderSection[] {
  const maxBodyTokens = EMAIL_DISCOVERY_CONFIG.batch.maxBodyTokensPerEmail
  const groups = new Map<string, EmailData[]>()

  for (const email of emails) {
    if (!email.body) continue
    const domain = extractSenderDomain(email.from)
    const existing = groups.get(domain) || []
    existing.push(email)
    groups.set(domain, existing)
  }

  const sections: SenderSection[] = []

  for (const [domain, domainEmails] of groups) {
    const emailsText = domainEmails
      .map((email, idx) => {
        const plainTextBody = stripHtmlFromEmail(email.body || '')
        const maxBodyChars = maxBodyTokens === null ? null : maxBodyTokens * CHARS_PER_TOKEN
        const body =
          maxBodyChars !== null && plainTextBody.length > maxBodyChars
            ? plainTextBody.slice(0, maxBodyChars) + '...[truncated]'
            : plainTextBody

        return `  EMAIL ${idx + 1}:
  FROM: ${email.from}
  SUBJECT: ${email.subject}
  BODY: ${body}`
      })
      .join('\n\n')

    const text = `=== SENDER DOMAIN: ${domain} (${domainEmails.length} emails) ===
${emailsText}`

    sections.push({
      domain,
      emailCount: domainEmails.length,
      text,
      estimatedTokens: estimateTokens(text),
    })
  }

  return sections
}

function countEmails(chunk: SenderSection[]): number {
  return chunk.reduce((sum, section) => sum + section.emailCount, 0)
}

function countTokens(chunk: SenderSection[]): number {
  return chunk.reduce((sum, section) => sum + section.estimatedTokens, 0)
}

function calculateTimeout(estimatedTokens: number): number {
  const dynamicTimeout = API_TIMEOUT_MS + (estimatedTokens / 1_000) * TIMEOUT_PER_1K_TOKENS_MS
  return Math.min(Math.round(dynamicTimeout), MAX_API_TIMEOUT_MS)
}

/**
 * Packs sender sections into chunks that fit the model's context window.
 * A sender group is never split: every receipt from one sender domain must
 * reach the model in the same prompt so it can merge them into a single
 * subscription. A domain that exceeds the budget alone gets a chunk to itself.
 */
function chunkSenderSections(sections: SenderSection[]): SenderSection[][] {
  const budget =
    EMAIL_DISCOVERY_CONFIG.batch.maxInputTokensPerChunk -
    estimateTokens(BATCH_ANALYSIS_SYSTEM_PROMPT)

  const chunks: SenderSection[][] = []
  let currentChunk: SenderSection[] = []
  let currentTokens = 0

  for (const section of sections) {
    if (section.estimatedTokens > budget) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk)
        currentChunk = []
        currentTokens = 0
      }
      chunks.push([section])
      continue
    }

    if (currentTokens + section.estimatedTokens > budget && currentChunk.length > 0) {
      chunks.push(currentChunk)
      currentChunk = []
      currentTokens = 0
    }

    currentChunk.push(section)
    currentTokens += section.estimatedTokens
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}

/** Halves a chunk by sender domain. Returns [] when it holds a single domain,
 * since domain groups stay intact. */
function splitChunk(chunk: SenderSection[]): SenderSection[][] {
  if (chunk.length < 2) return []

  const mid = Math.ceil(chunk.length / 2)
  return [chunk.slice(0, mid), chunk.slice(mid)]
}

/**
 * Recovers the completed array elements from a JSON response that was cut off
 * mid-generation, by truncating to the last closed subscription object and
 * re-closing the array and root object.
 */
function repairTruncatedSubscriptionsJson(text: string): string | null {
  let inString = false
  let escaped = false
  let depth = 0
  let lastElementEnd = -1

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (escaped) {
      escaped = false
      continue
    }

    if (inString) {
      if (char === '\\') escaped = true
      else if (char === '"') inString = false
      continue
    }

    if (char === '"') {
      inString = true
    } else if (char === '{' || char === '[') {
      depth++
    } else if (char === '}' || char === ']') {
      depth--
      // Root object is depth 1, the subscriptions array depth 2, so an element
      // object closing brings us back to depth 2.
      if (char === '}' && depth === 2) lastElementEnd = i
    }
  }

  if (lastElementEnd === -1) return null

  return `${text.slice(0, lastElementEnd + 1)}]}`
}

type RawSubscription = z.infer<typeof BatchEmailAnalysisResultSchema>['subscriptions'][number]

/**
 * Runs one chunk through the model, retrying when the response comes back
 * unparseable. A mid-stream provider cutoff yields valid-but-truncated JSON;
 * retrying gets the full set, whereas salvaging the partial silently drops
 * subscriptions. Salvage is the last resort, only once retries are exhausted.
 */
async function generateChunkAnalysis(
  chunk: SenderSection[],
  model: Parameters<typeof generateObject>[0]['model'],
  emailCount: number,
  label: string,
  maxOutputTokens: number | undefined,
): Promise<{ subscriptions: RawSubscription[]; usage: TokenUsage }> {
  const groupedPrompt = chunk.map((section) => section.text).join('\n\n')
  const chunkTokens = countTokens(chunk)
  const timeout = calculateTimeout(chunkTokens)
  const usage: TokenUsage = { inputTokens: 0, outputTokens: 0 }

  let lastUnparseableText: string | undefined

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      const result = await withTimeout(
        generateObject({
          model,
          schema: BatchEmailAnalysisResultSchema,
          system: BATCH_ANALYSIS_SYSTEM_PROMPT,
          prompt: groupedPrompt,
          temperature: EMAIL_DISCOVERY_CONFIG.analysisModel.temperature,
          seed: GENERATION_SEED,
          maxOutputTokens,
          providerOptions: {
            anthropic: { thinking: { type: 'disabled' } },
            google: { thinkingConfig: { thinkingBudget: 0 } },
            openrouter: { reasoning: { enabled: false, effort: 'none' } },
          },
        }),
        timeout,
        `chunk analysis (${emailCount} emails, ~${chunkTokens} tokens)`,
      )

      usage.inputTokens += result.usage?.inputTokens || 0
      usage.outputTokens += result.usage?.outputTokens || 0

      return { subscriptions: result.object.subscriptions, usage }
    } catch (error) {
      if (!NoObjectGeneratedError.isInstance(error)) throw error

      usage.inputTokens += error.usage?.inputTokens || 0
      usage.outputTokens += error.usage?.outputTokens || 0
      lastUnparseableText = error.text ?? lastUnparseableText
    }
  }

  const repaired = lastUnparseableText
    ? repairTruncatedSubscriptionsJson(lastUnparseableText)
    : null

  if (!repaired) {
    throw new Error(
      `Chunk ${label} produced unparseable output on all ${MAX_GENERATION_ATTEMPTS} attempts`,
    )
  }

  let salvaged: RawSubscription[]
  try {
    salvaged = BatchEmailAnalysisResultSchema.parse(JSON.parse(repaired)).subscriptions
  } catch (error) {
    throw new Error(
      `Chunk ${label} salvage failed: ${error instanceof Error ? error.message : 'unknown error'}`,
    )
  }

  return { subscriptions: salvaged, usage }
}

async function processChunk(
  chunk: SenderSection[],
  model: Parameters<typeof generateObject>[0]['model'],
  emailCount: number,
  label: string,
  maxOutputTokens: number | undefined,
): Promise<{ subscriptions: DiscoveredSubscription[]; usage: TokenUsage }> {
  const { subscriptions: raw, usage } = await generateChunkAnalysis(
    chunk,
    model,
    emailCount,
    label,
    maxOutputTokens,
  )

  const subscriptions: DiscoveredSubscription[] = []

  for (const sub of raw) {
    const result = normalizeDiscoveredSubscription(sub)
    if (result.ok) subscriptions.push(result.subscription)
  }

  return {
    subscriptions,
    usage,
  }
}

export async function analyzeEmailsBatch(
  emails: EmailData[],
  config?: AnalysisConfig,
): Promise<{ subscriptions: DiscoveredSubscription[]; totalUsage: TokenUsage }> {
  if (emails.length === 0) {
    return { subscriptions: [], totalUsage: { inputTokens: 0, outputTokens: 0 } }
  }

  const totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 }
  const allSubscriptions: DiscoveredSubscription[] = []

  const sections = buildSenderSections(emails)

  if (sections.length === 0) {
    return { subscriptions: [], totalUsage }
  }

  const chunks = chunkSenderSections(sections)

  const model = config?.byokConfig ? createModel(config.byokConfig) : getDefaultModel()

  // Only the default model's ceiling is known. A BYOK model is whatever the
  // user picked, so leave the limit unset and let the provider apply its own
  // maximum rather than guessing one that truncates or gets rejected.
  const maxOutputTokens = config?.byokConfig
    ? undefined
    : EMAIL_DISCOVERY_CONFIG.analysisModel.maxOutputTokens

  const processChunkWithSplitRetry = async (
    chunk: SenderSection[],
    label: string,
    depth: number,
  ): Promise<void> => {
    const chunkEmailCount = countEmails(chunk)

    try {
      const { subscriptions, usage } = await processChunk(
        chunk,
        model,
        chunkEmailCount,
        label,
        maxOutputTokens,
      )

      totalUsage.inputTokens += usage.inputTokens
      totalUsage.outputTokens += usage.outputTokens
      allSubscriptions.push(...subscriptions)
    } catch (error) {
      const halves = depth < MAX_CHUNK_SPLIT_DEPTH ? splitChunk(chunk) : []

      if (halves.length === 0) {
        console.error(`[Email Analysis] Chunk ${label} failed:`, error)
        return
      }

      for (let j = 0; j < halves.length; j++) {
        await processChunkWithSplitRetry(halves[j], `${label}.${j + 1}`, depth + 1)
      }
    }
  }

  for (let i = 0; i < chunks.length; i++) {
    await processChunkWithSplitRetry(chunks[i], `${i + 1}/${chunks.length}`, 0)
  }

  const subscriptions = deduplicateAndMerge(allSubscriptions)

  return { subscriptions, totalUsage }
}
