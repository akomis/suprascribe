import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { PAYMENT_PROCESSOR_HOSTNAMES } from '@/lib/config/urls'
import { BATCH_ANALYSIS_SYSTEM_PROMPT } from '@/lib/prompts/email-discovery'
import { BatchEmailAnalysisResultSchema } from '@/lib/schemas/subscription'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { EmailData } from '@/lib/types/email'
import { stripHtmlFromEmail } from '@/lib/utils/email-html-parser'
import { mapWithConcurrency } from '@/lib/utils/concurrency'
import {
  deduplicateAndMerge,
  filterSingletonOneTimePayments,
  normalizeDiscoveredSubscription,
} from '@/lib/utils/subscription-normalizer'
import { generateObject, NoObjectGeneratedError, type LanguageModel } from 'ai'
import type { z } from 'zod'
import { createModel, type ProviderConfig } from './ai-provider'

export type { EmailData }

const API_TIMEOUT_MS = 30_000

// Scaled by prompt size rather than email count: a unit of few long emails is
// as much work as one of many short ones.
const TIMEOUT_PER_1K_TOKENS_MS = 1_500

const MAX_API_TIMEOUT_MS = 180_000

// Receipt text is dense with numbers, currency symbols and punctuation, which
// tokenize closer to 3.3 characters each than the ~4 that prose averages.
// Estimating high is the safe direction: it costs an extra unit, where
// estimating low overruns the context window and truncates the response.
const CHARS_PER_TOKEN = 3.3

const MAX_GENERATION_ATTEMPTS = 3

// How many analysis units are in flight at once. Bounded so a large inbox does
// not open dozens of simultaneous provider requests and earn a rate limit.
const MAX_CONCURRENT_ANALYSES = 6

// A sender this small is not worth a request of its own; several are batched
// into one unit so the system prompt is paid for once across all of them.
const TAIL_SECTION_MAX_TOKENS = 2_000

// Ceiling for one batched tail unit. Well under the per-unit budget, since the
// point of batching is amortising overhead, not filling the context window.
const TAIL_BATCH_MAX_TOKENS = 20_000

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

// Services that send billing mail from a domain other than their brand's.
// Reducing to the registrable domain already handles mail.anthropic.com; this
// map is only for the cases where the registrable domain itself differs, which
// would otherwise scatter one service's receipts across separate units.
const SENDER_DOMAIN_ALIASES: Record<string, string> = {
  'spotifymail.com': 'spotify.com',
  'githubapp.com': 'github.com',
  'email.apple.com': 'apple.com',
  'e.godaddy.com': 'godaddy.com',
}

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

/** One sender's emails, before they are rendered into prompt text. */
export interface SenderGroup {
  domain: string
  emails: EmailData[]
  /**
   * True for payment processors, where the sender identifies the checkout host
   * rather than the service being paid for, so one group holds receipts from
   * many unrelated merchants.
   */
  multiMerchant: boolean
}

/** One LLM call's payload. */
export interface AnalysisUnit {
  label: string
  text: string
  emailCount: number
  estimatedTokens: number
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Reduces a From header to the service's registrable domain so every receipt
 * for one service lands in the same group. Providers hand us different shapes
 * ('"Anthropic" <no-reply@mail.anthropic.com>' from Gmail, a bare address from
 * Outlook) and services rotate the local part (billing@, noreply@, receipts@),
 * so neither the raw header nor the full address is a stable key.
 */
export function extractSenderDomain(from: string | undefined): string {
  if (!from) return 'unknown'

  const angled = from.match(/<([^>]+)>/)
  const address = (angled ? angled[1] : from).trim().toLowerCase()

  const at = address.lastIndexOf('@')
  if (at === -1) return address || 'unknown'

  const host = address.slice(at + 1).replace(/[^a-z0-9.-]/g, '')
  if (SENDER_DOMAIN_ALIASES[host]) return SENDER_DOMAIN_ALIASES[host]

  const labels = host.split('.').filter(Boolean)

  if (labels.length < 2) return labels.join('.') || 'unknown'

  const lastTwo = labels.slice(-2).join('.')
  const registrable =
    labels.length > 2 && MULTI_LABEL_PUBLIC_SUFFIXES.has(lastTwo)
      ? labels.slice(-3).join('.')
      : lastTwo

  return SENDER_DOMAIN_ALIASES[registrable] ?? registrable
}

function isPaymentProcessor(domain: string): boolean {
  return PAYMENT_PROCESSOR_HOSTNAMES.has(domain)
}

/**
 * Buckets emails by sending service. Groups are the unit everything downstream
 * reasons about, because every merging rule in the prompt - same plan across
 * months, upgrades, credit purchases - applies within one service and never
 * across two.
 */
export function groupEmailsBySender(emails: EmailData[]): SenderGroup[] {
  const groups = new Map<string, EmailData[]>()

  for (const email of emails) {
    const domain = extractSenderDomain(email.from)
    const existing = groups.get(domain) || []
    existing.push(email)
    groups.set(domain, existing)
  }

  return Array.from(groups, ([domain, groupEmails]) => ({
    domain,
    // Oldest first. The prompt asks for the EARLIEST start date and the LATEST
    // end date across a plan's receipts, so handing them over in billing order
    // matches how it is asked to reason. The fetchers sort newest first, which
    // is the right default for every other consumer.
    emails: [...groupEmails].sort((a, b) => a.date.localeCompare(b.date)),
    multiMerchant: isPaymentProcessor(domain),
  }))
}

function renderEmail(email: EmailData, index: number): string {
  const maxBodyTokens = EMAIL_DISCOVERY_CONFIG.batch.maxBodyTokensPerEmail
  const plainTextBody = stripHtmlFromEmail(email.body || '')
  const maxBodyChars = maxBodyTokens === null ? null : Math.floor(maxBodyTokens * CHARS_PER_TOKEN)
  const body =
    maxBodyChars !== null && plainTextBody.length > maxBodyChars
      ? plainTextBody.slice(0, maxBodyChars) + '...[truncated]'
      : plainTextBody

  // A receipt whose body failed to decode still names the service in its
  // subject, and often the amount too, so it is worth sending anyway.
  const bodyLine = body ? `  BODY: ${body}` : '  BODY: [no body content - use SUBJECT alone]'

  return [
    `  EMAIL ${index + 1}:`,
    `  FROM: ${email.from}`,
    `  DATE: ${email.date}`,
    `  SUBJECT: ${email.subject}`,
    ...(email.listUnsubscribe ? [`  UNSUBSCRIBE: ${email.listUnsubscribe}`] : []),
    bodyLine,
  ].join('\n')
}

/**
 * Renders one group's emails as a prompt section.
 *
 * `partOf` marks a group too large for a single request, so the model is told
 * it is seeing a slice of a longer history rather than the whole relationship -
 * without it, it would read a mid-history slice as a subscription that started
 * and ended inside that window.
 */
export function renderSenderSection(
  group: SenderGroup,
  emails: EmailData[],
  partOf?: { part: number; total: number },
): string {
  const slice = partOf ? ` - PART ${partOf.part} OF ${partOf.total}, DATE-ORDERED SLICE` : ''

  const header = group.multiMerchant
    ? `=== PAYMENT PROCESSOR: ${group.domain} (${emails.length} emails${slice}) ===
NOTE: this sender is a payment processor, NOT the service being paid for. Each
email here may be for a DIFFERENT merchant - read the merchant out of the body
and never merge two emails just because they share this sender.`
    : `=== SENDER DOMAIN: ${group.domain} (${emails.length} emails${slice}) ===`

  return `${header}
${emails.map(renderEmail).join('\n\n')}`
}

function unitFrom(label: string, text: string, emailCount: number): AnalysisUnit {
  return { label, text, emailCount, estimatedTokens: estimateTokens(text) }
}

/**
 * Splits one sender's emails into date-ordered slices that each fit the budget.
 *
 * The old packing had no answer here: a group too large to fit alone was sent
 * anyway and dropped whole when it failed. Slicing chronologically keeps each
 * plan's receipts adjacent, and consolidateSubscriptionPeriods stitches the
 * resulting timelines back together downstream.
 */
function splitOversizedGroup(group: SenderGroup, budget: number): AnalysisUnit[] {
  const slices: EmailData[][] = [group.emails]
  const finished: EmailData[][] = []

  while (slices.length > 0) {
    const slice = slices.shift()!
    const fits = estimateTokens(renderSenderSection(group, slice)) <= budget

    if (fits || slice.length < 2) {
      finished.push(slice)
      continue
    }

    const mid = Math.ceil(slice.length / 2)
    slices.unshift(slice.slice(0, mid), slice.slice(mid))
  }

  return finished.map((slice, index) => {
    const partOf = { part: index + 1, total: finished.length }
    return unitFrom(
      `${group.domain} (${partOf.part}/${partOf.total})`,
      renderSenderSection(group, slice, finished.length > 1 ? partOf : undefined),
      slice.length,
    )
  })
}

/**
 * Turns sender groups into the units that will each become one LLM call.
 *
 * One call per sender is the default: it keeps the context focused on a single
 * service, gives that service the whole output budget, and confines a failure
 * to one vendor instead of everything packed alongside it. Only the long tail
 * of one-off senders is batched, purely to avoid paying the system prompt over
 * and over for a single short email.
 */
export function buildAnalysisUnits(groups: SenderGroup[]): AnalysisUnit[] {
  const budget =
    EMAIL_DISCOVERY_CONFIG.batch.maxInputTokensPerChunk -
    estimateTokens(BATCH_ANALYSIS_SYSTEM_PROMPT)

  const units: AnalysisUnit[] = []
  let tail: { text: string; emailCount: number; tokens: number; domains: string[] } | null = null

  const flushTail = () => {
    if (!tail) return
    units.push(unitFrom(`tail: ${tail.domains.join(', ')}`, tail.text, tail.emailCount))
    tail = null
  }

  for (const group of groups) {
    const text = renderSenderSection(group, group.emails)
    const tokens = estimateTokens(text)

    if (tokens > budget) {
      flushTail()
      units.push(...splitOversizedGroup(group, budget))
      continue
    }

    if (tokens > TAIL_SECTION_MAX_TOKENS) {
      units.push(unitFrom(group.domain, text, group.emails.length))
      continue
    }

    if (tail && tail.tokens + tokens > TAIL_BATCH_MAX_TOKENS) flushTail()

    if (!tail) {
      tail = { text, emailCount: group.emails.length, tokens, domains: [group.domain] }
      continue
    }

    tail.text += `\n\n${text}`
    tail.emailCount += group.emails.length
    tail.tokens += tokens
    tail.domains.push(group.domain)
  }

  flushTail()

  return units
}

function calculateTimeout(estimatedTokens: number): number {
  const dynamicTimeout = API_TIMEOUT_MS + (estimatedTokens / 1_000) * TIMEOUT_PER_1K_TOKENS_MS
  return Math.min(Math.round(dynamicTimeout), MAX_API_TIMEOUT_MS)
}

/**
 * Recovers the completed array elements from a JSON response that was cut off
 * mid-generation, by truncating to the last closed subscription object and
 * re-closing the array and root object.
 */
export function repairTruncatedSubscriptionsJson(text: string): string | null {
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
 * Runs one unit through the model, retrying when the response comes back
 * unparseable. A mid-stream provider cutoff yields valid-but-truncated JSON;
 * retrying gets the full set, whereas salvaging the partial silently drops
 * subscriptions. Salvage is the last resort, only once retries are exhausted.
 */
async function generateUnitAnalysis(
  unit: AnalysisUnit,
  model: Parameters<typeof generateObject>[0]['model'],
  maxOutputTokens: number | undefined,
): Promise<{ subscriptions: RawSubscription[]; usage: TokenUsage }> {
  const system = BATCH_ANALYSIS_SYSTEM_PROMPT
  const timeout = calculateTimeout(unit.estimatedTokens)
  const usage: TokenUsage = { inputTokens: 0, outputTokens: 0 }

  let lastUnparseableText: string | undefined

  for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      const result = await withTimeout(
        generateObject({
          model,
          schema: BatchEmailAnalysisResultSchema,
          system,
          prompt: unit.text,
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
        `unit analysis (${unit.emailCount} emails, ~${unit.estimatedTokens} tokens)`,
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
      `Unit ${unit.label} produced unparseable output on all ${MAX_GENERATION_ATTEMPTS} attempts`,
    )
  }

  let salvaged: RawSubscription[]
  try {
    salvaged = BatchEmailAnalysisResultSchema.parse(JSON.parse(repaired)).subscriptions
  } catch (error) {
    throw new Error(
      `Unit ${unit.label} salvage failed: ${error instanceof Error ? error.message : 'unknown error'}`,
    )
  }

  return { subscriptions: salvaged, usage }
}

/** A unit whose analysis could not be recovered, so its emails yielded nothing. */
interface FailedUnit {
  label: string
  emailCount: number
  error: string
}

export interface BatchAnalysisResult {
  subscriptions: DiscoveredSubscription[]
  totalUsage: TokenUsage
}

/**
 * A unit's outcome, kept per-unit rather than flattened so a group can be
 * re-examined and have its own results replaced.
 */
interface UnitOutcome {
  unit: AnalysisUnit
  subscriptions: DiscoveredSubscription[]
  failure?: FailedUnit
}

async function runUnit(
  unit: AnalysisUnit,
  model: Parameters<typeof generateObject>[0]['model'],
  maxOutputTokens: number | undefined,
  totalUsage: TokenUsage,
): Promise<UnitOutcome> {
  try {
    const { subscriptions: raw, usage } = await generateUnitAnalysis(unit, model, maxOutputTokens)

    totalUsage.inputTokens += usage.inputTokens
    totalUsage.outputTokens += usage.outputTokens

    const subscriptions: DiscoveredSubscription[] = []

    for (const sub of raw) {
      const result = normalizeDiscoveredSubscription(sub)
      if (result.ok) subscriptions.push(result.subscription)
    }

    return { unit, subscriptions }
  } catch (error) {
    // One unit is one sender, so a failure here costs that vendor and nothing
    // else. The caller is told which, rather than the scan quietly shrinking.
    const message = error instanceof Error ? error.message : 'unknown error'
    console.error(`[Email Analysis] Unit ${unit.label} failed:`, error)

    return {
      unit,
      subscriptions: [],
      failure: { label: unit.label, emailCount: unit.emailCount, error: message },
    }
  }
}

export async function analyzeEmailsBatch(
  emails: EmailData[],
  config?: AnalysisConfig,
): Promise<BatchAnalysisResult> {
  const empty: BatchAnalysisResult = {
    subscriptions: [],
    totalUsage: { inputTokens: 0, outputTokens: 0 },
  }

  if (emails.length === 0) return empty

  const units = buildAnalysisUnits(groupEmailsBySender(emails))
  if (units.length === 0) return empty

  const totalUsage: TokenUsage = { inputTokens: 0, outputTokens: 0 }

  const model = config?.byokConfig ? createModel(config.byokConfig) : getDefaultModel()

  // Only the default model's ceiling is known. A BYOK model is whatever the
  // user picked, so leave the limit unset and let the provider apply its own
  // maximum rather than guessing one that truncates or gets rejected.
  const maxOutputTokens = config?.byokConfig
    ? undefined
    : EMAIL_DISCOVERY_CONFIG.analysisModel.maxOutputTokens

  const outcomes = await mapWithConcurrency(units, MAX_CONCURRENT_ANALYSES, (unit) =>
    runUnit(unit, model, maxOutputTokens, totalUsage),
  )

  const subscriptions = filterSingletonOneTimePayments(
    deduplicateAndMerge(outcomes.flatMap((o) => o.subscriptions)),
  )

  return {
    subscriptions,
    totalUsage,
  }
}
