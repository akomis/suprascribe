'use client'

import { InsightsContentBase } from '@/components/dashboard/InsightsContentBase'
import { SubscriptionDetailsDialog } from '@/components/dashboard/SubscriptionDetailsDialog'
import { ClientOnly } from '@/components/shared/ClientOnly'
import { Spinner } from '@/components/ui/spinner'
import { useCurrency } from '@/lib/hooks/useCurrency'
import type { InsightTab } from '@/lib/types/subscriptions'
import { useInsightsSuspense } from '@/lib/hooks/useInsights'
import { useSubscriptionsSuspense } from '@/lib/hooks/useSubscriptions'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import { Suspense } from 'react'

type InsightsContentProps = {
  tab: InsightTab
  year?: number
}

function InsightsContent({ tab, year }: InsightsContentProps) {
  const { currency } = useCurrency()
  const { groupBy, mode } = useInsightsSettings()
  const { data: insights } = useInsightsSuspense(currency, groupBy, mode, tab, year)
  const { data: subscriptions } = useSubscriptionsSuspense()

  if (!insights) return null

  return (
    <InsightsContentBase
      insights={insights}
      subscriptions={subscriptions}
      DetailsDialog={SubscriptionDetailsDialog}
      tab={tab}
      year={year}
    />
  )
}

function InsightsFallback() {
  return (
    <div className="flex items-center justify-center h-[200px] sm:h-[250px]">
      <Spinner />
    </div>
  )
}

type InsightsProps = {
  tab?: InsightTab
  year?: number
}

export default function Insights({ tab = 'active', year }: InsightsProps) {
  // The suspense query fetches a relative /api URL, which Node's fetch cannot
  // parse during SSR - and the request would lack auth cookies anyway.
  return (
    <ClientOnly fallback={<InsightsFallback />}>
      <Suspense fallback={<InsightsFallback />}>
        <InsightsContent tab={tab} year={year} />
      </Suspense>
    </ClientOnly>
  )
}
