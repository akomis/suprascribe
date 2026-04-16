import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import type { Database } from '@/lib/database.types'
import {
  BatchEmailAnalysisResultSchema,
  BILLING_PERIODS,
  SUBSCRIPTION_CATEGORIES,
} from '@/lib/schemas/subscription'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateObject } from 'ai'
import { createModel, type ProviderConfig } from './ai-provider'

type BillingPeriod = (typeof BILLING_PERIODS)[number]

type SubscriptionCategory = Database['public']['Enums']['SUBSCRIPTION_CATEGORY']

const VALID_CATEGORIES: SubscriptionCategory[] = [...SUBSCRIPTION_CATEGORIES]

import { stripHtmlFromEmail } from '@/lib/utils/email-html-parser'
import { getServiceNameKey, serviceNamesMatch } from '@/lib/utils/subscription-comparison'
import { sanitizeDiscoveredSubscription } from '@/lib/utils/subscription-validation'

const SERVICE_NAME_SUFFIX_BLOCKLIST = [
  'plan',
  'subscription',
  'membership',
  'tier',
  'account',
  'service',
  'billing',
]

const STANDALONE_TIER_WORDS = [
  'basic',
  'pro',
  'plus',
  'premium',
  'free',
  'standard',
  'enterprise',
  'team',
  'max',
  'starter',
  'lite',
  'advanced',
  'ultimate',
  'business',
  'personal',
  'individual',
  'family',
  'student',
]

function normalizeToMonthlyPrice(price: number, billingPeriod?: BillingPeriod): number {
  if (!billingPeriod) {
    return price
  }

  switch (billingPeriod) {
    case 'yearly':
      return price / 12
    case 'quarterly':
      return price / 3
    case 'weekly':
      return price * 4.33
    case 'monthly':
    default:
      return price
  }
}

function cleanServiceName(name: string): string {
  if (!name) return name

  const original = name.trim()
  let cleaned = original

  let changed = true
  while (changed) {
    changed = false
    for (const suffix of SERVICE_NAME_SUFFIX_BLOCKLIST) {
      const regex = new RegExp(`\\s+${suffix}$`, 'i')
      if (regex.test(cleaned)) {
        cleaned = cleaned.replace(regex, '').trim()
        changed = true
        break
      }
    }
  }

  if (STANDALONE_TIER_WORDS.includes(cleaned.toLowerCase())) {
    console.warn(
      `[cleanServiceName] Result "${cleaned}" is a standalone tier word, keeping original: "${original}"`,
    )
    return original
  }

  return cleaned
}

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

function getDefaultModel() {
  const apiKey = process.env.MODEL_API_KEY

  if (!apiKey) {
    throw new Error(
      'MODEL_API_KEY environment variable is not set. Please add it to your .env.local file.',
    )
  }

  const openrouter = createOpenRouter({
    apiKey,
    headers: {
      'HTTP-Referer': 'https://suprascribe.com',
      'X-Title': 'Suprascribe',
    },
  })
  return openrouter(EMAIL_DISCOVERY_CONFIG.analysisModel.modelName)
}

export interface EmailData {
  subject: string
  body: string
  from?: string
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

const STORE_URL_HOSTNAMES = new Set([
  'apps.apple.com',
  'itunes.apple.com',
  'play.google.com',
  'market.android.com',
])

function isStoreUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`)
    return STORE_URL_HOSTNAMES.has(hostname.replace('www.', ''))
  } catch {
    return false
  }
}

function transformToSubscription(raw: {
  service_name: string
  price: number
  start_date: string
  end_date?: string | null
  auto_renew?: boolean | null
  category?: string | null
  billing_period?: string | null
  currency?: string | null
  service_url?: string | null
  unsubscribe_url?: string | null
  payment_method?: string | null
}): DiscoveredSubscription | null {
  if (!raw.service_name || !raw.price || raw.price === 0 || !raw.start_date) {
    return null
  }

  const endDate = raw.end_date || raw.start_date
  let autoRenew = raw.auto_renew ?? false

  if (endDate === raw.start_date) autoRenew = false
  if (new Date(endDate) < new Date()) autoRenew = false

  const category =
    raw.category && VALID_CATEGORIES.includes(raw.category as SubscriptionCategory)
      ? (raw.category as SubscriptionCategory)
      : undefined

  const monthlyPrice = normalizeToMonthlyPrice(
    raw.price,
    raw.billing_period as BillingPeriod | undefined,
  )

  const candidate = {
    service_name: cleanServiceName(raw.service_name),
    price: monthlyPrice,
    currency: raw.currency ?? undefined,
    start_date: raw.start_date,
    end_date: endDate,
    category,
    service_url: raw.service_url && !isStoreUrl(raw.service_url) ? raw.service_url : undefined,
    unsubscribe_url: raw.unsubscribe_url ?? undefined,
    payment_method: raw.payment_method ?? undefined,
    auto_renew: autoRenew,
  }

  return sanitizeDiscoveredSubscription(candidate)
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
      system: EMAIL_DISCOVERY_CONFIG.batchAnalysisSystemPrompt,
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
    const validated = transformToSubscription(sub)
    if (validated) {
      subscriptions.push(validated)
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
  onProgress?: (message: string) => void,
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

    onProgress?.(
      chunks.length > 1
        ? `Analyzing batch ${i + 1}/${chunks.length} (${chunkEmailCount} emails)...`
        : `Analyzing ${chunkEmailCount} emails from ${chunk.size} senders...`,
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
      onProgress?.(`Batch ${i + 1}/${chunks.length} failed, continuing with remaining batches...`)
    }
  }

  const mergedSubscriptions = deduplicateSubscriptions(allSubscriptions)

  console.log(
    `[Email Analysis] Completed: found ${mergedSubscriptions.length} subscriptions from ${emails.length} emails (${allSubscriptions.length} before dedup)`,
  )
  onProgress?.(`Completed analysis: found ${mergedSubscriptions.length} subscriptions`)

  return { subscriptions: mergedSubscriptions, totalUsage }
}

export function mergeSubscriptions(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const processed = subscriptions.map((sub) => ({
    ...sub,
    end_date: sub.end_date || '',
  }))

  const merged = Object.values(
    processed.reduce(
      (acc, sub) => {
        const key = getServiceNameKey(sub.service_name)

        if (!acc[key]) {
          acc[key] = { ...sub }
        } else if (acc[key].price === sub.price) {
          acc[key].start_date =
            acc[key].start_date && sub.start_date
              ? acc[key].start_date < sub.start_date
                ? acc[key].start_date
                : sub.start_date
              : acc[key].start_date || sub.start_date

          acc[key].end_date =
            acc[key].end_date && sub.end_date
              ? acc[key].end_date > sub.end_date
                ? acc[key].end_date
                : sub.end_date
              : acc[key].end_date || sub.end_date
        } else {
          acc[key + '_' + sub.price] = { ...sub }
        }

        return acc
      },
      {} as Record<string, DiscoveredSubscription>,
    ),
  )

  return merged
}

export function deduplicateSubscriptions(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const result: DiscoveredSubscription[] = []

  for (const sub of subscriptions) {
    const existingIndex = result.findIndex((existing) => {
      if (existing.price !== sub.price) return false
      return serviceNamesMatch(existing.service_name, sub.service_name)
    })

    if (existingIndex === -1) {
      result.push(sub)
    } else {
      const existing = result[existingIndex]
      const merged = {
        ...existing,
        service_name: existing.service_name,
        start_date:
          existing.start_date && sub.start_date
            ? existing.start_date < sub.start_date
              ? existing.start_date
              : sub.start_date
            : existing.start_date || sub.start_date,
        end_date:
          existing.end_date && sub.end_date
            ? existing.end_date > sub.end_date
              ? existing.end_date
              : sub.end_date
            : existing.end_date || sub.end_date,
        category: existing.category || sub.category,
        currency: existing.currency || sub.currency,
        service_url: existing.service_url || sub.service_url,
        unsubscribe_url: existing.unsubscribe_url || sub.unsubscribe_url,
        payment_method: existing.payment_method || sub.payment_method,
        auto_renew: existing.auto_renew || sub.auto_renew,
      }
      result[existingIndex] = merged
    }
  }

  return result
}
