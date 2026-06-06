import { isSubscriptionActive } from '@/lib/utils'

function getServiceNameKey(serviceName: string): string {
  return serviceName.toLowerCase().trim()
}

export function getMostRecent<T extends { end_date: string | null }>(subs: T[]): T {
  return [...subs].sort(
    (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
  )[0]
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
  priceMode: 'sum' | 'average' = 'sum',
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

    const total = subs.reduce((sum, sub) => sum + (sub.price || 0), 0)
    const price = priceMode === 'sum' ? total : total / subs.length

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
