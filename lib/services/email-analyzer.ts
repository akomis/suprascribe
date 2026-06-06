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
import { generateObject, type LanguageModel } from 'ai'
import { createModel, type ProviderConfig } from './ai-provider'

export type { EmailData }

const API_TIMEOUT_MS = 30_000

const TIMEOUT_PER_EMAIL_MS = 1_000

const MAX_API_TIMEOUT_MS = 180_000

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

function buildGroupedAnalysisPrompt(senderGroups: Map<string, EmailData[]>): string {
  const maxBodyTokens = EMAIL_DISCOVERY_CONFIG.batch.maxBodyTokensPerEmail
  const sections: string[] = []

  for (const [sender, emails] of senderGroups) {
    const validEmails = emails.filter((e) => e.body)
    if (validEmails.length === 0) continue

    const emailsText = validEmails
      .map((email, idx) => {
        const plainTextBody = stripHtmlFromEmail(email.body || '')
        const truncatedBody =
          plainTextBody.length > maxBodyTokens * 4
            ? plainTextBody.slice(0, maxBodyTokens * 4) + '...[truncated]'
            : plainTextBody

        return `  EMAIL ${idx + 1}:
  SUBJECT: ${email.subject}
  BODY: ${truncatedBody}`
      })
      .join('\n\n')

    sections.push(`=== SENDER: ${sender} (${validEmails.length} emails) ===
${emailsText}`)
  }

  return sections.join('\n\n')
}

function groupEmailsBySender(emails: EmailData[]): Map<string, EmailData[]> {
  const groups = new Map<string, EmailData[]>()

  for (const email of emails) {
    const sender = email.from?.toLowerCase().trim() || 'unknown'
    const existing = groups.get(sender) || []
    existing.push(email)
    groups.set(sender, existing)
  }

  return groups
}

function calculateTimeout(emailCount: number): number {
  const dynamicTimeout = API_TIMEOUT_MS + emailCount * TIMEOUT_PER_EMAIL_MS
  return Math.min(dynamicTimeout, MAX_API_TIMEOUT_MS)
}

function chunkSenderGroups(
  senderGroups: Map<string, EmailData[]>,
  maxEmailsPerBatch: number,
): Map<string, EmailData[]>[] {
  const chunks: Map<string, EmailData[]>[] = []
  let currentChunk = new Map<string, EmailData[]>()
  let currentChunkSize = 0

  for (const [sender, emails] of senderGroups) {
    if (emails.length > maxEmailsPerBatch) {
      if (currentChunkSize > 0) {
        chunks.push(currentChunk)
        currentChunk = new Map()
        currentChunkSize = 0
      }

      for (let i = 0; i < emails.length; i += maxEmailsPerBatch) {
        const senderChunk = new Map<string, EmailData[]>()
        senderChunk.set(sender, emails.slice(i, i + maxEmailsPerBatch))
        chunks.push(senderChunk)
      }
      continue
    }

    if (currentChunkSize + emails.length > maxEmailsPerBatch) {
      chunks.push(currentChunk)
      currentChunk = new Map()
      currentChunkSize = 0
    }

    currentChunk.set(sender, emails)
    currentChunkSize += emails.length
  }

  if (currentChunkSize > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}

async function processChunk(
  senderGroups: Map<string, EmailData[]>,
  model: Parameters<typeof generateObject>[0]['model'],
  emailCount: number,
): Promise<{ subscriptions: DiscoveredSubscription[]; usage: TokenUsage }> {
  const groupedPrompt = buildGroupedAnalysisPrompt(senderGroups)
  const timeout = calculateTimeout(emailCount)

  const { object, usage } = await withTimeout(
    generateObject({
      model,
      schema: BatchEmailAnalysisResultSchema,
      system: BATCH_ANALYSIS_SYSTEM_PROMPT,
      prompt: groupedPrompt,
      temperature: EMAIL_DISCOVERY_CONFIG.analysisModel.temperature,
      providerOptions: {
        anthropic: { thinking: { type: 'disabled' } },
        google: { thinkingConfig: { thinkingBudget: 0 } },
      },
    }),
    timeout,
    `chunk analysis (${emailCount} emails)`,
  )

  const subscriptions: DiscoveredSubscription[] = []

  for (const sub of object.subscriptions) {
    const result = normalizeDiscoveredSubscription(sub)
    if (result.ok) {
      subscriptions.push(result.subscription)
    } else {
      console.warn(
        `[Email Analysis] Rejected "${sub.service_name}": [${result.field}] ${result.reason}`,
      )
    }
  }

  return {
    subscriptions,
    usage: {
      inputTokens: usage?.inputTokens || 0,
      outputTokens: usage?.outputTokens || 0,
    },
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

  const senderGroups = groupEmailsBySender(emails)

  const maxEmailsPerBatch = EMAIL_DISCOVERY_CONFIG.batch.maxEmailsPerBatch
  const chunks = chunkSenderGroups(senderGroups, maxEmailsPerBatch)

  console.log(
    `[Email Analysis] Processing ${emails.length} emails from ${senderGroups.size} senders in ${chunks.length} chunk(s)`,
  )

  const model = config?.byokConfig ? createModel(config.byokConfig) : getDefaultModel()

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const chunkEmailCount = Array.from(chunk.values()).reduce(
      (sum, emails) => sum + emails.length,
      0,
    )

    try {
      const { subscriptions, usage } = await processChunk(chunk, model, chunkEmailCount)

      totalUsage.inputTokens += usage.inputTokens
      totalUsage.outputTokens += usage.outputTokens
      allSubscriptions.push(...subscriptions)

      console.log(
        `[Email Analysis] Chunk ${i + 1}/${chunks.length} completed: found ${subscriptions.length} subscriptions`,
      )
    } catch (error) {
      console.error(`[Email Analysis] Chunk ${i + 1}/${chunks.length} failed:`, error)
    }
  }

  const subscriptions = deduplicateAndMerge(allSubscriptions)

  console.log(
    `[Email Analysis] Completed: found ${subscriptions.length} subscriptions from ${emails.length} emails (${allSubscriptions.length} before dedup)`,
  )

  return { subscriptions, totalUsage }
}
