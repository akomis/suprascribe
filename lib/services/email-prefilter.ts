import { EMAIL_DISCOVERY_CONFIG, type PrefilterMode } from '@/lib/config/email-discovery'
import type { Charge } from '@/lib/schemas/charge'
import { classifyCharges } from '@/lib/services/charge-classifier'
import type { EmailData } from '@/lib/types/email'
import { mapWithConcurrency } from '@/lib/utils/concurrency'
import { stripHtmlFromEmail } from '@/lib/utils/email-html-parser'
import { mentionsRecurrence } from '@/lib/utils/recurrence-language'

/**
 * Asks TypeSafe's Jev (via OpenRouter), one email at a time, what kind of email
 * it is, so only subscription-related email reaches the analysis model.
 *
 * Every failure keeps the email. A rejected email is a subscription that can
 * never be found and that nothing downstream reports missing, where a wrongly
 * kept one costs a few tokens and is still judged by Stage A and the
 * classifier exactly as it is today. So a missing key, an HTTP error, a
 * timeout, an unreadable answer and a scan that runs out of time all mean keep.
 *
 * Nothing about an email's content is logged or leaves this function except to
 * the model itself - callers get the partition and counts.
 */

export const EMAIL_KINDS = [
  'subscription_charge',
  'renewal',
  'cancellation',
  'usage_charge',
  'one_off_purchase',
  'not_billing',
] as const

export type EmailKind = (typeof EMAIL_KINDS)[number]

/** The kinds that reach the analysis model. */
const SUBSCRIPTION_KINDS: readonly EmailKind[] = ['subscription_charge', 'renewal', 'cancellation']

// The subscription_charge description carries most of the weight. Recurrence is
// decided downstream from a merchant's receipts over time, and most of those
// receipts never say they recur - "Your receipt, $15.49" - so asking "does this
// email say it is a subscription" would throw away exactly the evidence the
// classifier needs. A receipt for any service or access counts.
//
// Pay-as-you-go is the exception, and gets a kind of its own so it cannot hide
// inside subscription_charge. A merchant that sells a plan often also bills
// usage on top of it, monthly, from the same address - Apify Starter at $29
// beside "Platform usage $25.09" - and every signal downstream reads that usage
// as a second subscription. Usage is not one: it is spend that follows how much
// was used, the same as buying credits.
const EMAIL_KIND_QUESTION = {
  type: 'choice',
  instructions: 'What kind of email is this, from the point of view of the person who received it?',
  criteria: {
    subscription_charge: [
      'A receipt, invoice or payment confirmation for a subscription, plan, membership, software, app, streaming, cloud or online service billed at a set price',
      'Includes plain receipts that never say the charge recurs, e.g. "Your receipt from Acme - $15.49"',
      'Includes plan upgrades, downgrades and refunds of such a charge',
      'An invoice that bills a plan fee counts here even when it also lists usage lines',
    ],
    renewal: [
      'A notice that a plan, subscription or membership renews or will be charged soon',
      'A free trial that is ending or converting to a paid plan',
    ],
    cancellation: [
      'A subscription or membership was cancelled, expired or paused',
      'A payment for a subscription failed or was declined, or the card needs updating',
    ],
    usage_charge: [
      'Pay-as-you-go or metered usage: a charge for how much was used, e.g. "platform usage", compute units, API usage, overage beyond the plan',
      'Buying credits, tokens, a prepaid balance or a top-up',
    ],
    one_off_purchase: [
      'Payment for a single purchase: physical goods, a retail order, tickets, a fine or a one-time fee',
    ],
    not_billing: [
      'No payment involved: marketing, promotions, newsletters, shipping or tracking updates, security alerts, sign-in codes, account notices',
    ],
  } satisfies Record<EmailKind, string[]>,
} as const

export interface PrefilterResult {
  /** Emails to analyze, in input order. */
  kept: EmailData[]
  /** Emails the model judged not subscription-related. Identity, not content. */
  rejected: Set<EmailData>
  /** Jev's top answer, counted per kind. */
  byKind: Record<EmailKind, number>
  /** Kept on evidence in code, without asking the model. */
  hardKept: number
  /** Kept because the model gave no usable answer. */
  errored: number
  inputTokens: number
  /** What OpenRouter billed for the decisions. */
  costUsd: number
}

export interface PrefilterOptions {
  /** Reduces a From header to the sending service's domain. */
  senderDomain: (from: string | undefined) => string
  /** Body characters sent per email. */
  maxBodyChars: number
  apiKey?: string
  hardKeeps?: boolean
  fetchImpl?: typeof fetch
  now?: () => number
  sleep?: (ms: number) => Promise<void>
}

// Worth retrying: rate limited and overloaded are both documented as transient.
const RETRYABLE_STATUSES = new Set([429, 529])

const BACKOFF_BASE_MS = 500

type Answer = {
  kind: EmailKind
  /** Probability that the email is one of SUBSCRIPTION_KINDS. */
  subscriptionProbability: number
  inputTokens: number
  costUsd: number
} | null

function renderState(email: EmailData, maxBodyChars: number) {
  const body = stripHtmlFromEmail(email.body || '')
  return {
    from: email.from,
    subject: email.subject,
    body: body.length > maxBodyChars ? body.slice(0, maxBodyChars) : body,
  }
}

function isKind(value: unknown): value is EmailKind {
  return typeof value === 'string' && (EMAIL_KINDS as readonly string[]).includes(value)
}

function readAnswer(payload: unknown): Answer {
  const data = payload as {
    answers?: { email_kind?: { choice?: unknown; probabilities?: Record<string, unknown> } }
    usage?: { input_tokens?: unknown; cost?: unknown }
  }
  const answer = data?.answers?.email_kind
  if (!answer || !isKind(answer.choice) || !answer.probabilities) return null

  let subscriptionProbability = 0
  for (const kind of SUBSCRIPTION_KINDS) {
    const p = answer.probabilities[kind]
    if (typeof p !== 'number' || Number.isNaN(p)) return null
    subscriptionProbability += p
  }

  return {
    kind: answer.choice,
    subscriptionProbability,
    inputTokens: typeof data.usage?.input_tokens === 'number' ? data.usage.input_tokens : 0,
    costUsd: typeof data.usage?.cost === 'number' ? data.usage.cost : 0,
  }
}

export async function prefilterEmails(
  emails: EmailData[],
  options: PrefilterOptions,
): Promise<PrefilterResult> {
  const config = EMAIL_DISCOVERY_CONFIG.prefilter
  const {
    senderDomain,
    maxBodyChars,
    apiKey = process.env.MODEL_API_KEY,
    hardKeeps = config.hardKeeps,
    fetchImpl = fetch,
    now = Date.now,
    sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  } = options

  const dedicated = new Set<string>(EMAIL_DISCOVERY_CONFIG.dedicatedBillingSenders)
  const deadline = now() + config.deadlineMs

  const byKind = Object.fromEntries(EMAIL_KINDS.map((kind) => [kind, 0])) as Record<
    EmailKind,
    number
  >
  let hardKept = 0
  let errored = 0
  let inputTokens = 0
  let costUsd = 0

  const ask = async (email: EmailData): Promise<Answer> => {
    if (!apiKey) return null

    const body = JSON.stringify({
      model: config.model,
      state: renderState(email, maxBodyChars),
      questions: { email_kind: EMAIL_KIND_QUESTION },
    })

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      const remaining = deadline - now()
      if (remaining <= 0) return null

      const controller = new AbortController()
      const timer = setTimeout(
        () => controller.abort(),
        Math.min(config.requestTimeoutMs, remaining),
      )

      try {
        const response = await fetchImpl(config.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body,
          signal: controller.signal,
        })

        if (response.ok) return readAnswer(await response.json())
        if (!RETRYABLE_STATUSES.has(response.status)) {
          console.error(`[Prefilter] Jev returned ${response.status}; keeping email`)
          return null
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error'
        console.error(`[Prefilter] Jev request failed (${message}); keeping email`)
        return null
      } finally {
        clearTimeout(timer)
      }

      if (attempt < config.maxAttempts) await sleep(BACKOFF_BASE_MS * 2 ** (attempt - 1))
    }

    return null
  }

  const verdicts = await mapWithConcurrency(emails, config.concurrency, async (email) => {
    // Evidence we can read ourselves, when enabled, is never put to a model
    // that could overrule it: a dedicated billing host sends nothing but
    // billing mail, and anything that talks about recurring is what Stage A
    // must see.
    if (
      hardKeeps &&
      (dedicated.has(senderDomain(email.from)) ||
        mentionsRecurrence(`${email.subject}\n${email.body}`))
    ) {
      hardKept += 1
      return true
    }

    const answer = await ask(email)
    if (!answer) {
      errored += 1
      return true
    }

    byKind[answer.kind] += 1
    inputTokens += answer.inputTokens
    costUsd += answer.costUsd
    return answer.subscriptionProbability >= config.keepThreshold
  })

  const kept: EmailData[] = []
  const rejected = new Set<EmailData>()
  emails.forEach((email, i) => (verdicts[i] ? kept.push(email) : rejected.add(email)))

  return { kept, rejected, byKind, hardKept, errored, inputTokens, costUsd }
}

/** What the pre-filter did on one scan. Counts only, never content. */
export interface PrefilterReport {
  mode: Exclude<PrefilterMode, 'off'>
  /** Emails judged not subscription-related. Analyzed anyway under shadow. */
  rejected: number
  byKind: Record<EmailKind, number>
  hardKept: number
  errored: number
  inputTokens: number
  costUsd: number
  /**
   * Estimated analysis-model input tokens the rejected emails account for:
   * saved under enforce, what would have been saved under shadow.
   */
  llmTokensSaved: number
  /**
   * Shadow only: subscriptions this scan found that it would not have found had
   * the rejected emails been dropped. It should be zero before enforce is used.
   */
  lostSubscriptions?: number
  /** Shadow only: charges read from emails the filter rejected. */
  lostCharges?: number
}

/** A charge and the email it was read from, paired for pre-filter accounting. */
export interface SourcedCharge {
  charge: Charge
  email: EmailData
}

/**
 * Which pre-filter mode this scan runs in. BYOK users chose which provider sees
 * their mail, so the pre-filter is never added to their scans.
 */
export function resolvePrefilterMode(configured: PrefilterMode, isByok: boolean): PrefilterMode {
  return isByok ? 'off' : configured
}

/**
 * What dropping the rejected emails would have cost this scan.
 *
 * The classifier is pure and deterministic, so the counterfactual is exact:
 * classify again without the charges read from rejected emails, and every
 * subscription the real run kept that this one does not is a subscription the
 * filter would have lost.
 */
export function measurePrefilterLoss(
  keptMerchantKeys: Iterable<string>,
  sourced: SourcedCharge[],
  rejected: Set<EmailData>,
): { lostSubscriptions: number; lostCharges: number } {
  const surviving = sourced.filter((s) => !rejected.has(s.email)).map((s) => s.charge)
  const lostCharges = sourced.length - surviving.length
  if (lostCharges === 0) return { lostSubscriptions: 0, lostCharges: 0 }

  const stillKept = new Set(
    classifyCharges(surviving)
      .verdicts.filter((v) => v.outcome === 'recurring')
      .map((v) => v.merchant_key),
  )

  let lostSubscriptions = 0
  for (const key of keptMerchantKeys) if (!stillKept.has(key)) lostSubscriptions += 1

  return { lostSubscriptions, lostCharges }
}
