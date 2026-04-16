'use client'

import { ThemePicker } from '@/components/dashboard/settings/ThemePicker'
import { DiscoveryLearnMoreButton } from '@/components/landing/DiscoveryLearnMoreButton'
import { DiscoveryRealCounter } from '@/components/landing/DiscoveryRealCounter'
import DemoDiscovery from '@/components/landing/showcase/DemoDiscovery'
import DemoHistory from '@/components/landing/showcase/DemoHistory'
import DemoOverview from '@/components/landing/showcase/DemoOverview'
import { cn } from '@/lib/utils'
import { ComponentType } from 'react'
import { Reveal } from './Reveal'

interface ShowcaseSection {
  id: string
  title: string
  description: string
  component: ComponentType
}

const sections: ShowcaseSection[] = [
  {
    id: 'discovery',
    title: 'Smart Discovery',
    description:
      'Automatically detect subscriptions from your email inbox. Connect via Gmail, Outlook, iCloud or use IMAP for any email provider. Our system scans in a privacy-aware way for recurring charges, making it effortless to keep track of everything.',
    component: DemoDiscovery,
  },
  {
    id: 'overview',
    title: 'Complete Overview',
    description:
      'Get a comprehensive view of all your (active & past) subscriptions in one place. Track your monthly and annual spending, see upcoming renewals, and understand exactly where your money goes all in a clean and modern interface.',
    component: DemoOverview,
  },
  {
    id: 'history',
    title: 'Subscription History',
    description:
      'Keep a complete record of your subscription journey. Track when you started, paused, or cancelled services, review past spending patterns in one organized timeline, and quickly unsubscribe from services you no longer need.',
    component: DemoHistory,
  },
]

export function ScreenshotsShowcase() {
  return (
    <section className="container mx-auto py-12 sm:py-16 md:py-20 px-2 sm:px-4">
      <div className="mx-auto max-w-6xl">
        <div className="space-y-12 sm:space-y-16 md:space-y-20">
          {sections.map((section, index) => {
            const isComponentLeft = index % 2 === 0
            const SectionComponent = section.component

            return (
              <div
                key={section.id}
                className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-center"
              >
                {/* Text Content - Always first on mobile */}
                <div className={cn('space-y-4', isComponentLeft ? 'md:order-2' : 'md:order-1')}>
                  <Reveal delayMs={400}>
                    <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                      {section.title}
                    </h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {section.description}
                    </p>
                    {/* Learn More button and real-time counter for Smart Discovery */}
                    {section.id === 'discovery' && (
                      <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-4 gap-4">
                        <DiscoveryRealCounter />
                        <DiscoveryLearnMoreButton />
                      </div>
                    )}
                  </Reveal>
                  {/* Theme Picker for Complete Overview - Separate Reveal for interactivity */}
                  {section.id === 'overview' && (
                    <Reveal delayMs={400} preserveInteractivity={true}>
                      <div className="pt-4 pr-10 flex justify-end relative z-10">
                        <ThemePicker />
                      </div>
                    </Reveal>
                  )}
                </div>

                {/* Demo Component - Always second on mobile */}
                <div className={cn(isComponentLeft ? 'md:order-1' : 'md:order-2')}>
                  <Reveal>
                    <SectionComponent />
                  </Reveal>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
