'use client'

import InsightCard from '@/components/dashboard/InsightCard'
import { Spinner } from '@/components/ui/spinner'
import type { InsightData, InsightTab } from '@/lib/types/subscriptions'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import dynamic from 'next/dynamic'
import * as React from 'react'

const InsightsPieChart = dynamic(() => import('@/components/dashboard/InsightsPieChart'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-50 sm:h-60">
      <Spinner />
    </div>
  ),
})

export type MergedSubLike = { name: string; subscriptions: UserSubscriptionWithDetails[] }

// Kept in its own module, deliberately free of dashboard-only imports. The landing
// page renders this through the demo showcase, so anything pulled in at the top of
// this file ships to every marketing visitor. The dialog arrives as a prop rather
// than an import for exactly that reason: the dashboard passes the real
// SubscriptionDetailsDialog (which drags in the edit form, calendar and account
// hooks), the demo passes a read-only stand-in.
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
