'use client'

import InsightCard from '@/components/dashboard/InsightCard'
import dynamic from 'next/dynamic'

const InsightsPieChart = dynamic(() => import('@/components/dashboard/InsightsPieChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-50 sm:h-60">
      <Spinner />
    </div>
  ),
})
import { SubscriptionDetailsDialog } from '@/components/dashboard/SubscriptionDetailsDialog'
import { Spinner } from '@/components/ui/spinner'
import { useCurrency } from '@/lib/hooks/useCurrency'
import type { InsightData, InsightTab } from '@/lib/types/subscriptions'
import { useInsightsSuspense } from '@/lib/hooks/useInsights'
import { useSubscriptionsSuspense } from '@/lib/hooks/useSubscriptions'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import * as React from 'react'
import { Suspense } from 'react'

type MergedSubLike = { name: string; subscriptions: UserSubscriptionWithDetails[] }

type InsightsContentBaseProps = {
  insights: InsightData
  subscriptions: MergedSubLike[]
  DetailsDialog: React.ComponentType<{
    subscription: UserSubscriptionWithDetails
    allSubscriptions?: UserSubscriptionWithDetails[]
    open: boolean
    onOpenChange: (open: boolean) => void
  }>
  tab: InsightTab
  year?: number
  hideNextExpiring?: boolean
}

export function InsightsContentBase({
  insights,
  subscriptions,
  DetailsDialog,
  tab,
  year,
  hideNextExpiring = false,
}: InsightsContentBaseProps) {
  const { mode } = useInsightsSettings()
  const [selectedSubName, setSelectedSubName] = React.useState<string | null>(null)

  const selectedMerged = React.useMemo(
    () =>
      selectedSubName ? (subscriptions.find((s) => s.name === selectedSubName) ?? null) : null,
    [selectedSubName, subscriptions],
  )

  const selectedSub = selectedMerged?.subscriptions[0]
  const allSubs =
    selectedMerged && selectedMerged.subscriptions.length > 1
      ? selectedMerged.subscriptions
      : undefined

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

      {!hideNextExpiring && tab === 'active' && insights.nextExpiring.length > 0 && (
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
        <DetailsDialog
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
  return (
    <Suspense fallback={<InsightsFallback />}>
      <InsightsContent tab={tab} year={year} />
    </Suspense>
  )
}
