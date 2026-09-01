import type { Database } from '@/lib/database.types'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { BILLING_PERIODS, SUBSCRIPTION_CATEGORIES } from '@/lib/schemas/subscription'
import { STORE_URL_HOSTNAMES } from '@/lib/config/urls'
import { isOneTimePayment } from '@/lib/utils/subscription-period-extension'

type BillingPeriod = (typeof BILLING_PERIODS)[number]
type SubscriptionCategory = Database['public']['Enums']['SUBSCRIPTION_CATEGORY']

const VALID_CATEGORIES: SubscriptionCategory[] = [...SUBSCRIPTION_CATEGORIES]

const GENERIC_SERVICE_NAMES = [
  'payment',
  'receipt',
  'invoice',
  'bill',
  'billing',
  'charge',
  'subscription',
  'service',
  'purchase',
  'order',
  'confirmation',
] as const

const MAX_REASONABLE_PRICE = 50_000

const MAX_YEARS_IN_FUTURE = 2

const SERVICE_NAME_SUFFIX_BLOCKLIST = [
  'plan',
  'subscription',
  'membership',
  'tier',
  'account',
  'service',
  'billing',
]

// Legal-entity suffixes, stripped so an invoice made out to the company reads as
// the product the user recognises: "There's An AI For That SRL" is the same
// thing as "There's An AI For That". The prompt asks for this too, but a receipt
// that quotes the registered name tends to win, so it is enforced here as well.
//
// Deliberately excludes ambiguous short words that end real product names -
// "Co", "AS", "SA", "KG", "Spa" - where stripping would damage a legitimate
// name more often than it would clean one up.
const CORPORATE_SUFFIXES = [
  'inc',
  'incorporated',
  'corp',
  'corporation',
  'llc',
  'ltd',
  'limited',
  'gmbh',
  'srl',
  'sarl',
  'sas',
  'bv',
  'nv',
  'ab',
  'oy',
  'oyj',
  'aps',
  'pty',
  'plc',
  'ag',
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

// Credit and token top-ups are single charges, but the model keeps labelling
// them MONTHLY because repeat purchases from one company look like a cadence.
// A name carrying one of these words is treated as a one-off unless the email
// explicitly said it auto-renews, which is how a genuine "monthly credits
// allowance" plan keeps its billing period.
// Kept deliberately narrow. "Pack" and "Bundle" are excluded despite reading as
// one-off wording, because real recurring plans are named that way ("Disney
// Bundle", "Family Pack") and a false positive here silently drops a
// subscription's billing period.
const ONE_TIME_NAME_PATTERN = /\b(credits?|tokens?|top[\s-]?ups?|recharges?|refills?)\b/i

function looksLikeOneTimePurchase(name: string): boolean {
  return ONE_TIME_NAME_PATTERN.test(name)
}

export type NormalizationResult =
  { ok: true; subscription: DiscoveredSubscription } | { ok: false; field: string; reason: string }

interface ValidationResult {
  valid: boolean
  error?: { field: string; reason: string }
}

function pass(): ValidationResult {
  return { valid: true }
}

function fail(field: string, reason: string): ValidationResult {
  return { valid: false, error: { field, reason } }
}

function looksLikeEmail(str: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str.trim())
}

function looksLikeUrl(str: string): boolean {
  const trimmed = str.trim().toLowerCase()
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.includes('://')
}

function isNumericOnly(str: string): boolean {
  const cleaned = str.replace(/[-_#\s]/g, '')
  return /^\d+$/.test(cleaned) && cleaned.length > 0
}

function isOverlyGeneric(str: string): boolean {
  const normalized = str.trim().toLowerCase()
  return (GENERIC_SERVICE_NAMES as readonly string[]).includes(normalized)
}

function validateServiceName(name: string | undefined): ValidationResult {
  if (!name || typeof name !== 'string') return fail('service_name', 'Service name is empty')
  const t = name.trim()
  if (t.length < 2) return fail('service_name', `Service name too short: "${t}"`)
  if (t.length > 100)
    return fail(
      'service_name',
      `Service name too long (${t.length} chars): "${t.substring(0, 50)}..."`,
    )
  if (looksLikeEmail(t)) return fail('service_name', `Service name is an email address: "${t}"`)
  if (looksLikeUrl(t)) return fail('service_name', `Service name is a URL: "${t}"`)
  if (isNumericOnly(t)) return fail('service_name', `Service name is numeric-only: "${t}"`)
  if (isOverlyGeneric(t)) return fail('service_name', `Service name is overly generic: "${t}"`)
  if (!/[a-zA-Z0-9]/.test(t))
    return fail('service_name', `Service name has no alphanumeric characters: "${t}"`)
  return pass()
}

function validatePrice(price: number | undefined): ValidationResult {
  if (price === undefined || price === null) return fail('price', 'Price is missing')
  if (typeof price !== 'number' || isNaN(price))
    return fail('price', `Price is not a valid number: ${price}`)
  if (price === 0) return fail('price', 'Price is zero')
  if (price < 0) return fail('price', `Price is negative: ${price}`)
  if (price > MAX_REASONABLE_PRICE)
    return fail('price', `Price is unreasonably high: ${price} (max: ${MAX_REASONABLE_PRICE})`)
  return pass()
}

function validateDateString(dateStr: string | undefined, field: string): ValidationResult {
  if (!dateStr) return fail(field, 'Date is empty')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
    return fail(field, `Date has invalid format: "${dateStr}" (expected YYYY-MM-DD)`)
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return fail(field, `Date is invalid: "${dateStr}"`)
  const maxFuture = new Date()
  maxFuture.setFullYear(maxFuture.getFullYear() + MAX_YEARS_IN_FUTURE)
  if (date > maxFuture)
    return fail(
      field,
      `Date is too far in future: "${dateStr}" (max: ${MAX_YEARS_IN_FUTURE} years)`,
    )
  return pass()
}

function validateDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
): ValidationResult {
  const startResult = validateDateString(startDate, 'start_date')
  if (!startResult.valid) return startResult
  if (!endDate) return pass()
  const endResult = validateDateString(endDate, 'end_date')
  if (!endResult.valid) return endResult
  if (new Date(endDate) < new Date(startDate!))
    return fail('end_date', `end_date (${endDate}) is before start_date (${startDate})`)
  return pass()
}

function sanitize(subscription: DiscoveredSubscription): NormalizationResult {
  const checks = [
    validateServiceName(subscription.service_name),
    validatePrice(subscription.price),
    validateDateRange(subscription.start_date, subscription.end_date),
  ]
  for (const result of checks) {
    if (!result.valid) {
      return { ok: false, field: result.error!.field, reason: result.error!.reason }
    }
  }
  return { ok: true, subscription }
}

function cleanServiceName(name: string): string {
  if (!name) return name
  const original = name.trim()
  let cleaned = original
  let changed = true
  while (changed) {
    changed = false
    // Corporate suffixes may carry a trailing dot ("Acme Inc.") and may sit
    // before a generic suffix ("Acme Ltd Plan"), so both lists are applied
    // repeatedly until the name stops shrinking.
    for (const suffix of [...SERVICE_NAME_SUFFIX_BLOCKLIST, ...CORPORATE_SUFFIXES]) {
      const regex = new RegExp(`[\\s,]+${suffix}\\.?$`, 'i')
      if (regex.test(cleaned)) {
        cleaned = cleaned.replace(regex, '').trim()
        changed = true
        break
      }
    }
  }
  // Stripping the suffix left only a tier word ("Pro", "Max") or nothing at all,
  // neither of which is a usable service name - keep what we started with.
  if (!cleaned || STANDALONE_TIER_WORDS.includes(cleaned.toLowerCase())) return original
  return cleaned
}

// Absence is meaningful: the model is told to omit billing_period for one-time
// purchases and credits, so an undefined result marks a non-recurring charge.
// Defaulting it to MONTHLY here would make every one-off look like a plan.
function toBillingPeriodEnum(raw?: string | null): BillingPeriod | undefined {
  const upper = (raw ?? '').toUpperCase()
  if (upper === 'WEEKLY' || upper === 'MONTHLY' || upper === 'QUARTERLY' || upper === 'YEARLY') {
    return upper as BillingPeriod
  }
  return undefined
}

function isDateString(value?: string | null): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isStoreUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`)
    return STORE_URL_HOSTNAMES.has(hostname.replace('www.', ''))
  } catch {
    return false
  }
}

export function normalizeDiscoveredSubscription(raw: {
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
  is_trial?: boolean | null
  trial_end_date?: string | null
  next_billing_date?: string | null
  receipt_url?: string | null
}): NormalizationResult {
  if (!raw.service_name) return { ok: false, field: 'service_name', reason: 'Missing service name' }
  if (!raw.price || raw.price === 0)
    return { ok: false, field: 'price', reason: 'Missing or zero price' }
  if (!raw.start_date) return { ok: false, field: 'start_date', reason: 'Missing start date' }

  const isOneTime = looksLikeOneTimePurchase(raw.service_name) && raw.auto_renew !== true

  // A one-off charge covers no span, so any end_date the model attached - often
  // the date of a later, separate top-up - is dropped along with the period.
  const endDate = isOneTime
    ? raw.start_date
    : raw.end_date || raw.next_billing_date || raw.start_date
  let autoRenew = raw.auto_renew ?? false

  if (endDate === raw.start_date) autoRenew = false
  if (new Date(endDate) < new Date()) autoRenew = false

  const category =
    raw.category && VALID_CATEGORIES.includes(raw.category as SubscriptionCategory)
      ? (raw.category as SubscriptionCategory)
      : undefined

  const period = isOneTime ? undefined : toBillingPeriodEnum(raw.billing_period)

  const candidate = {
    service_name: cleanServiceName(raw.service_name),
    price: raw.price,
    period,
    currency: raw.currency ?? undefined,
    start_date: raw.start_date,
    end_date: endDate,
    category,
    service_url: raw.service_url && !isStoreUrl(raw.service_url) ? raw.service_url : undefined,
    unsubscribe_url: raw.unsubscribe_url ?? undefined,
    payment_method: raw.payment_method ?? undefined,
    auto_renew: autoRenew,
    is_trial: raw.is_trial ?? undefined,
    // Only kept when it parses; a malformed trial date must not fail the whole
    // candidate, since the subscription itself is still perfectly usable.
    trial_end_date: isDateString(raw.trial_end_date) ? raw.trial_end_date : undefined,
    receipt_url: raw.receipt_url ?? undefined,
  }

  return sanitize(candidate)
}

// Collapses entries describing the exact same billing period, which happens
// when one service's receipts reach the model in more than one chunk. Date
// ranges are deliberately NOT merged here: joining two ranges into one span
// would erase any gap between them, and consolidateSubscriptionPeriods needs
// those gaps to tell a continuous subscription from a lapsed-then-restarted
// one. Only metadata is filled in across the duplicates.
export function deduplicateAndMerge(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const acc = new Map<string, DiscoveredSubscription>()

  for (const sub of subscriptions) {
    const endDate = sub.end_date || sub.start_date
    const key = [
      sub.service_name.toLowerCase().trim(),
      sub.price,
      sub.period ?? 'MONTHLY',
      sub.start_date,
      endDate,
    ].join('_')

    const existing = acc.get(key)

    if (!existing) {
      acc.set(key, { ...sub, end_date: endDate })
      continue
    }

    acc.set(key, {
      ...existing,
      category: existing.category || sub.category,
      currency: existing.currency || sub.currency,
      service_url: existing.service_url || sub.service_url,
      unsubscribe_url: existing.unsubscribe_url || sub.unsubscribe_url,
      payment_method: existing.payment_method || sub.payment_method,
      auto_renew: existing.auto_renew || sub.auto_renew,
    })
  }

  return Array.from(acc.values())
}

/**
 * Drops one-time purchases that appear only once for a service.
 *
 * A single credit top-up or token purchase is not a recurring subscription;
 * showing it would clutter the discovery results. When the same service has
 * multiple one-time purchases, it indicates a repeating top-up pattern and
 * they are kept.
 */
export function filterSingletonOneTimePayments(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const oneTimeCounts = new Map<string, number>()

  for (const sub of subscriptions) {
    if (isOneTimePayment(sub)) {
      const key = sub.service_name.toLowerCase().trim()
      oneTimeCounts.set(key, (oneTimeCounts.get(key) ?? 0) + 1)
    }
  }

  return subscriptions.filter((sub) => {
    if (!isOneTimePayment(sub)) return true
    const key = sub.service_name.toLowerCase().trim()
    return (oneTimeCounts.get(key) ?? 0) > 1
  })
}
