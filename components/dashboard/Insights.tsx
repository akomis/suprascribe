'use client'

import InsightCard from '@/components/dashboard/InsightCard'
import InsightsPieChart from '@/components/dashboard/InsightsPieChart'
import { SubscriptionDetailsDialog } from '@/components/dashboard/SubscriptionDetailsDialog'
import { Spinner } from '@/components/ui/spinner'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { InsightTab, useInsightsSuspense } from '@/lib/hooks/useInsights'
import { useSubscriptionsSuspense } from '@/lib/hooks/useSubscriptions'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import * as React from 'react'
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
  const [selectedSubName, setSelectedSubName] = React.useState<string | null>(null)

  const selectedMerged = React.useMemo(
    () =>
      selectedSubName ? (subscriptions.find((s) => s.name === selectedSubName) ?? null) : null,
    [selectedSubName, subscriptions],
  )

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

      {selectedMerged && (
        <SubscriptionDetailsDialog
          subscription={selectedMerged.subscriptions[0]}
          allSubscriptions={
            selectedMerged.subscriptions.length > 1 ? selectedMerged.subscriptions : undefined
          }
          open={Boolean(selectedMerged)}
          onOpenChange={(open) => {
            if (!open) setSelectedSubName(null)
          }}
        />
      )}
    </div>
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
  return (
    <Suspense fallback={<InsightsFallback />}>
      <InsightsContent tab={tab} year={year} />
    </Suspense>
  )
}
