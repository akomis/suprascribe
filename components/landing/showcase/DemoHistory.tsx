'use client'

import SubscriptionHistory from '@/components/dashboard/SubscriptionHistory'
import { SubscriptionBadge } from '@/components/dashboard/SubscriptionBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { ExternalLink, UserX } from 'lucide-react'

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

const DEMO_SUBSCRIPTION_HISTORY: UserSubscriptionWithDetails[] = [
  {
    id: 1,
    user_id: 'demo-user',
    subscription_service_id: 1,
    price: 12.99,
    currency: 'USD',
    start_date: daysAgo(540),
    end_date: daysAgo(360),
    auto_renew: true,
    payment_method: 'Credit Card',
    source_email: null,
    created_at: daysAgo(540),
    subscription_service: {
      name: 'Netflix',
      url: 'https://netflix.com',
      unsubscribe_url: 'https://www.netflix.com/cancelplan',
    },
  },
  {
    id: 2,
    user_id: 'demo-user',
    subscription_service_id: 1,
    price: 13.99,
    currency: 'USD',
    start_date: daysAgo(360),
    end_date: daysAgo(180),
    auto_renew: true,
    payment_method: 'Credit Card',
    source_email: null,
    created_at: daysAgo(360),
    subscription_service: {
      name: 'Netflix',
      url: 'https://netflix.com',
      unsubscribe_url: 'https://www.netflix.com/cancelplan',
    },
  },
  {
    id: 3,
    user_id: 'demo-user',
    subscription_service_id: 1,
    price: 15.99,
    currency: 'USD',
    start_date: daysAgo(180),
    end_date: daysFromNow(15),
    auto_renew: true,
    payment_method: 'Credit Card',
    source_email: null,
    created_at: daysAgo(180),
    subscription_service: {
      name: 'Netflix',
      url: 'https://netflix.com',
      unsubscribe_url: 'https://www.netflix.com/cancelplan',
    },
  },
]

export default function DemoHistory() {
  const mostRecent = DEMO_SUBSCRIPTION_HISTORY[DEMO_SUBSCRIPTION_HISTORY.length - 1]

  const handleUnsubscribe = () => {
    const url = mostRecent.subscription_service?.unsubscribe_url
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="p-3 sm:p-4 rounded-2xl border bg-background">
      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <SubscriptionBadge
              name={mostRecent.subscription_service?.name || 'Subscription'}
              url={mostRecent.subscription_service?.url ?? undefined}
              showLabel={true}
              size="lg"
            />
            <Button
              variant="ghost"
              size="icon"
              className="size-6 sm:size-8 cursor-default shrink-0"
              title="Open service website"
              disabled
            >
              <ExternalLink className="size-3 sm:size-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
            <Badge
              variant="outline"
              className="text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-0.5"
            >
              {formatCurrencyAmount(mostRecent.price || 0, 'USD')}
            </Badge>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {mostRecent.payment_method}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 shrink-0"
          onClick={handleUnsubscribe}
        >
          <UserX className="size-3 sm:size-4" />
          <span className="hidden sm:inline ml-1">Unsubscribe</span>
        </Button>
      </div>

      {/* Chart */}
      <div className="w-full">
        <SubscriptionHistory subscriptions={DEMO_SUBSCRIPTION_HISTORY} onEdit={() => {}} />
      </div>
    </div>
  )
}
