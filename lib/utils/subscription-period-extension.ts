import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'
import { toDateString } from '@/lib/utils/date'

// Tolerate a slightly late or missed final receipt when judging recency.
const GRACE_BUFFER_DAYS = 10

// Approximate length of one billing cycle in days, keyed by billing period.
const CYCLE_DAYS: Record<BillingPeriod, number> = {
  WEEKLY: 7,
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
}

function getCycleDays(period?: BillingPeriod): number {
  return period ? CYCLE_DAYS[period] : 30
}

function calculateNextPeriod(subscription: DiscoveredSubscription): DiscoveredSubscription {
  const startDate = new Date(subscription.start_date)
  const endDate = new Date(subscription.end_date || subscription.start_date)

  // Prefer the period-derived cycle: deriving it from end - start overshoots for merged
  // multi-month receipts (e.g. Jan→Apr yields ~90 days instead of 30).
  const spanLength = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const cycleLength = subscription.period ? getCycleDays(subscription.period) : spanLength

  const finalCycleLength = cycleLength > 0 ? cycleLength : 30

  const nextStartDate = new Date(endDate)
  nextStartDate.setDate(nextStartDate.getDate() + 1)

  const nextEndDate = new Date(nextStartDate)
  nextEndDate.setDate(nextEndDate.getDate() + finalCycleLength - 1)

  return {
    ...subscription,
    start_date: toDateString(nextStartDate),
    end_date: toDateString(nextEndDate),
  }
}

function isInPast(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
}

// Optimistically treat a recurring sub as still auto-renewing when its last receipt is recent.
// The AI-inferred `auto_renew` flag is unreliable, so a monthly sub last billed ~1 cycle ago is
// almost certainly still active. Staler than one cycle (+ buffer) → probably cancelled, leave PAST.
function shouldOptimisticallyExtend(sub: DiscoveredSubscription): boolean {
  if (sub.auto_renew) return false // explicit auto_renew path already handles this
  if (!sub.period) return false // credits/one-time purchases have no period → never extend
  if (!sub.end_date || !isInPast(sub.end_date)) return false
  return daysSince(sub.end_date) <= getCycleDays(sub.period) + GRACE_BUFFER_DAYS
}

export function extendAutoRenewingSubscriptions(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const result: DiscoveredSubscription[] = []

  for (const sub of subscriptions) {
    result.push(sub)

    const explicit = !!sub.auto_renew && !!sub.end_date && isInPast(sub.end_date)
    const optimistic = shouldOptimisticallyExtend(sub)

    if (explicit || optimistic) {
      let currentPeriod = sub

      while (currentPeriod.end_date && isInPast(currentPeriod.end_date)) {
        currentPeriod = calculateNextPeriod(currentPeriod)

        // Optimistically-extended periods must carry auto_renew so the ACTIVE-classified period
        // and its saved record stay consistent (calculateNextPeriod would spread the falsy flag).
        if (optimistic) {
          currentPeriod = { ...currentPeriod, auto_renew: true }
        }

        const maxFutureDate = new Date()
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 2)
        const periodEndDate = new Date(currentPeriod.end_date || currentPeriod.start_date)

        if (periodEndDate > maxFutureDate) {
          console.warn(
            `[Period Extension] Stopping period calculation for "${sub.service_name}" - reached max future date`,
          )
          break
        }

        result.push(currentPeriod)

        if (!isInPast(currentPeriod.end_date || currentPeriod.start_date)) {
          break
        }
      }
    }
  }

  return result
}
