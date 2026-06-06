import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import { Mail, Search, Shield, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gmail Subscription Tracker - Find All Subscriptions in Your Inbox',
  description:
    'Automatically find every subscription buried in your Gmail. Suprascribe scans Gmail via OAuth to surface recurring payments - no bank access, no password shared, free forever.',
  alternates: {
    canonical: 'https://www.suprascribe.com/gmail-subscription-tracker',
  },
}

const gmailFaqItems = faqItems.filter((item) =>
  [
    'Can Suprascribe detect subscriptions from Gmail?',
    'How does auto-discovery work? Does it read all my emails?',
    'Is my data safe and private?',
    'Can I use Suprascribe without connecting my email?',
    'Which email providers are supported?',
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
        'Gmail subscription tracker that scans your inbox via OAuth to automatically find and list every recurring payment - no bank access required.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: 'Basic',
        description: 'Free forever - unlimited subscription tracking',
      },
    },
    faqPageSchema(gmailFaqItems),
    breadcrumbSchema(
      'Gmail Subscription Tracker',
      'https://www.suprascribe.com/gmail-subscription-tracker',
    ),
  ],
}

const gmailFeatures = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'OAuth - No Password Shared',
    description:
      'Connect Gmail with one click via Google OAuth. Suprascribe never sees your Gmail password and can be disconnected at any time from Google Account settings.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Scans Only Subscription Emails',
    description:
      'The scanner looks for receipts, renewal notices, and billing confirmations - not your personal messages. Unrelated emails are never read or stored.',
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Catches Forgotten Sign-Ups',
    description:
      'Free trials that auto-converted, services from years ago, small monthly charges hiding in your billing folder - the scanner surfaces all of them.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Done in Minutes',
    description:
      'Connect your Gmail, run the scan, and get a complete subscription list. No manual entry, no bank linking, no credit card required.',
  },
]

export default function GmailSubscriptionTrackerPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Find Every Subscription Hidden in Your Gmail"
      description="Years of receipts, billing confirmations, and renewal notices are sitting in your Gmail right now. Suprascribe scans them automatically via OAuth and builds your complete subscription list - for free, with no bank access required."
      primaryCta={{ href: '/login?tab=signup', label: 'Connect Gmail for Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={gmailFaqItems}
      relatedHeading="Tracking Subscriptions Is Just the Start"
      relatedDescription="Once you have your complete list, manage it all in one place - cancel, set reminders, and track spending over time."
      relatedPages={[
        { href: '/free-subscription-manager', label: 'Manage Subscriptions for Free' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How Gmail Scanning Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Suprascribe uses Gmail&apos;s official OAuth API - the same authentication used by
              Google Calendar and Google Drive integrations.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {gmailFeatures.map((feature) => (
              <div key={feature.title} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{feature.icon}</span>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SEOSection title="Why Email Beats Bank Linking">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Most subscription detection tools - Rocket Money, PocketGuard - require connecting your
            bank account via Plaid. That means handing over access to your complete transaction
            history to find subscriptions.
          </p>
          <p>
            Suprascribe takes a narrower approach: every subscription generates an email receipt.
            Scanning those receipts produces the same result - a complete subscription list -
            without touching your bank account at all. Your financial data stays between you and
            your bank.
          </p>
          <p>
            The Gmail scanner reads subject lines and sender addresses of emails matching
            subscription patterns. No email body content is stored. The scan is ephemeral - only the
            extracted subscription name, amount, and renewal date are saved.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What Gmail scanning finds</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Streaming services (Netflix, Spotify, YouTube Premium, Disney+)</li>
            <li>• SaaS tools (Adobe, Dropbox, Notion, Grammarly, LinkedIn Premium)</li>
            <li>• Free trials that converted to paid without notice</li>
            <li>• Annual subscriptions billed once a year and easily forgotten</li>
            <li>• Services billed under unfamiliar merchant names</li>
          </ul>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
