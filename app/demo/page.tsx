'use client'

import { DemoBanner } from '@/components/demo/DemoBanner'
import { DemoCalendarViewConnected } from '@/components/demo/DemoCalendarViewConnected'
import { DemoControlPanel } from '@/components/demo/DemoControlPanel'
import { DemoProvider } from '@/components/demo/DemoProvider'
import DemoSubscriptionsSection from '@/components/demo/DemoSubscriptionsSection'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { Button } from '@/components/ui/button'
import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'
import Link from 'next/link'

export default function DemoPage() {
  return (
    <DemoProvider>
      <InsightsSettingsProvider>
        <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
          <DemoBanner />

          <div className="flex gap-2 min-h-screen min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 md:px-4 fade-on-mount">
            <div className="flex w-full items-center justify-between gap-2 md:gap-4 px-2">
              <SuprascribeLogo />

              <div className="flex items-center gap-1 sm:gap-2">
                <DemoCalendarViewConnected />
                <DemoControlPanel />
              </div>
            </div>

            <header className="w-full space-y-2 px-2 text-center">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Suprascribe Live Demo
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                This is the real dashboard, loaded with a sample household&apos;s subscriptions
                instead of yours. Nothing here is connected to an inbox and nothing you change is
                saved, so edit, cancel and re-sort freely.
              </p>
            </header>

            <DemoSubscriptionsSection />

            <section className="w-full max-w-3xl space-y-8 px-2 pt-12 pb-4 text-left">
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">What you are looking at</h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Every subscription in the list has a price, a billing cycle and a renewal date,
                  and the totals above them are the real monthly and yearly cost of the set. That is
                  the number most people have never seen for their own subscriptions: individually
                  each charge is small enough to ignore, and only the total makes the case for
                  cancelling anything. The demo runs with PRO features switched on, so the calendar
                  view, grouping, search and renewal reminders are all live.
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">Things worth trying</h2>
                <ul className="list-disc space-y-2 pl-5 text-muted-foreground text-sm sm:text-base">
                  <li>
                    Switch to the calendar view to see the renewal dates cluster around the start of
                    the month.
                  </li>
                  <li>
                    Change a subscription&apos;s billing cycle from monthly to yearly and watch the
                    totals move.
                  </li>
                  <li>
                    Group by category to see which kind of service quietly takes the largest share.
                  </li>
                  <li>Add a subscription of your own to compare it against the sample set.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight">
                  How your own list gets built
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  On a real account you do not type any of this in. Suprascribe scans a Gmail,
                  Outlook or iCloud inbox for subscription receipts and builds the list from what it
                  finds - no bank account linked, no card details, and no email content kept after
                  the scan. You review what it found, reject anything wrong, and keep the rest.{' '}
                  <Link
                    href="/safety"
                    className="underline underline-offset-4 hover:text-foreground"
                  >
                    How email discovery keeps your inbox private
                  </Link>{' '}
                  covers exactly what is read and what is stored.
                </p>
                <div className="pt-2">
                  <Link href="/login?tab=signup">
                    <Button size="lg">Track your own subscriptions free</Button>
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </InsightsSettingsProvider>
    </DemoProvider>
  )
}
