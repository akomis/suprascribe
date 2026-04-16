'use client'

import { DemoBanner } from '@/components/demo/DemoBanner'
import { DemoCalendarViewConnected } from '@/components/demo/DemoCalendarViewConnected'
import { DemoControlPanel } from '@/components/demo/DemoControlPanel'
import { DemoProvider } from '@/components/demo/DemoProvider'
import DemoSubscriptionsSection from '@/components/demo/DemoSubscriptionsSection'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'

export default function DemoPage() {
  return (
    <DemoProvider>
      <InsightsSettingsProvider>
        <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
          <DemoBanner />

          <div className="flex gap-2 min-h-screen min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 md:px-4 fade-on-mount">
            <div className="flex w-full items-center justify-between gap-2 md:gap-4 px-2">
              <SuprascribeLogo showTier={false} />

              <div className="flex items-center gap-1 sm:gap-2">
                <DemoCalendarViewConnected />
                <DemoControlPanel />
              </div>
            </div>

            <DemoSubscriptionsSection />
          </div>
        </div>
      </InsightsSettingsProvider>
    </DemoProvider>
  )
}
