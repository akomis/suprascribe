import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import { Check, X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Rocket Money Alternative - No Bank Access, No Monthly Fee',
  description:
    'Looking for a Rocket Money alternative that does not require bank account access? Suprascribe finds subscriptions by scanning email instead - free forever, one-time Pro upgrade.',
  alternates: {
    canonical: 'https://www.suprascribe.com/rocket-money-alternative',
  },
}

const rocketFaqItems = faqItems.filter((item) =>
  [
    'Is there a subscription tracker that does not require bank access?',
    'Is Suprascribe really free?',
    'Is Pro really a one-time payment?',
    'How does auto-discovery work? Does it read all my emails?',
    'Is my data safe and private?',
    'Is Suprascribe open source?',
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
        'Rocket Money alternative that finds subscriptions through email scanning instead of bank linking - no Plaid access, no monthly fee, free unlimited tier.',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Basic',
          description: 'Free forever - unlimited subscription tracking',
        },
        {
          '@type': 'Offer',
          price: '10',
          priceCurrency: 'EUR',
          name: 'Pro',
          description: 'One-time purchase - auto-discovery, reminders, calendar',
        },
      ],
    },
    faqPageSchema(rocketFaqItems),
    breadcrumbSchema(
      'Rocket Money Alternative',
      'https://www.suprascribe.com/rocket-money-alternative',
    ),
  ],
}

const comparisonRows = [
  {
    feature: 'Subscription auto-discovery',
    suprascribe: true,
    suprascribeNote: 'Email scanning - no bank access needed',
    rocketMoney: true,
    rocketMoneyNote: 'Requires full bank account access via Plaid',
  },
  {
    feature: 'Bank account access required',
    suprascribe: false,
    suprascribeNote: 'Never',
    rocketMoney: true,
    rocketMoneyNote: 'Required for auto-detection',
  },
  {
    feature: 'Free tier',
    suprascribe: true,
    suprascribeNote: 'Unlimited subscriptions, free forever',
    rocketMoney: true,
    rocketMoneyNote: 'Limited features on free plan',
  },
  {
    feature: 'Recurring monthly fee',
    suprascribe: false,
    suprascribeNote: 'No - one-time €10 Pro upgrade only',
    rocketMoney: true,
    rocketMoneyNote: '$4–$12/month for premium',
  },
  {
    feature: 'Open source',
    suprascribe: true,
    suprascribeNote: 'Full source code on GitHub',
    rocketMoney: false,
    rocketMoneyNote: 'Closed source',
  },
  {
    feature: 'Subscription-focused',
    suprascribe: true,
    suprascribeNote: 'Purpose-built for subscription tracking',
    rocketMoney: false,
    rocketMoneyNote: 'General personal finance app',
  },
]

export default function RocketMoneyAlternativePage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="A Rocket Money Alternative That Does Not Touch Your Bank Account"
      description="Rocket Money finds subscriptions by reading your full transaction history via Plaid. Suprascribe finds the same subscriptions by scanning your email - same result, no bank access, no monthly fee. The free tier is unlimited."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={rocketFaqItems}
      relatedHeading="Compare All Alternatives"
      relatedDescription="See how Suprascribe stacks up against Rocket Money, YNAB, Bobby, and every other subscription tracker in one place."
      relatedPages={[
        { href: '/compare/rocket-money', label: 'Suprascribe vs Rocket Money' },
        { href: '/compare', label: 'All Comparisons' },
        { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Suprascribe vs. Rocket Money
            </h2>
            <p className="text-muted-foreground">
              Both tools automatically detect subscriptions. The difference is how.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Suprascribe</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Rocket Money
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{row.feature}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        {row.suprascribe ? (
                          <Check className="h-4 w-4 text-primary" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/50" />
                        )}
                        <span className="text-xs text-muted-foreground text-center">
                          {row.suprascribeNote}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col items-center gap-1">
                        {row.rocketMoney ? (
                          <Check className="h-4 w-4 text-muted-foreground/60" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30" />
                        )}
                        <span className="text-xs text-muted-foreground text-center">
                          {row.rocketMoneyNote}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Spotted something inaccurate?{' '}
            <Link
              href="/contact"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Let us know
            </Link>
            .
          </p>
        </div>
      </section>

      <SEOSection title="Why People Switch from Rocket Money">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Rocket Money works - it genuinely finds subscriptions and can even negotiate bills on
            your behalf. The trade-offs are the reason people look for alternatives.
          </p>
          <p>
            <strong className="text-foreground">Bank access.</strong> Rocket Money uses Plaid to
            connect your bank account, which gives it read access to your full transaction history -
            not just subscriptions. For many users, that level of financial data exposure is more
            than they want to grant to a third-party app.
          </p>
          <p>
            <strong className="text-foreground">Monthly fee.</strong> The premium tier costs $4–$12
            per month depending on what you pay, which means you&apos;re adding another recurring
            charge to manage your recurring charges. Suprascribe Pro is a one-time €10 purchase - no
            ongoing commitment.
          </p>
          <p>
            <strong className="text-foreground">Feature scope.</strong> Rocket Money is a full
            personal finance app. If all you want is to track and manage subscriptions, most of its
            features are noise. Suprascribe is purpose-built for subscriptions only.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">Suprascribe free tier includes</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Unlimited manual subscriptions - no cap</li>
            <li>• Full dashboard with spend insights</li>
            <li>• Multi-currency support</li>
            <li>• Complete subscription history</li>
            <li>• No credit card, no bank access, no recurring fee</li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Pro (one-time €10) adds email auto-discovery, renewal reminders, calendar view, search,
            and unsubscribe assistance.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
