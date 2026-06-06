import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import type { DaySubscription } from '@/lib/types/calendar'

const CALENDAR_YEAR_RANGE = { min: 2020, max: 2030 }

export function buildSubscriptionDateMap(
  subscriptions: MergedSubscriptionResponse[],
  yearRange = CALENDAR_YEAR_RANGE,
): Map<string, DaySubscription[]> {
  const map = new Map<string, DaySubscription[]>()

  for (const sub of subscriptions) {
    const endDate = new Date(sub.endDate)
    const day = endDate.getDate()
    const entry: DaySubscription = {
      id: sub.subscriptions[0]?.id?.toString() || sub.name,
      name: sub.name,
      serviceUrl: sub.serviceUrl,
      price: sub.price,
      autoRenew: sub.autoRenew,
    }

    if (sub.autoRenew) {
      for (let year = yearRange.min; year <= yearRange.max; year++) {
        for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
          const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
          if (day <= daysInMonth) {
            const dateKey = `${year}-${monthIdx + 1}-${day}`
            const existing = map.get(dateKey)
            if (existing) {
              existing.push(entry)
            } else {
              map.set(dateKey, [entry])
            }
          }
        }
      }
    } else {
      const dateKey = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
      const existing = map.get(dateKey)
      if (existing) {
        existing.push(entry)
      } else {
        map.set(dateKey, [entry])
      }
    }
  }

  return map
}
