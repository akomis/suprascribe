'use client'

import InsightCard from '@/components/dashboard/InsightCard'
import InsightsPieChart from '@/components/dashboard/InsightsPieChart'
import { DemoSubscriptionDetailsDialog } from '@/components/demo/DemoSubscriptionDetailsDialog'
import { useDemoContext } from '@/components/demo/DemoProvider'
import { Spinner } from '@/components/ui/spinner'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useDemoInsights } from '@/lib/demo/useDemoInsights'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import * as React from 'react'
import { Suspense } from 'react'
import type { InsightTab } from '@/lib/hooks/useInsights'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'

type DemoInsightsContentProps = {
  tab: InsightTab
  year?: number
}

function DemoInsightsContent({ tab, year }: DemoInsightsContentProps) {
  const { currency } = useCurrency()
  const { groupBy, mode } = useInsightsSettings()
  const { data: insights } = useDemoInsights(currency, groupBy, mode, tab, year)
  const { subscriptions } = useDemoContext()
  const [selectedSubName, setSelectedSubName] = React.useState<string | null>(null)

  const selectedMerged = React.useMemo(
    () =>
      selectedSubName ? (subscriptions.find((s) => s.name === selectedSubName) ?? null) : null,
    [selectedSubName, subscriptions],
  )

  const selectedSub = selectedMerged?.subscriptions[0] as UserSubscriptionWithDetails | undefined
  const allSubs =
    selectedMerged && selectedMerged.subscriptions.length > 1
      ? (selectedMerged.subscriptions as UserSubscriptionWithDetails[])
      : undefined

  if (!insights) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 sm:gap-4 fade-on-mount">
      <InsightsPieChart
        pieData={insights.pieData}
        totalMonthly={insights.totalMonthly}
        yearly={insights.yearly}
        mode={mode}
        tab={tab}
        year={year}
      />

      {tab === 'active' && insights.nextExpiring.length > 0 && (
        <InsightCard
          title={insights.nextExpiring.length === 1 ? 'Upcoming Renewal' : 'Upcoming Renewals'}
          subscriptions={insights.nextExpiring.map((sub) => ({
            name: sub.name,
            url: sub.url,
            endDate: sub.endDate,
            onOpen: () => setSelectedSubName(sub.name),
          }))}
        />
      )}

      {selectedSub && (
        <DemoSubscriptionDetailsDialog
          subscription={selectedSub}
          allSubscriptions={allSubs}
          open={Boolean(selectedSub)}
          onOpenChange={(open) => {
            if (!open) setSelectedSubName(null)
          }}
        />
      )}
    </div>
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
