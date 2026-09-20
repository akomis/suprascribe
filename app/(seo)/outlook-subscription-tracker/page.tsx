import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema, softwareApplicationSchema } from '@/lib/utils/schema'
import { Mail, Search, Shield, Zap } from 'lucide-react'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Outlook Subscription Tracker - Free Scan',
  description:
    'Find every subscription buried in Outlook, Hotmail, or Live. Suprascribe scans your inbox via Microsoft OAuth - no bank access, no password shared.',
  path: '/outlook-subscription-tracker',
})

const outlookFaqItems = faqItems.filter((item) =>
  [
    'Can Suprascribe detect subscriptions from Outlook?',
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
    softwareApplicationSchema({
      description:
        'Outlook subscription tracker that scans your inbox via Microsoft OAuth to automatically find and list every recurring payment - no bank access required.',
    }),
    faqPageSchema(outlookFaqItems),
    breadcrumbSchema(
      'Outlook Subscription Tracker',
      'https://www.suprascribe.com/outlook-subscription-tracker',
    ),
  ],
}

const outlookFeatures = [
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Microsoft OAuth - No Password Shared',
    description:
      'Connect Outlook with one click through Microsoft OAuth, using read-only mail permission. Suprascribe never sees your Microsoft password, and access can be revoked at any time from your Microsoft account settings.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Scans Only Subscription Emails',
    description:
      'The scanner looks for receipts, renewal notices, and billing confirmations - not your personal messages. Unrelated emails are never read or stored.',
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'One Scan Covers Every Alias',
    description:
      'Outlook.com, Hotmail, Live, and MSN addresses are the same Microsoft mailbox. Connect once and the scan covers the receipts sent to every alias you have collected over the years.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Done in Minutes',
    description:
      'Connect your Outlook account, run the scan, and get a complete subscription list. No manual entry, no bank linking, no credit card required.',
  },
]

export default function OutlookSubscriptionTrackerPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      path="/outlook-subscription-tracker"
      title="Outlook Subscription Tracker: Find Every Hidden Subscription"
      description="Suprascribe is an Outlook subscription tracker that reads the receipts, billing confirmations, and renewal notices already sitting in your inbox. It connects via Microsoft OAuth and builds your complete subscription list - for free, with no bank access required."
      primaryCta={{ href: '/login?tab=signup', label: 'Connect Outlook for Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={outlookFaqItems}
      relatedHeading="Beyond the Outlook Scan"
      relatedDescription="Once you have your complete list, manage it all in one place - cancel, set reminders, and track spending over time."
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How Outlook Scanning Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Suprascribe uses the official Microsoft Graph mail API - the same authentication
              Microsoft uses for Teams and Office add-ins - with read-only access.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {outlookFeatures.map((feature) => (
              <div key={feature.title} className="space-y-2 p-4 border rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">{feature.icon}</span>
                  <h3 className="font-semibold">{feature.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <figure className="space-y-2 mx-auto max-w-sm">
            <Image
              src="/blog/autodiscovery-inbox-providers.png"
              alt="Suprascribe inbox connection screen offering Gmail, Outlook and iCloud"
              width={712}
              height={801}
              className="rounded-lg border w-full h-auto"
              sizes="(max-width: 768px) 100vw, 384px"
            />
            <figcaption className="text-xs text-muted-foreground text-center">
              Pick Outlook on the connection screen and approve the Microsoft consent prompt. No
              bank or card is ever requested.
            </figcaption>
          </figure>
        </div>
      </section>

      <SEOSection title="Why Scanning Outlook Beats Linking Your Bank">
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
            The Outlook scanner finds emails matching subscription patterns, then reads their
            subject, sender and body so the billing details can be extracted. No email content is
            stored. The scan is ephemeral - only the extracted subscription name, amount, and
            renewal date are saved.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What Outlook scanning finds</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Microsoft charges (Microsoft 365, Xbox Game Pass, OneDrive storage upgrades)</li>
            <li>• Streaming services (Netflix, Spotify, Disney+, Prime Video)</li>
            <li>• SaaS tools (Adobe, Dropbox, LinkedIn Premium, Grammarly)</li>
            <li>• Free trials that converted to paid without notice</li>
            <li>• Annual subscriptions billed once a year and easily forgotten</li>
            <li>• Receipts sent to an old Hotmail or Live alias you no longer check</li>
          </ul>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
