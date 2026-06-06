import type { Database } from '@/lib/database.types'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { BILLING_PERIODS, SUBSCRIPTION_CATEGORIES } from '@/lib/schemas/subscription'
import { STORE_URL_HOSTNAMES } from '@/lib/config/urls'

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

export type NormalizationResult =
  | { ok: true; subscription: DiscoveredSubscription }
  | { ok: false; field: string; reason: string }

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

function normalizePriceByBillingPeriod(price: number, billingPeriod?: BillingPeriod): number {
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
}): NormalizationResult {
  if (!raw.service_name) return { ok: false, field: 'service_name', reason: 'Missing service name' }
  if (!raw.price || raw.price === 0)
    return { ok: false, field: 'price', reason: 'Missing or zero price' }
  if (!raw.start_date) return { ok: false, field: 'start_date', reason: 'Missing start date' }

  const endDate = raw.end_date || raw.start_date
  let autoRenew = raw.auto_renew ?? false

  if (endDate === raw.start_date) autoRenew = false
  if (new Date(endDate) < new Date()) autoRenew = false

  const category =
    raw.category && VALID_CATEGORIES.includes(raw.category as SubscriptionCategory)
      ? (raw.category as SubscriptionCategory)
      : undefined

  const monthlyPrice = normalizePriceByBillingPeriod(
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

  return sanitize(candidate)
}

function earlierDate(a: string, b: string): string {
  return a && b ? (a < b ? a : b) : a || b
}

function laterDate(a: string, b: string): string {
  return a && b ? (a > b ? a : b) : a || b
}

// Groups by name key + price bucket; merges date ranges within each bucket.
// Single pass replaces the previous two-step dedup → merge sequence.
export function deduplicateAndMerge(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const acc: Record<string, DiscoveredSubscription> = {}

  for (const sub of subscriptions) {
    const nameKey = sub.service_name.toLowerCase().trim()
    const directKey = `${nameKey}_${sub.price}`
    const key =
      Object.keys(acc).find(
        (k) =>
          k.startsWith(`${nameKey}_`) &&
          acc[k].service_name.toLowerCase().trim() === nameKey &&
          acc[k].price === sub.price,
      ) ?? directKey

    if (!acc[key]) {
      acc[key] = { ...sub, end_date: sub.end_date || '' }
    } else {
      const e = acc[key]
      acc[key] = {
        ...e,
        start_date: earlierDate(e.start_date, sub.start_date),
        end_date: laterDate(e.end_date, sub.end_date),
        category: e.category || sub.category,
        currency: e.currency || sub.currency,
        service_url: e.service_url || sub.service_url,
        unsubscribe_url: e.unsubscribe_url || sub.unsubscribe_url,
        payment_method: e.payment_method || sub.payment_method,
        auto_renew: e.auto_renew || sub.auto_renew,
      }
    }
  }

  return Object.values(acc)
}
