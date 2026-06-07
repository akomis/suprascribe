import type { SubscriptionServiceInsert, UserSubscriptionInsert } from '@/lib/types/database'
import type { CreateSubscriptionFormData } from '@/lib/types/forms'
import { toDateString } from '@/lib/utils/date'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function capitalize(str: string): string {
  if (!str) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function transformFormToDatabaseInserts(
  formData: CreateSubscriptionFormData,
  userId: string,
): {
  service: SubscriptionServiceInsert
  subscription: Omit<UserSubscriptionInsert, 'subscription_service_id'>
} {
  const serviceName = formData.serviceName.trim()
  if (!serviceName) {
    throw new Error('Service name cannot be empty')
  }

  return {
    service: {
      name: serviceName,
      url: formData.serviceUrl,
      ...(formData.serviceUnsubscribeUrl && { unsubscribe_url: formData.serviceUnsubscribeUrl }),
      ...(formData.serviceCategory && { category: formData.serviceCategory }),
    },
    subscription: {
      user_id: userId,
      start_date: formData.startDate,
      end_date: formData.endDate,
      auto_renew: formData.autoRenew,
      price: formData.price,
      currency: formData.currency,
      period: formData.period,
      ...(formData.paymentMethod && { payment_method: formData.paymentMethod }),
      ...(formData.sourceEmail && { source_email: formData.sourceEmail }),
    },
  }
}

export function formatDateDisplay(dateString: string): string {
  const target = new Date(dateString)
  const now = new Date()
  const diffMs = target.getTime() - now.getTime()
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (days === 0) {
    return 'Today'
  }
  if (days === 1) {
    return 'Tomorrow'
  }
  if (days > 1 && days < 10) {
    return `in ${days} days`
  }
  return target.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function toMonthlyCost(price: number, period: string): number {
  switch (period) {
    case 'YEARLY':
      return Math.round((price / 12) * 100) / 100
    case 'QUARTERLY':
      return Math.round((price / 3) * 100) / 100
    case 'WEEKLY':
      return Math.round(price * (52 / 12) * 100) / 100
    default:
      return price
  }
}

/**
 * Format a date string for display using the browser's locale (e.g. "Jan 15, 2024").
 * Use formatDisplayDate (lib/utils/date.ts) for fixed English ordinal format ("January 15th, 2024").
 */
export function formatLocalizedDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function calculateMonthsDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const yearsDiff = end.getFullYear() - start.getFullYear()
  const monthsDiff = end.getMonth() - start.getMonth()

  return yearsDiff * 12 + monthsDiff
}

export function formatDateRangeWithDuration(startDate: string, endDate: string): string {
  const start = formatLocalizedDate(startDate)
  const end = formatLocalizedDate(endDate)
  const months = calculateMonthsDuration(startDate, endDate)

  if (months === 1) {
    return `${start} to ${end} (1 month)`
  } else if (months > 0) {
    return `${start} to ${end} (${months} months)`
  } else {
    return `${start} to ${end}`
  }
}

const NUMERIC_NAV_KEYS = new Set([8, 9, 27, 13, 46, 110, 190])
const NUMERIC_CTRL_KEYS = new Set([65, 67, 86, 88])

export function handleNumericInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  const { keyCode: k, ctrlKey, shiftKey } = e
  const isNavOrEdit =
    NUMERIC_NAV_KEYS.has(k) || (ctrlKey && NUMERIC_CTRL_KEYS.has(k)) || (k >= 35 && k <= 40)
  if (isNavOrEdit) return
  const isDigit = (k >= 48 && k <= 57) || (k >= 96 && k <= 105)
  if (!isDigit || shiftKey) e.preventDefault()
}

function normalizeDateForComparison(dateStr: string | null | undefined): string | null {
  if (!dateStr || dateStr.trim() === '') return null
  const dateOnlyMatch = dateStr.trim().match(/^(\d{4}-\d{2}-\d{2})/)
  if (dateOnlyMatch) return dateOnlyMatch[1]
  try {
    const date = new Date(dateStr.trim())
    return isNaN(date.getTime()) ? null : toDateString(date)
  } catch {
    return null
  }
}

export function isDuplicateSubscription(
  discovered: { service_name: string; start_date: string; end_date: string },
  existing: {
    subscription_service?: { name: string | null } | null
    start_date: string | null
    end_date: string | null
  },
): boolean {
  const existingName = existing.subscription_service?.name || ''
  if (discovered.service_name.toLowerCase().trim() !== existingName.toLowerCase().trim())
    return false
  const ds = normalizeDateForComparison(discovered.start_date)
  const es = normalizeDateForComparison(existing.start_date)
  const de = normalizeDateForComparison(discovered.end_date)
  const ee = normalizeDateForComparison(existing.end_date)
  if (!ds || !es || !de || !ee) return false
  return ds === es && de === ee
}

export function isSubscriptionActive(startDate: string, endDate: string): boolean {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return now >= start && now <= end
}

const VALID_CURRENCY_CODES = [
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'AUD',
  'CAD',
  'CHF',
  'CNY',
  'INR',
  'KRW',
] as const

function normalizeCurrency(currency?: string | null): (typeof VALID_CURRENCY_CODES)[number] {
  if (!currency) return 'USD'

  const normalized = currency.toUpperCase().trim()

  if (VALID_CURRENCY_CODES.includes(normalized as any)) {
    return normalized as (typeof VALID_CURRENCY_CODES)[number]
  }

  return 'USD'
}

export function convertDiscoveredToFormData(discovered: {
  service_name: string
  category?: string | null
  currency?: string | null
  price: number
  period?: string | null
  start_date: string
  end_date: string
  service_url?: string | null
  unsubscribe_url?: string | null
  receipt_url?: string | null
  payment_method?: string | null
  auto_renew?: boolean | null
  source_email?: string | null
}): CreateSubscriptionFormData {
  const serviceName = discovered.service_name.trim()
  if (!serviceName) {
    throw new Error('Service name cannot be empty')
  }

  if (!discovered.start_date || !discovered.start_date.trim()) {
    throw new Error('Start date is required')
  }
  if (!discovered.end_date || !discovered.end_date.trim()) {
    throw new Error('End date is required')
  }

  return {
    serviceName,
    price: discovered.price,
    currency: normalizeCurrency(discovered.currency),
    period: (discovered.period as any) ?? 'MONTHLY',
    startDate: discovered.start_date,
    endDate: discovered.end_date,
    autoRenew: discovered.auto_renew ?? false,
    ...(discovered.service_url && { serviceUrl: discovered.service_url }),
    ...(discovered.unsubscribe_url && { serviceUnsubscribeUrl: discovered.unsubscribe_url }),
    ...(discovered.category && { serviceCategory: discovered.category as any }),
    ...(discovered.receipt_url && { receiptUrl: discovered.receipt_url }),
    ...(discovered.payment_method && { paymentMethod: discovered.payment_method }),
    ...(discovered.source_email && { sourceEmail: discovered.source_email }),
  }
}
