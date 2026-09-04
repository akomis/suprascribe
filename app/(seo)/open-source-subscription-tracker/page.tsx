import { seoPageBlogLinks } from '@/lib/config/seoPages'
import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import { Check, X } from 'lucide-react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'
import Link from 'next/link'

export const metadata: Metadata = buildMetadata({
  title: 'Open Source Subscription Tracker - Auditable, Self-Hostable, One-Time',
  description:
    'An open source subscription tracker you can audit and self-host. Suprascribe finds subscriptions by scanning email - no bank access, no recurring fee, full source code on GitHub.',
  path: '/open-source-subscription-tracker',
})

const pageFaqItems = faqItems.filter((item) =>
  [
    'Is Suprascribe open source?',
    'Is my data safe and private?',
    'Is there a subscription tracker that does not require bank access?',
    'How does auto-discovery work? Does it read all my emails?',
    'Is Pro really a one-time payment?',
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
        'Open source subscription tracker with full source code on GitHub. Finds subscriptions by scanning email instead of bank linking - auditable, self-hostable, no recurring fee.',
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
      'Open Source Subscription Tracker',
      'https://www.suprascribe.com/open-source-subscription-tracker',
    ),
  ],
}

const comparisonRows = [
  {
    feature: 'Source code available',
    suprascribe: true,
    suprascribeNote: 'Full code on GitHub - inspect exactly what runs',
    closed: false,
    closedNote: 'Closed source - you trust a black box',
  },
  {
    feature: 'Self-hostable',
    suprascribe: true,
    suprascribeNote: 'Run it on your own infrastructure',
    closed: false,
    closedNote: 'Vendor-hosted only',
  },
  {
    feature: 'No bank linking',
    suprascribe: true,
    suprascribeNote: 'Email scanning, never your bank',
    closed: false,
    closedNote: 'Many require Plaid access',
  },
  {
    feature: 'One-time upgrade',
    suprascribe: true,
    suprascribeNote: 'One-time Pro upgrade only',
    closed: false,
    closedNote: 'Most charge monthly or per seat',
  },
  {
    feature: 'Privacy verifiable',
    suprascribe: true,
    suprascribeNote: 'Claims are checkable in the code',
    closed: false,
    closedNote: 'Take the privacy policy on faith',
  },
]

export default function OpenSourceSubscriptionTrackerPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Open Source Subscription Tracker"
      description="Most subscription trackers ask you to trust a closed-source app with your financial data. Suprascribe is an open source subscription tracker: the full source code is on GitHub, subscriptions are found by scanning email instead of your bank, and you pay once - not every month. Self-host it if you want total control."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Also worth exploring"
      relatedDescription="Open source is one differentiator - here is how the rest compares."
      blogSlugs={seoPageBlogLinks['/open-source-subscription-tracker']}
      relatedPages={[
        {
          href: '/subscription-tracker-without-bank-account',
          label: 'Tracker With No Bank Linking',
        },
        { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
        { href: '/compare', label: 'All Comparisons' },
        { href: '/subscription-tracking-for-startups', label: 'Tracking for Startups' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Open Source vs. Closed-Source Trackers
            </h2>
            <p className="text-muted-foreground">
              With a subscription tracker, &quot;trust us&quot; is not the same as &quot;check for
              yourself.&quot;
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Suprascribe</th>
                  <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                    Closed-source apps
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
                        {row.closed ? (
                          <Check className="h-4 w-4 text-muted-foreground/60" />
                        ) : (
                          <X className="h-4 w-4 text-muted-foreground/30" />
                        )}
                        <span className="text-xs text-muted-foreground text-center">
                          {row.closedNote}
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

      <SEOSection title="Why Open Source Matters for a Subscription Tracker">
        <div className="space-y-5 text-muted-foreground">
          <p>
            A subscription tracker sits close to sensitive data - your email, your spending, the
            services you rely on. With a closed-source app, every privacy promise is something you
            have to take on faith. With open source, you can read the code and confirm it.
          </p>
          <p>
            <strong className="text-foreground">Verifiable privacy.</strong> Suprascribe claims it
            never stores email content and only scans subscription-related messages. Because the
            source is public, that is not a marketing line - it is something you or any engineer can
            check line by line on GitHub.
          </p>
          <p>
            <strong className="text-foreground">No lock-in.</strong> You can export your data, and
            because the project is open source you can self-host it entirely on your own
            infrastructure. Your subscription data never has to leave systems you control.
          </p>
          <p>
            <strong className="text-foreground">One-time cost, not a rented tool.</strong> Open
            source and a one-time Pro purchase go together: you are not renting access to your own
            data month after month. Pay once, own it, self-host if you ever want to.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What you get</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Full source code on GitHub - auditable and self-hostable</li>
            <li>• Email-based discovery - no bank account access, ever</li>
            <li>• Unlimited free tier; Pro is a one-time purchase, no recurring fee</li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Prefer not to self-host? The hosted version runs the exact same open code, so the
            privacy guarantees are identical.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
