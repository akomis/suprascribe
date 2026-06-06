import { CompetitorTable } from '@/components/landing/CompetitorTable'
import { SEOPage } from '@/components/shared/SEOPage'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { competitors } from '@/lib/config/comparisons'
import { GITHUB_URL } from '@/lib/config/urls'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import { Check } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Subscription Management App - Gmail, Outlook & iCloud',
  description:
    'Suprascribe is a subscription management app that scans your inbox to find every recurring charge. Works with Gmail, Outlook, iCloud, and any IMAP email. Free tier available.',
  alternates: {
    canonical: 'https://www.suprascribe.com/subscription-management-app',
  },
}

const appFaqItems = faqItems.filter((item) =>
  [
    'Which email providers are supported?',
    'How does auto-discovery work? Does it read all my emails?',
    'Is my data safe and private?',
    'Is Pro really a one-time payment?',
    'Is Suprascribe open source?',
    'Can I use Suprascribe without connecting my email?',
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
        'Subscription management app that automatically discovers and tracks recurring payments by scanning Gmail, Outlook, iCloud, and IMAP email inboxes.',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Basic',
          description: 'Free forever - unlimited subscription management',
        },
        {
          '@type': 'Offer',
          price: '10',
          priceCurrency: 'EUR',
          name: 'Pro',
          description: 'One-time purchase - auto-discovery and advanced features',
        },
      ],
    },
    faqPageSchema(appFaqItems),
    breadcrumbSchema(
      'Subscription Management App',
      'https://www.suprascribe.com/subscription-management-app',
    ),
  ],
}

const emailProviders = [
  { name: 'Gmail', method: 'OAuth (secure, no password)' },
  { name: 'Outlook / Hotmail', method: 'OAuth (secure, no password)' },
  { name: 'iCloud Mail', method: 'App-specific password via IMAP' },
  { name: 'Yahoo Mail', method: 'IMAP' },
  { name: 'ProtonMail', method: 'IMAP Bridge' },
  { name: 'Any IMAP inbox', method: 'IMAP' },
]

export default function SubscriptionManagementAppPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="The Subscription Management App Built Around Your Inbox"
      description="Suprascribe connects to Gmail, Outlook, iCloud, or any IMAP inbox and automatically identifies every recurring payment. No bank linking. No manual digging through receipts. A complete subscription list in minutes."
      primaryCta={{ href: '/login?tab=signup', label: 'Get Started Free' }}
      secondaryCta={{ href: '/demo', label: 'Try the Demo' }}
      faqItems={appFaqItems}
      relatedHeading="Looking for a Free Option?"
      relatedDescription="The Basic tier is free forever - unlimited subscriptions, full dashboard."
      relatedPages={[
        { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
        { href: '/free-subscription-manager', label: 'Manage Subscriptions for Free' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Works With Your Email Provider
            </h2>
            <p className="text-muted-foreground">
              Connect any inbox - OAuth or IMAP. Your email credentials are never stored.
            </p>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Provider</th>
                  <th className="text-left py-3 px-4 font-medium">Connection Method</th>
                  <th className="text-center py-3 px-4 font-medium">Supported</th>
                </tr>
              </thead>
              <tbody>
                {emailProviders.map((provider, i) => (
                  <tr
                    key={provider.name}
                    className={i < emailProviders.length - 1 ? 'border-b' : ''}
                  >
                    <td className="py-3 px-4 font-medium">{provider.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{provider.method}</td>
                    <td className="text-center py-3 px-4">
                      <Check className="h-4 w-4 mx-auto text-primary" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Want to set up IMAP manually?{' '}
            <Link
              href="/imap"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              See the IMAP setup guide
            </Link>
            .
          </p>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How Suprascribe Compares
            </h2>
            <p className="text-muted-foreground">
              Most subscription management apps require bank access or charge monthly fees.
              Suprascribe does neither.
            </p>
          </div>
          <CompetitorTable />
          <div className="flex flex-wrap gap-2 justify-center">
            {competitors.map((c) => (
              <Link key={c.slug} href={`/compare/${c.slug}`}>
                <Button variant="outline" size="sm">
                  vs. {c.name}
                </Button>
              </Link>
            ))}
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

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Privacy First, By Design
            </h2>
          </div>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Suprascribe scans email for subscription signals only - receipts, renewal notices, and
              billing confirmations. Unrelated email content is never read, processed, or stored.
              After a scan completes, only the extracted subscription data is saved to your account.
            </p>
            <p>
              The codebase is fully open source. You can read exactly how email scanning works, what
              data is stored, and how it is protected - on GitHub, right now.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/safety">
              <Button variant="outline">How Email Discovery Works</Button>
            </Link>
            <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">View on GitHub</Button>
            </Link>
          </div>
        </div>
      </section>
    </SEOPage>
  )
}
