import type { DiscoveredSubscription } from '@/lib/types/forms'
import { STORE_URL_HOSTNAMES } from '@/lib/config/urls'
import { CORPORATE_SUFFIXES, STANDALONE_TIER_WORDS } from '@/lib/utils/service-key'

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

// The billing cycle is not part of the service's name. Stage A is told to put it
// in stated_period and nowhere else, and does not reliably obey - "SocialClaw
// Starter Monthly", "Apify monthly" - and the catalog is full of the same thing
// from the old pipeline ("Canva Pro - Monthly", "Clideo Month"). Stripping it
// also collapses "CapCut ... Monthly" and "CapCut ... Yearly" onto one service,
// which is right: the cycle lives in the period column, not in the name.

// Names whose cycle word IS the brand. No structural rule separates "Texas
// Monthly" from "Nebula MONTHLY" - both are two words ending in a cycle - so
// the ones that turn up get listed. Checked against the whole name, lowercased.
const CYCLE_WORD_IS_THE_BRAND = new Set(['texas monthly'])

// The adverb form only ever means a billing cycle.
const CYCLE_ADVERBS = ['monthly', 'yearly', 'annually', 'annual', 'weekly', 'quarterly']

// The noun form is a unit of time and turns up inside real names - "London
// Fashion Week", "Shark Week" - so it only counts as billing when a number
// comes with it. Every genuine case in the catalog has one: "Canva Pro 1
// Month", "NordVPN 12-month", "GeekSquad 3-Year", "Restoro - 1 Year".
const CYCLE_NOUNS = ['month', 'year', 'week', 'quarter']

const SEP = '[\\s,:|\u2013\u2014-]'
// "for 1 month", "per year". "Bi-Monthly" and "Semi-Annual" go with the cycle
// rather than being left behind as a dangling "Bi".
const CYCLE_LEAD = `(?:(?:for|per)\\s+)?(?:(?:bi|semi|tri)[\\s-]*)?`
// The count is taken with the cycle, hyphen and all, or "NordVPN 12-month"
// becomes "NordVPN 12".
const CYCLE_COUNT = `(?:\\d+[\\s-]*)`

const TRAILING_CYCLE_PATTERNS = [
  new RegExp(`${SEP}+${CYCLE_LEAD}${CYCLE_COUNT}?(?:${CYCLE_ADVERBS.join('|')})\\.?$`, 'i'),
  new RegExp(`${SEP}+${CYCLE_LEAD}${CYCLE_COUNT}(?:${CYCLE_NOUNS.join('|')})s?\\.?$`, 'i'),
]

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
  // A trailing ellipsis is a card-statement descriptor the bank cut short
  // ("Ancestry.com Operati..."). Drop the marker but KEEP the stub: these are
  // real subscriptions - one in the catalog is a live $24.99/mo auto-renewing
  // plan - so rejecting the name would delete money the user is still paying.
  // The remainder is enough for serviceKey to match it to a fuller sibling.
  const original = name.trim().replace(/\s*(\.{2,}|…)$/, '')
  if (CYCLE_WORD_IS_THE_BRAND.has(original.toLowerCase())) return original
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

    if (!changed) {
      for (const pattern of TRAILING_CYCLE_PATTERNS) {
        if (!pattern.test(cleaned)) continue
        cleaned = cleaned.replace(pattern, '').trim()
        changed = true
        break
      }
    }
  }

  // "Canva Pro -" and "EMBY |" once the cycle behind them is gone.
  cleaned = cleaned.replace(/[\s,:|\u2013\u2014-]+$/, '').trim()
  // Stripping the suffix left only a tier word ("PRO", "Max") or nothing at all,
  // neither of which is a usable service name - keep what we started with.
  if (!cleaned || STANDALONE_TIER_WORDS.includes(cleaned.toLowerCase())) return original
  return cleaned
}

function isStoreUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url.startsWith('http') ? url : `https://${url}`)
    return STORE_URL_HOSTNAMES.has(hostname.replace('www.', ''))
  } catch {
    return false
  }
}

/**
 * Final sanity pass over a subscription the cadence classifier produced.
 *
 * The classifier decides recurrence; this decides whether the result is fit to
 * store. Name cleaning lives here rather than in the classifier because the
 * display name and the grouping key are different things: the key ignores
 * punctuation and case to match receipts, while the name is what the user reads.
 */
export function normalizeClassifiedSubscription(
  subscription: DiscoveredSubscription,
): NormalizationResult {
  return sanitize({
    ...subscription,
    service_name: cleanServiceName(subscription.service_name),
    service_url:
      subscription.service_url && !isStoreUrl(subscription.service_url)
        ? subscription.service_url
        : undefined,
  })
}
