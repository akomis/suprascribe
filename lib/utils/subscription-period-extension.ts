import type { DiscoveredSubscription } from '@/lib/types/forms'

function calculateNextPeriod(subscription: DiscoveredSubscription): DiscoveredSubscription {
  const startDate = new Date(subscription.start_date)
  const endDate = new Date(subscription.end_date || subscription.start_date)

  const cycleLength = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))

  const finalCycleLength = cycleLength > 0 ? cycleLength : 30

  const nextStartDate = new Date(endDate)
  nextStartDate.setDate(nextStartDate.getDate() + 1)

  const nextEndDate = new Date(nextStartDate)
  nextEndDate.setDate(nextEndDate.getDate() + finalCycleLength - 1)

  return {
    ...subscription,
    start_date: nextStartDate.toISOString().split('T')[0],
    end_date: nextEndDate.toISOString().split('T')[0],
  }
}

function isInPast(dateStr: string): boolean {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

export function extendAutoRenewingSubscriptions(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const result: DiscoveredSubscription[] = []

  for (const sub of subscriptions) {
    result.push(sub)

    if (sub.auto_renew && sub.end_date && isInPast(sub.end_date)) {
      let currentPeriod = sub

      while (currentPeriod.end_date && isInPast(currentPeriod.end_date)) {
        currentPeriod = calculateNextPeriod(currentPeriod)

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
