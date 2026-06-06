'use client'

import DemoInsights from '@/components/demo/DemoInsights'
import DemoAddSubscriptionDialog, {
  type ViewType,
} from '@/components/demo/DemoAddSubscriptionDialog'
import { DemoSubscriptionDetailsDialog } from '@/components/demo/DemoSubscriptionDetailsDialog'
import {
  SubscriptionsSectionBase,
  SubscriptionsSectionFallback,
  type SubscriptionsSectionActions,
} from '@/components/dashboard/SubscriptionsSection'
import { useDemoContext } from '@/components/demo/DemoProvider'
import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import * as React from 'react'

function DemoSubscriptionsSectionContent() {
  const { subscriptions } = useDemoContext()

  const actions: SubscriptionsSectionActions = {
    subscriptions: subscriptions as unknown as MergedSubscriptionResponse[],
    error: null,
    hasSubscriptionHistory: true,
    hasAutoDiscovery: false,
    hasSearchSort: true,
    storagePrefix: 'suprascribe_demo',
    InsightsComponent: DemoInsights,
    AddDialogComponent: DemoAddSubscriptionDialog as React.ComponentType<{
      externalOpen: boolean
      onExternalOpenChange: (open: boolean) => void
      initialView: ViewType
      hideTrigger: boolean
    }>,
    DetailsDialogComponent: DemoSubscriptionDetailsDialog,
    renderEmptyState: (openManualDialog) => (
      <div className="text-center text-muted-foreground text-sm sm:text-base px-2">
        No subscriptions yet. Add one{' '}
        <button
          onClick={openManualDialog}
          className="underline hover:text-foreground transition-colors"
        >
          manually
        </button>{' '}
        to get started.
      </div>
    ),
    renderActiveTabEmpty: (openManualDialog) => (
      <div className="flex flex-col items-center justify-center gap-3 py-6 sm:py-8">
        <div className="text-center text-muted-foreground text-sm sm:text-base px-2">
          No active subscriptions. Add one{' '}
          <button
            onClick={openManualDialog}
            className="underline hover:text-foreground transition-colors"
          >
            manually
          </button>
          .
        </div>
      </div>
    ),
  }

  return <SubscriptionsSectionBase actions={actions} />
}

export default function DemoSubscriptionsSection() {
  return (
    <React.Suspense fallback={<SubscriptionsSectionFallback />}>
      <DemoSubscriptionsSectionContent />
    </React.Suspense>
  )
}
