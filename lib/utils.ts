import type { SubscriptionServiceInsert, UserSubscriptionInsert } from '@/lib/types/database'
import type { CreateSubscriptionFormData } from '@/lib/types/forms'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

import { getServiceNameKey } from '@/lib/utils/subscription-comparison'
export { isDuplicateSubscription } from '@/lib/utils/subscription-comparison'

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

export function detectBillingPeriod(
  startDate: string,
  endDate: string,
): 'weekly' | 'monthly' | 'yearly' | null {
  const diffDays = Math.round(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
  )
  if (diffDays >= 360 && diffDays <= 370) return 'yearly'
  if (diffDays >= 28 && diffDays <= 31) return 'monthly'
  if (diffDays >= 6 && diffDays <= 8) return 'weekly'
  return null
}

export function normalizeToMonthlyPrice(price: number, startDate: string, endDate: string): number {
  const period = detectBillingPeriod(startDate, endDate)
  if (period === 'weekly') return price * (52 / 12)
  if (period === 'yearly') return price / 12
  return price
}

export function formatLocalizedDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateMonthsDuration(startDate: string, endDate: string): number {
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

export function handleNumericInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
  if (
    [8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
    (e.keyCode === 65 && e.ctrlKey === true) ||
    (e.keyCode === 67 && e.ctrlKey === true) ||
    (e.keyCode === 86 && e.ctrlKey === true) ||
    (e.keyCode === 88 && e.ctrlKey === true) ||
    (e.keyCode >= 35 && e.keyCode <= 40)
  ) {
    return
  }
  if ((e.shiftKey || e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
    e.preventDefault()
  }
}

export function isSubscriptionActive(startDate: string, endDate: string): boolean {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  return now >= start && now <= end
}

export function mergeSubscriptionsByService<
  T extends {
    subscription_service?: { name: string | null } | null
    start_date: string | null
    end_date: string | null
    price: number | null
  },
>(
  subscriptions: T[],
  aggregateByService: boolean = true,
): Map<
  string,
  {
    subscriptions: T[]
    merged: { startDate: string; endDate: string; price: number; active: boolean }
  }
> {
  const grouped = new Map<string, T[]>()

  subscriptions.forEach((sub) => {
    const serviceName = getServiceNameKey(sub.subscription_service?.name || 'Unknown Service')
    if (!grouped.has(serviceName)) {
      grouped.set(serviceName, [])
    }
    grouped.get(serviceName)!.push(sub)
  })

  const result = new Map<
    string,
    {
      subscriptions: T[]
      merged: { startDate: string; endDate: string; price: number; active: boolean }
    }
  >()

  grouped.forEach((subs, serviceName) => {
    const oldestStartDate = subs.reduce((oldest, sub) => {
      const subDate = new Date(sub.start_date || '')
      const oldestDate = new Date(oldest)
      return subDate < oldestDate ? sub.start_date || oldest : oldest
    }, subs[0].start_date || '')

    const mostRecentEndDate = subs.reduce((mostRecent, sub) => {
      const subDate = new Date(sub.end_date || '')
      const mostRecentDate = new Date(mostRecent)
      return subDate > mostRecentDate ? sub.end_date || mostRecent : mostRecent
    }, subs[0].end_date || '')

    const price = aggregateByService
      ? subs.reduce((sum, sub) => sum + (sub.price || 0), 0)
      : subs.reduce((sum, sub) => sum + (sub.price || 0), 0) / subs.length

    const isActive = subs.some(
      (sub) => sub.start_date && sub.end_date && isSubscriptionActive(sub.start_date, sub.end_date),
    )

    result.set(serviceName, {
      subscriptions: subs,
      merged: {
        startDate: oldestStartDate,
        endDate: mostRecentEndDate,
        price,
        active: isActive,
      },
    })
  })

  return result
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
