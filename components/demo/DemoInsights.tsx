'use client'

import { InsightsContentBase } from '@/components/dashboard/InsightsContentBase'
import dynamic from 'next/dynamic'
import { Spinner } from '@/components/ui/spinner'
import { useDemoContext } from '@/components/demo/DemoProvider'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { useDemoInsights } from '@/lib/demo/useDemoInsights'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import type { InsightTab } from '@/lib/types/subscriptions'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import * as React from 'react'
import { Suspense } from 'react'

// Only mounts when a visitor opens a renewal from the upcoming-renewals card, and it
// pulls the whole edit surface with it (subscription form -> calendar ->
// react-day-picker/date-fns, plus the history chart -> recharts). Loading it eagerly put
// all of that in the initial scripts of every page that renders a demo, including the
// marketing landing page, for an interaction most visitors never make.
const DemoSubscriptionDetailsDialog = dynamic(
  () =>
    import('@/components/demo/DemoSubscriptionDetailsDialog').then(
      (m) => m.DemoSubscriptionDetailsDialog,
    ),
  { ssr: false },
)

type MergedSubLike = { name: string; subscriptions: UserSubscriptionWithDetails[] }

type DemoInsightsContentProps = {
  tab: InsightTab
  year?: number
  hideNextExpiring?: boolean
}

function DemoInsightsContent({ tab, year, hideNextExpiring }: DemoInsightsContentProps) {
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
      hideNextExpiring={hideNextExpiring}
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
  /**
   * Hides the upcoming-renewals card, and with it the only way to open the details
   * dialog. The landing page sets this: its showcase tile sits next to marketing copy,
   * where a dialog offering Delete and Billing Period on data the visitor does not own
   * reads as a bug. /demo leaves it off, so the card matches the real dashboard.
   */
  hideNextExpiring?: boolean
}

export default function DemoInsights({
  tab = 'active',
  year,
  hideNextExpiring = false,
}: DemoInsightsProps) {
  return (
    <Suspense fallback={<DemoInsightsFallback />}>
      <DemoInsightsContent tab={tab} year={year} hideNextExpiring={hideNextExpiring} />
    </Suspense>
  )
}
