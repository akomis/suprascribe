'use client'

import { InsightsContentBase } from '@/components/dashboard/Insights'
import { DemoSubscriptionDetailsDialog } from '@/components/demo/DemoSubscriptionDetailsDialog'
import { Spinner } from '@/components/ui/spinner'
import { useDemoContext } from '@/components/demo/DemoProvider'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useDemoInsights } from '@/lib/demo/useDemoInsights'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import type { InsightTab } from '@/lib/types/subscriptions'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import * as React from 'react'
import { Suspense } from 'react'

type MergedSubLike = { name: string; subscriptions: UserSubscriptionWithDetails[] }

type DemoInsightsContentProps = {
  tab: InsightTab
  year?: number
}

function DemoInsightsContent({ tab, year }: DemoInsightsContentProps) {
  const { currency } = useCurrency()
  const { groupBy, mode } = useInsightsSettings()
  const { data: insights } = useDemoInsights(currency, groupBy, mode, tab, year)
  const { subscriptions } = useDemoContext()

  return (
    <InsightsContentBase
      insights={insights}
      subscriptions={subscriptions as unknown as MergedSubLike[]}
      DetailsDialog={DemoSubscriptionDetailsDialog}
      tab={tab}
      year={year}
      hideNextExpiring
    />
  )
}

function DemoInsightsFallback() {
  return (
    <div className="flex items-center justify-center h-[200px] sm:h-[250px]">
      <Spinner />
    </div>
  )
}

type DemoInsightsProps = {
  tab?: InsightTab
  year?: number
}

export default function DemoInsights({ tab = 'active', year }: DemoInsightsProps) {
  return (
    <Suspense fallback={<DemoInsightsFallback />}>
      <DemoInsightsContent tab={tab} year={year} />
    </Suspense>
  )
}
