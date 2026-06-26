'use client'

import { DemoControlPanel } from '@/components/demo/DemoControlPanel'
import { DemoEmailProviderSelection } from '@/components/demo/DemoEmailProviderSelection'
import { DemoProvider, useDemoContext } from '@/components/demo/DemoProvider'
import DemoSubscriptionsSection from '@/components/demo/DemoSubscriptionsSection'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'

function DiscoverContent() {
  const { subscriptions } = useDemoContext()

  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
      <div className="flex gap-2 min-h-screen min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 md:px-4 fade-on-mount">
        <div className="flex w-full items-center justify-between gap-2 md:gap-4 px-2">
          <div className="flex items-center gap-2">
            <SuprascribeLogo showTier={false} />
            <span className="text-lg font-semibold tracking-tight">Suprascribe</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <DemoControlPanel />
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <>
            <div className="flex flex-col items-center gap-0 py-4 text-center">
              <h1 className="text-lg font-semibold sm:text-xl">Discover your subscriptions</h1>
              <p className="text-sm text-muted-foreground">
                Pick a provider to scan for subscriptions.
              </p>
            </div>

            <DemoEmailProviderSelection randomize />
          </>
        ) : (
          <DemoSubscriptionsSection />
        )}
      </div>
    </div>
  )
}

export default function DiscoverPage() {
  return (
    <DemoProvider initialSubscriptions={[]}>
      <InsightsSettingsProvider>
        <DiscoverContent />
      </InsightsSettingsProvider>
    </DemoProvider>
  )
}
