import { SubscriptionCalculator } from '@/components/calculator/SubscriptionCalculator'
import { SEOPage } from '@/components/shared/SEOPage'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ProPrice } from '@/components/landing/ProPrice'
import { faqItems } from '@/lib/config/faq'
import { getDiscountStatus } from '@/lib/config/discount'
import { buildMetadata } from '@/lib/utils/metadata'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import Link from 'next/link'

const CANONICAL = 'https://www.suprascribe.com/subscription-cost-calculator'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Cost Calculator - See What You Really Spend',
  description:
    'Free subscription cost calculator. Add your subscriptions, mix monthly, yearly, quarterly, and weekly billing, and get your true monthly and yearly total. No signup, nothing stored.',
  path: '/subscription-cost-calculator',
})

const calculatorFaqItems = faqItems.filter((item) =>
  [
    'How do I calculate my total monthly subscription cost?',
    'How much does the average person spend on subscriptions?',
    'Do I need an account to use the subscription calculator?',
    'How do I find all my subscriptions?',
    'Is Suprascribe really free?',
  ].includes(item.question),
)

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      name: 'Subscription Cost Calculator',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: CANONICAL,
      description:
        'Free calculator that adds up monthly, yearly, quarterly, and weekly subscriptions into a single monthly and yearly spending total.',
      isAccessibleForFree: true,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        description: 'Free to use - no account required',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Suprascribe',
        url: 'https://www.suprascribe.com',
      },
    },
    faqPageSchema(calculatorFaqItems),
    breadcrumbSchema('Subscription Cost Calculator', CANONICAL),
  ],
}

export default function SubscriptionCostCalculatorPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Subscription Cost Calculator"
      description="This free subscription cost calculator adds up every subscription you pay for - monthly, yearly, quarterly, or weekly - and shows what it actually costs you per month and per year. No signup, nothing stored."
      primaryCta={{ href: '/login?tab=signup', label: 'Find the Ones You Forgot' }}
      faqItems={calculatorFaqItems}
      relatedHeading="Tired of Doing This by Hand?"
      relatedDescription="Suprascribe tracks and manages your subscriptions for you - cancel, organize, set reminders, and more."
      relatedPages={[
        { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
        { href: '/subscription-management-app', label: 'Full Subscription Manager' },
        { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
        <SubscriptionCalculator />
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              The Real Total Is Higher Than This
            </h2>
            <p className="text-muted-foreground">
              A calculator can only add up the subscriptions you remember. The expensive ones are
              the ones you forgot: the trial that converted, the annual renewal that quietly
              recharged, the app you stopped opening a year ago.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">No manual tracking</h3>
              <p className="text-sm text-muted-foreground">
                Suprascribe Pro scans Gmail, Outlook, iCloud, or any IMAP inbox for receipts and
                renewal notices - no bank account linking.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Renewal Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Get told before a subscription renews, not after the charge lands - so you cancel
                while it still saves you money.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <h3 className="font-semibold">Cancel What You Don&apos;t Use</h3>
              <p className="text-sm text-muted-foreground">
                Quick unsubscribe links straight from your dashboard - no digging through account
                settings to find the cancel button.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 rounded-xl border p-6 text-center sm:flex-row sm:items-center sm:text-left">
            <div className="flex shrink-0 flex-col items-center gap-3">
              <ProPrice
                discount={getDiscountStatus()}
                className="text-3xl font-bold tracking-tight"
                strikeClassName="text-lg font-normal text-muted-foreground"
              />
              <Button size="lg" asChild>
                <Link href="/login?tab=signup">Find My Forgotten Subscriptions</Link>
              </Button>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Pro is a one-time payment - not another subscription.</p>
              <p className="text-sm text-muted-foreground">
                Pay once, own forever. Automatic tracking, renewal reminders, quick unsubscribe and
                more. The Basic tier stays free with unlimited manual tracking.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Just want a quick one-time scan?</h3>
              <p className="text-sm text-muted-foreground">
                Pay €1, connect one inbox, and instantly see your subscriptions with unsubscribe
                links. Ephemeral, no sign-up.
              </p>
            </div>
            <Button size="lg" variant="outline" asChild className="shrink-0">
              <Link href="/one-time-scan">Scan 1 inbox for €1</Link>
            </Button>
          </div>
        </div>
      </section>
    </SEOPage>
  )
}
