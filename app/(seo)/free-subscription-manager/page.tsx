import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import { Bell, CalendarDays, Search, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Free Subscription Manager - Organize, Cancel & Track',
  description:
    'Manage all your subscriptions in one place for free. Suprascribe lets you organize, cancel, set reminders, and view a spending calendar - without paying for another subscription.',
  alternates: {
    canonical: 'https://www.suprascribe.com/free-subscription-manager',
  },
}

const managerFaqItems = faqItems.filter((item) =>
  [
    'Is Suprascribe really free?',
    "What's the difference between Basic and Pro?",
    'How do renewal reminders work?',
    'Is Pro really a one-time payment?',
    'How do I cancel a subscription I forgot about?',
    'Does Suprascribe work on iPhone and Android?',
  ].includes(item.question),
)

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'Suprascribe',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: 'https://www.suprascribe.com',
      description:
        'Free subscription manager to organize, cancel, and track all your recurring payments without connecting a bank account.',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Basic',
          description: 'Free forever - core subscription management',
        },
        {
          '@type': 'Offer',
          price: '10',
          priceCurrency: 'EUR',
          name: 'Pro',
          description: 'One-time purchase - reminders, calendar, auto-discovery',
        },
      ],
    },
    faqPageSchema(managerFaqItems),
    breadcrumbSchema(
      'Free Subscription Manager',
      'https://www.suprascribe.com/free-subscription-manager',
    ),
  ],
}

const managementFeatures = [
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Find Everything',
    description:
      'Auto-discovery scans Gmail, Outlook, and iCloud to surface subscriptions you forgot you signed up for.',
    tier: 'Pro',
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: 'Renewal Reminders',
    description:
      "Get an email before each renewal so you can decide whether to keep or cancel before you're charged.",
    tier: 'Pro',
  },
  {
    icon: <CalendarDays className="h-6 w-6" />,
    title: 'Calendar View',
    description:
      'See upcoming renewals on a calendar. Know exactly when money leaves your account each month.',
    tier: 'Pro',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Quick Unsubscribe',
    description: 'Navigate cancellation flows faster with built-in unsubscribe assistance.',
    tier: 'Pro',
  },
]

export default function FreeSubscriptionManagerPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="The Free Subscription Manager That Puts You in Control"
      description="Most subscription managers cost a monthly fee. Suprascribe does not - and never will. Manage unlimited subscriptions from your dashboard, set renewal reminders, view a billing calendar, and cancel what you no longer need."
      primaryCta={{ href: '/login?tab=signup', label: 'Start Managing for Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={managerFaqItems}
      relatedHeading="Want Automatic Discovery Too?"
      relatedDescription="Suprascribe scans your inbox to find subscriptions you might have missed - no manual entry needed."
      relatedPages={[
        { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
        { href: '/subscription-management-app', label: 'Subscription Management App' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Manage Subscriptions Without Paying for One
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              The irony of most subscription managers is that they charge you monthly to manage your
              other monthly charges. Suprascribe charges once for Pro - or nothing at all for the
              core features.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {managementFeatures.map((feature) => (
              <div key={feature.title} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{feature.icon}</span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <span className="text-xs text-muted-foreground border rounded px-1.5 py-0.5 ml-auto">
                    {feature.tier}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-3">
            <h3 className="font-semibold">Free forever - Basic tier includes:</h3>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>• Unlimited manual subscriptions</li>
              <li>• Full dashboard with spend insights</li>
              <li>• Complete subscription history</li>
              <li>• Multi-currency support</li>
            </ul>
            <p className="text-xs text-muted-foreground pt-1">
              Pro (one-time purchase) adds auto-discovery, reminders, calendar view, search, and
              unsubscribe assistance.
            </p>
          </div>
        </div>
      </section>

      <SEOSection title="What Makes a Good Subscription Manager?">
        <div className="space-y-5 text-muted-foreground">
          <p>
            A subscription manager should do one thing well: show you exactly what you&apos;re
            paying for and when. That means a clear list, meaningful renewal dates, and enough
            information to make a decision about each service.
          </p>
          <p>
            Most tools either charge monthly themselves (defeating the purpose) or require
            connecting your bank account (a significant privacy trade-off). Suprascribe takes a
            different approach: email scanning finds subscriptions without financial data access,
            and the Pro upgrade is a single payment - not another recurring charge.
          </p>
          <p>
            The free tier covers the basics for most people. Pro adds the automated discovery and
            proactive reminders that make the tool genuinely powerful for heavy subscription users.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
