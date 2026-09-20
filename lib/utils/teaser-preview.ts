import type { TeaserPreviewEntry, TeaserPreviewGroup } from '@/lib/types/discovery'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { isSubscriptionActive } from '@/lib/utils'
import { isOneTimePayment } from '@/lib/utils/subscription-period-extension'

function newestFirst(a: DiscoveredSubscription, b: DiscoveredSubscription): number {
  return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
}

function toEntry(sub: DiscoveredSubscription): TeaserPreviewEntry {
  return {
    price: sub.price,
    currency: sub.currency,
    period: sub.period,
    is_active: isSubscriptionActive(sub.start_date, sub.end_date),
  }
}

/**
 * Collapses a discovery result into the cards a locked teaser may show.
 *
 * Grouping happens here rather than on the client because the teaser withholds
 * the dates that decide which charge is the newest. Every service gets one card:
 * its recurring charges collapse to the newest one - the older ones are the same
 * subscription billed again - while each one-time purchase stays its own entry,
 * as in the full results.
 *
 * Entries carry price, period and active state only; nothing the upgrade is
 * meant to unlock.
 */
export function buildTeaserPreview(subscriptions: DiscoveredSubscription[]): TeaserPreviewGroup[] {
  const byService = new Map<string, DiscoveredSubscription[]>()
  for (const sub of subscriptions) {
    if (!byService.has(sub.service_name)) byService.set(sub.service_name, [])
    byService.get(sub.service_name)!.push(sub)
  }

  return Array.from(byService.entries())
    .map(([serviceName, list]) => {
      const recurring = list.filter((sub) => !isOneTimePayment(sub)).sort(newestFirst)
      const oneTime = list.filter(isOneTimePayment).sort(newestFirst)
      const entries = [...recurring.slice(0, 1), ...oneTime].map(toEntry)

      return {
        service_name: serviceName,
        service_url: list.find((sub) => sub.service_url)?.service_url,
        entries,
        is_active: entries.some((entry) => entry.is_active),
        hasRecurring: recurring.length > 0,
      }
    })
    .sort((a, b) => {
      // Services that only ever charged once sit after the recurring ones.
      if (a.hasRecurring !== b.hasRecurring) return a.hasRecurring ? -1 : 1
      return a.service_name.localeCompare(b.service_name)
    })
    .map(({ hasRecurring: _hasRecurring, ...group }) => group)
}
