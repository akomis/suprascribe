'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { formatDateRangeWithDuration, formatLocalizedDate, isSubscriptionActive } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import * as React from 'react'

const daysAgo = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

const daysFromNow = (days: number) => {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().split('T')[0]
}

const DEMO_DISCOVERED: DiscoveredSubscription[] = [
  {
    service_name: 'Netflix',
    service_url: 'https://netflix.com',
    price: 15.99,
    currency: 'USD',
    start_date: daysAgo(30),
    end_date: daysFromNow(15),
  },
  {
    service_name: 'Netflix',
    service_url: 'https://netflix.com',
    price: 12.99,
    currency: 'USD',
    start_date: daysAgo(180),
    end_date: daysAgo(150),
  },
  {
    service_name: 'Spotify',
    service_url: 'https://spotify.com',
    price: 10.99,
    currency: 'USD',
    start_date: daysAgo(365),
    end_date: daysFromNow(3),
  },
  {
    service_name: 'Namecheap',
    service_url: 'https://namecheap.com',
    price: 12.98,
    currency: 'USD',
    start_date: daysAgo(15),
    end_date: daysAgo(15),
  },
  {
    service_name: 'Namecheap',
    service_url: 'https://namecheap.com',
    price: 9.58,
    currency: 'USD',
    start_date: daysAgo(45),
    end_date: daysAgo(45),
  },
  {
    service_name: 'Namecheap',
    service_url: 'https://namecheap.com',
    price: 14.98,
    currency: 'USD',
    start_date: daysAgo(120),
    end_date: daysAgo(120),
  },
  {
    service_name: 'Disney+',
    service_url: 'https://disneyplus.com',
    price: 7.99,
    currency: 'USD',
    start_date: daysAgo(400),
    end_date: daysAgo(35),
  },
]

type GroupedSubscriptions = {
  serviceName: string
  serviceUrl?: string
  items: { sub: DiscoveredSubscription; index: number }[]
}

function SubscriptionEntry({ subscription }: { subscription: DiscoveredSubscription }) {
  const currency = (subscription.currency || 'USD') as 'USD' | 'EUR' | 'GBP'
  const isOneTime = subscription.start_date === subscription.end_date
  const isPast = !isSubscriptionActive(subscription.start_date, subscription.end_date)

  return (
    <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-3 py-1.5 border-t first:border-t-0">
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap flex-1 min-w-0">
        {isOneTime ? (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
            One-time
          </span>
        ) : isPast ? (
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">
            Past
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
            Active
          </span>
        )}
        <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-none">
          {isOneTime
            ? formatLocalizedDate(subscription.start_date)
            : formatDateRangeWithDuration(subscription.start_date, subscription.end_date)}
        </span>
      </div>
      <span className="font-medium text-xs sm:text-sm whitespace-nowrap shrink-0">
        {formatCurrencyAmount(subscription.price, currency)}
      </span>
    </div>
  )
}

function DiscoveredGroupCard({ group }: { group: GroupedSubscriptions }) {
  return (
    <Card className="border gap-0">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
            <ServiceLogo
              name={group.serviceName}
              serviceUrl={group.serviceUrl}
              size={64}
              className="size-full rounded-lg"
              fallbackClassName="size-4 sm:size-5"
            />
          </div>
          <CardTitle className="text-sm sm:text-base wrap-break-word truncate">
            {group.serviceName}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 pt-0 px-3 sm:px-6">
        {group.items.map(({ sub, index }) => (
          <SubscriptionEntry key={`${sub.service_name}-${index}`} subscription={sub} />
        ))}
      </CardContent>
    </Card>
  )
}

export default function DemoDiscovery() {
  const serviceGroups = React.useMemo(() => {
    const names = Array.from(new Set(DEMO_DISCOVERED.map((sub) => sub.service_name)))
    return names.map((name) => ({ name }))
  }, [])

  const getGroupedItems = (
    items: { sub: DiscoveredSubscription; index: number }[],
  ): GroupedSubscriptions[] => {
    const groups = new Map<string, { sub: DiscoveredSubscription; index: number }[]>()

    items.forEach((item) => {
      const serviceName = item.sub.service_name
      if (!groups.has(serviceName)) {
        groups.set(serviceName, [])
      }
      groups.get(serviceName)!.push(item)
    })

    groups.forEach((groupItems) => {
      groupItems.sort((a, b) => {
        const dateA = new Date(a.sub.end_date).getTime()
        const dateB = new Date(b.sub.end_date).getTime()
        return dateB - dateA
      })
    })

    return Array.from(groups.entries())
      .sort((a, b) => {
        const mostRecentA = new Date(a[1][0].sub.end_date).getTime()
        const mostRecentB = new Date(b[1][0].sub.end_date).getTime()
        return mostRecentB - mostRecentA
      })
      .map(([serviceName, items]) => ({
        serviceName,
        serviceUrl: items[0]?.sub.service_url,
        items,
      }))
  }

  const activeGroups = getGroupedItems(
    DEMO_DISCOVERED.map((sub, index) => ({ sub, index })).filter(({ sub }) =>
      isSubscriptionActive(sub.start_date, sub.end_date),
    ),
  )

  const pastGroups = getGroupedItems(
    DEMO_DISCOVERED.map((sub, index) => ({ sub, index })).filter(
      ({ sub }) => !isSubscriptionActive(sub.start_date, sub.end_date),
    ),
  )

  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border bg-background max-h-[400px] sm:max-h-[450px] overflow-y-auto">
      {/* Header */}
      <div className="space-y-1">
        <h4 className="font-semibold text-sm sm:text-base">Subscriptions Discovered</h4>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Found {serviceGroups.length} service{serviceGroups.length !== 1 ? 's' : ''} in your inbox.
        </p>
      </div>

      {/* Discovered subscriptions - grouped by service */}
      <div className="space-y-2 sm:space-y-3">
        {activeGroups.map((group) => (
          <DiscoveredGroupCard key={`active-${group.serviceName}`} group={group} />
        ))}

        {activeGroups.length > 0 && pastGroups.length > 0 && <Separator orientation="horizontal" />}

        {pastGroups.map((group) => (
          <DiscoveredGroupCard key={`past-${group.serviceName}`} group={group} />
        ))}
      </div>
    </div>
  )
}
