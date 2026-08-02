import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import { Check, X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Subscription Tracker Without a Bank Account - No Plaid, No Linking',
  description:
    'A subscription tracker that never asks for your bank account. Suprascribe finds subscriptions by scanning your email instead of linking to Plaid - free, private, one-time Pro upgrade.',
  alternates: {
    canonical: 'https://www.suprascribe.com/subscription-tracker-without-bank-account',
  },
}

const pageFaqItems = faqItems.filter((item) =>
  [
    'Is there a subscription tracker that does not require bank access?',
    'How does auto-discovery work? Does it read all my emails?',
    'Is my data safe and private?',
    'Can I use Suprascribe without connecting my email?',
    'Is Suprascribe open source?',
    'Is Suprascribe really free?',
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
        'Subscription tracker that works without a bank account. Finds subscriptions by scanning email instead of linking to Plaid - no financial-account access, no monthly fee, free unlimited tier.',
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
    faqPageSchema(pageFaqItems),
    breadcrumbSchema(
      'Subscription Tracker Without a Bank Account',
      'https://www.suprascribe.com/subscription-tracker-without-bank-account',
    ),
  ],
}

const comparisonRows = [
  {
    feature: 'Bank account access required',
    suprascribe: false,
    suprascribeNote: 'Never - your financial accounts are never touched',
    bankApps: true,
    bankAppsNote: 'Full transaction history via Plaid',
  },
  {
    feature: 'How subscriptions are found',
    suprascribe: true,
    suprascribeNote: 'Scans your email receipts and renewal notices',
    bankApps: true,
    bankAppsNote: 'Reads every transaction on your accounts',
  },
  {
    feature: 'Data at risk in a breach',
    suprascribe: true,
    suprascribeNote: 'Only your list of subscriptions',
    bankApps: false,
    bankAppsNote: 'Bank connection and full spending history',
  },
  {
    feature: 'Works with no account linked at all',
    suprascribe: true,
    suprascribeNote: 'Add subscriptions manually, unlimited and free',
    bankApps: false,
    bankAppsNote: 'Auto-detection needs a linked bank',
  },
  {
    feature: 'Recurring monthly fee',
    suprascribe: false,
    suprascribeNote: 'No - one-time Pro upgrade only',
    bankApps: true,
    bankAppsNote: 'Most charge $4-$12/month for premium',
  },
  {
    feature: 'Open source',
    suprascribe: true,
    suprascribeNote: 'Full source code on GitHub',
    bankApps: false,
    bankAppsNote: 'Closed source',
  },
]

export default function SubscriptionTrackerWithoutBankAccountPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="A Subscription Tracker That Never Asks for Your Bank Account"
      description="Most subscription trackers only work if you hand over your bank login through Plaid. Suprascribe finds the same subscriptions by scanning your email - no bank access, no financial data exposure, no monthly fee. And you can skip email entirely and add them by hand."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Also worth exploring"
      relatedDescription="See how the no-bank-linking approach compares to the tools that require it."
      relatedPages={[
        { href: '/open-source-subscription-tracker', label: 'Open Source Subscription Tracker' },
        { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
        { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              No Bank Linking vs. Bank-Linked Apps
            </h2>
            <p className="text-muted-foreground">
              Both find your subscriptions. Only one needs the keys to your accounts.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Suprascribe</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Bank-linked apps
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
                        {row.bankApps ? (
                          <Check className="h-4 w-4 text-muted-foreground/60" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30" />
                        )}
                        <span className="text-xs text-muted-foreground text-center">
                          {row.bankAppsNote}
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

      <SEOSection title="Why Skip Bank Linking at All?">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Apps like Rocket Money, PocketGuard, and Trim detect subscriptions by connecting to your
            bank through Plaid. That connection gives them read access to your entire transaction
            history - every purchase, not just the recurring ones. To find a handful of
            subscriptions, you expose all of your spending.
          </p>
          <p>
            <strong className="text-foreground">Less data at risk.</strong> A manual or email-based
            tracker never holds your bank credentials, so a breach cannot expose your accounts. The
            only data involved is a list of the services you pay for.
          </p>
          <p>
            <strong className="text-foreground">Your email is a better record anyway.</strong>{' '}
            Almost every subscription sends a receipt or renewal notice. Your inbox captures
            subscriptions billed through the App Store, Google Play, and PayPal that a single bank
            statement can miss or disguise behind cryptic labels.
          </p>
          <p>
            <strong className="text-foreground">No recurring fee.</strong> Most bank-linked apps
            charge a monthly premium - you end up paying a subscription to manage your
            subscriptions. Suprascribe Pro is a one-time purchase.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">Two private ways to use Suprascribe</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              • <strong className="text-foreground">Fully manual.</strong> Add subscriptions by hand
              - unlimited and free, with nothing connected at all.
            </li>
            <li>
              • <strong className="text-foreground">Email auto-discovery (Pro).</strong> Connect
              Gmail, Outlook, or iCloud via OAuth. Only subscription-related emails are scanned, and
              no email content is ever stored.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Either way, your bank account is never involved. Suprascribe is open source, so you can
            verify exactly how your data is handled.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
