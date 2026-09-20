'use client'

import { Spinner } from '@/components/ui/spinner'
import dynamic from 'next/dynamic'
import { SubscriptionBadge } from '@/components/dashboard/SubscriptionBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { UserX } from 'lucide-react'

// Recharts is ~370 kB and this is the only thing on the marketing page that needs it.
// Loading it lazily keeps it out of the landing page's initial script set; the chart
// is below the fold, so it resolves well before a visitor scrolls to it.
const SubscriptionHistory = dynamic(() => import('@/components/dashboard/SubscriptionHistory'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-[200px] sm:h-[250px]">
      <Spinner />
    </div>
  ),
})

const DEMO_SUBSCRIPTION_HISTORY: UserSubscriptionWithDetails[] = [
  {
    id: 1,
    user_id: 'demo-user',
    subscription_service_id: 1,
    price: 12.99,
    currency: 'USD',
    start_date: '2024-12-13',
    end_date: '2025-06-11',
    auto_renew: true,
    period: 'MONTHLY' as const,
    payment_method: 'Credit Card',
    source_email: null,
    created_at: '2024-12-13',
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
    start_date: '2025-06-11',
    end_date: '2025-12-08',
    auto_renew: true,
    period: 'MONTHLY' as const,
    payment_method: 'Credit Card',
    source_email: null,
    created_at: '2025-06-11',
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
    start_date: '2025-12-08',
    end_date: '2026-06-21',
    auto_renew: true,
    period: 'MONTHLY' as const,
    payment_method: 'Credit Card',
    source_email: null,
    created_at: '2025-12-08',
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
    <div className="p-3 sm:p-4 rounded-2xl border bg-background overflow-hidden">
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
          aria-label="Unsubscribe"
          className="text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 shrink-0"
          onClick={handleUnsubscribe}
        >
          <UserX className="size-3 sm:size-4" aria-hidden="true" />
          <span className="hidden sm:inline ml-1">Unsubscribe</span>
        </Button>
      </div>

      {/* Chart */}
      <div className="-mx-3 sm:-mx-4 -mb-3 sm:-mb-4">
        <SubscriptionHistory subscriptions={DEMO_SUBSCRIPTION_HISTORY} onEdit={() => {}} />
      </div>
    </div>
  )
}
