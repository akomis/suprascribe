import { CalendarViewConnected } from '@/components/dashboard/CalendarViewConnected'
import { DiscoveryHandlers } from '@/components/dashboard/discovery/DiscoveryHandlers'
import ControlPanel from '@/components/dashboard/settings/ControlPanel'
import SubscriptionsSection from '@/components/dashboard/SubscriptionsSection'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'

export default async function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
      <DiscoveryHandlers />

      <div className="flex gap-2 min-h-screen min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 md:px-4 fade-on-mount">
        <div className="flex w-full items-center justify-between gap-2 md:gap-4 px-2">
          <SuprascribeLogo showTier />

          <div className="flex items-center gap-1 sm:gap-2">
            <CalendarViewConnected />
            <ControlPanel />
          </div>
        </div>

        <SubscriptionsSection />
      </div>
    </div>
  )
}
