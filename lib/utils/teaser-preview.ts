import type { TeaserPreviewEntry, TeaserPreviewGroup } from '@/lib/types/discovery'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { isSubscriptionActive } from '@/lib/utils'

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
 * the dates that decide which charge is the newest. Every service gets one card
 * per run: consecutive charges have already been collapsed upstream, so what
 * arrives here is one entry per continuous subscription, newest first.
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
      // The newest run is the one that describes the subscription today; the
      // older ones are the same service before it lapsed and restarted.
      const entries = [...list].sort(newestFirst).slice(0, 1).map(toEntry)

      return {
        service_name: serviceName,
        service_url: list.find((sub) => sub.service_url)?.service_url,
        entries,
        is_active: entries.some((entry) => entry.is_active),
      }
    })
    .sort((a, b) => {
      // Live subscriptions first: they are what the upgrade is for.
      if (a.is_active !== b.is_active) return a.is_active ? -1 : 1
      return a.service_name.localeCompare(b.service_name)
    })
}
