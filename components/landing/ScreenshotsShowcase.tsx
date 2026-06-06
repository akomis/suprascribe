'use client'

import { ThemePicker } from '@/components/dashboard/settings/ThemePicker'
import { DiscoveryLearnMoreButton } from '@/components/landing/DiscoveryLearnMoreButton'
import DemoDiscovery from '@/components/landing/showcase/DemoDiscovery'
import DemoHistory from '@/components/landing/showcase/DemoHistory'
import DemoOverview from '@/components/landing/showcase/DemoOverview'
import DemoReminders from '@/components/landing/showcase/DemoReminders'
import { cn } from '@/lib/utils'
import { ComponentType } from 'react'

interface ShowcaseSection {
  id: string
  title: string
  description: string
  component: ComponentType
}

const sections: ShowcaseSection[] = [
  {
    id: 'discovery',
    title: 'Auto Discovery',
    description:
      'Automatically detect subscriptions from your email inbox. Connect via Gmail, Outlook, iCloud or use IMAP for any email provider. Our system scans in a privacy-aware way for recurring charges, making it effortless to keep track of everything.',
    component: DemoDiscovery,
  },
  {
    id: 'history',
    title: 'History & Quick Unsubscribe',
    description:
      'Keep a complete record of your subscription journey. Track when you started, paused, or cancelled services, review past spending patterns in one organized timeline, and quickly cancel any service you no longer need by getting to the unsubscribe pages instantly.',
    component: DemoHistory,
  },
  {
    id: 'reminders',
    title: 'Renewal Reminders',
    description:
      'Never get caught off guard by an unexpected charge. Set up email reminders and choose exactly how many days before a renewal you want to be notified - giving you time to decide whether to keep, pause, or cancel before you are billed.',
    component: DemoReminders,
  },
  {
    id: 'overview',
    title: 'Complete Overview',
    description:
      'Get a comprehensive view of all your (active & past) subscriptions in one place. Track your monthly and annual spending (current & forecast), see upcoming renewals, and understand exactly where your money goes all in a clean and modern interface.',
    component: DemoOverview,
  },
]

export function ScreenshotsShowcase() {
  return (
    <section className="py-12 sm:py-16 md:py-20 -mx-4 md:mx-0">
      <div className="mx-auto max-w-6xl px-4">
        <div className="space-y-12 sm:space-y-16 md:space-y-20">
          {sections.map((section, index) => {
            const isComponentLeft = index % 2 === 0
            const SectionComponent = section.component

            return (
              <div
                key={section.id}
                className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center"
              >
                {/* Demo Component - Always second on mobile */}
                <div className={cn(isComponentLeft ? 'md:order-1' : 'md:order-2')}>
                  <SectionComponent />
                </div>

                {/* Text Content - Always first on mobile */}
                <div className={cn('space-y-2', isComponentLeft ? 'md:order-2' : 'md:order-1')}>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{section.title}</h2>
                  <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                    {section.description}
                  </p>
                  {/* Learn More button and real-time counter for Smart Discovery */}
                  {section.id === 'discovery' && (
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-4 gap-4">
                      {/* <DiscoveryRealCounter /> */}
                      <DiscoveryLearnMoreButton />
                    </div>
                  )}

                  {/* Theme Picker for Complete Overview - Separate Reveal for interactivity */}
                  {section.id === 'overview' && (
                    <div className="pt-4 pr-10 flex justify-end relative z-10">
                      <ThemePicker />
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
