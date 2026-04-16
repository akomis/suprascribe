import type { DiscoveredSubscription } from '@/lib/types/forms'

interface ValidationResult {
  valid: boolean
  reason?: string
}

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
]

const MAX_REASONABLE_PRICE = 50000

const MAX_YEARS_IN_FUTURE = 2

function looksLikeEmail(str: string): boolean {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailPattern.test(str.trim())
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
  return GENERIC_SERVICE_NAMES.includes(normalized)
}

function isValidServiceName(serviceName: string | undefined): ValidationResult {
  if (!serviceName || typeof serviceName !== 'string') {
    return { valid: false, reason: 'Service name is empty or not a string' }
  }

  const trimmed = serviceName.trim()

  if (trimmed.length < 2) {
    return { valid: false, reason: `Service name too short: "${trimmed}"` }
  }

  if (trimmed.length > 100) {
    return {
      valid: false,
      reason: `Service name too long (${trimmed.length} chars): "${trimmed.substring(0, 50)}..."`,
    }
  }

  if (looksLikeEmail(trimmed)) {
    return { valid: false, reason: `Service name is an email address: "${trimmed}"` }
  }

  if (looksLikeUrl(trimmed)) {
    return { valid: false, reason: `Service name is a URL: "${trimmed}"` }
  }

  if (isNumericOnly(trimmed)) {
    return { valid: false, reason: `Service name is numeric-only (likely order ID): "${trimmed}"` }
  }

  if (isOverlyGeneric(trimmed)) {
    return {
      valid: false,
      reason: `Service name is overly generic: "${trimmed}" (common word, not a service)`,
    }
  }

  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return { valid: false, reason: `Service name has no alphanumeric characters: "${trimmed}"` }
  }

  return { valid: true }
}

function isValidPrice(price: number | undefined): ValidationResult {
  if (price === undefined || price === null) {
    return { valid: false, reason: 'Price is missing' }
  }

  if (typeof price !== 'number' || isNaN(price)) {
    return { valid: false, reason: `Price is not a valid number: ${price}` }
  }

  if (price === 0) {
    return { valid: false, reason: 'Price is zero' }
  }

  if (price < 0) {
    return { valid: false, reason: `Price is negative: ${price}` }
  }

  if (price > MAX_REASONABLE_PRICE) {
    return {
      valid: false,
      reason: `Price is unreasonably high: ${price} (max: ${MAX_REASONABLE_PRICE})`,
    }
  }

  return { valid: true }
}

function isValidDateString(dateStr: string | undefined): ValidationResult {
  if (!dateStr) {
    return { valid: false, reason: 'Date is empty' }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return { valid: false, reason: `Date has invalid format: "${dateStr}" (expected YYYY-MM-DD)` }
  }

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) {
    return { valid: false, reason: `Date is invalid: "${dateStr}"` }
  }

  const maxFutureDate = new Date()
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + MAX_YEARS_IN_FUTURE)

  if (date > maxFutureDate) {
    return {
      valid: false,
      reason: `Date is too far in future: "${dateStr}" (max: ${MAX_YEARS_IN_FUTURE} years from now)`,
    }
  }

  return { valid: true }
}

function isValidDateRange(
  startDate: string | undefined,
  endDate: string | undefined,
): ValidationResult {
  const startValidation = isValidDateString(startDate)
  if (!startValidation.valid) {
    return { valid: false, reason: `start_date: ${startValidation.reason}` }
  }

  if (!endDate) {
    return { valid: true }
  }

  const endValidation = isValidDateString(endDate)
  if (!endValidation.valid) {
    return { valid: false, reason: `end_date: ${endValidation.reason}` }
  }

  const start = new Date(startDate!)
  const end = new Date(endDate)

  if (end < start) {
    return {
      valid: false,
      reason: `end_date (${endDate}) is before start_date (${startDate})`,
    }
  }

  return { valid: true }
}

export function sanitizeDiscoveredSubscription(
  subscription: DiscoveredSubscription,
): DiscoveredSubscription | null {
  const nameValidation = isValidServiceName(subscription.service_name)
  if (!nameValidation.valid) {
    console.warn(`[Subscription Validation] Rejected subscription: ${nameValidation.reason}`)
    return null
  }

  const priceValidation = isValidPrice(subscription.price)
  if (!priceValidation.valid) {
    console.warn(
      `[Subscription Validation] Rejected subscription "${subscription.service_name}": ${priceValidation.reason}`,
    )
    return null
  }

  const dateValidation = isValidDateRange(subscription.start_date, subscription.end_date)
  if (!dateValidation.valid) {
    console.warn(
      `[Subscription Validation] Rejected subscription "${subscription.service_name}": ${dateValidation.reason}`,
    )
    return null
  }

  return subscription
}
