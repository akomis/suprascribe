import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema, softwareApplicationSchema } from '@/lib/utils/schema'
import { KeyRound, Mail, Search, Zap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'iCloud Subscription Tracker - Free Scan',
  description:
    'Find every subscription in iCloud Mail. Suprascribe connects over IMAP with a revocable app-specific password - no bank access, no Apple ID password.',
  path: '/icloud-subscription-tracker',
})

const icloudFaqItems = faqItems.filter((item) =>
  [
    'Can Suprascribe detect subscriptions from iCloud Mail?',
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
        'iCloud subscription tracker that scans your inbox over IMAP with an app-specific password to automatically find and list every recurring payment - no bank access required.',
    }),
    faqPageSchema(icloudFaqItems),
    breadcrumbSchema(
      'iCloud Subscription Tracker',
      'https://www.suprascribe.com/icloud-subscription-tracker',
    ),
  ],
}

const icloudFeatures = [
  {
    icon: <KeyRound className="h-6 w-6" />,
    title: 'App-Specific Password - Revocable Anytime',
    description:
      'Apple does not offer a public OAuth API for iCloud Mail, so Suprascribe connects over IMAP using an app-specific password you generate at appleid.apple.com. It grants mail access only, and you can revoke it from your Apple ID in one click.',
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: 'Scans Only Subscription Emails',
    description:
      'The scanner looks for receipts, renewal notices, and billing confirmations - not your personal messages. Unrelated emails are never read or stored.',
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: 'Catches What Apple Does Not List',
    description:
      'Settings then Subscriptions only shows what Apple bills you for. Anything charged straight to your card - Netflix, your gym, a SaaS tool bought on the web - never appears there, but the receipt landed in your iCloud inbox.',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Done in Minutes',
    description:
      'Paste the app-specific password, run the scan, and get a complete subscription list. No manual entry, no bank linking, no credit card required.',
  },
]

export default function IcloudSubscriptionTrackerPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      path="/icloud-subscription-tracker"
      title="iCloud Subscription Tracker: Find Every Hidden Subscription"
      description="Suprascribe is an iCloud subscription tracker that reads the receipts, billing confirmations, and renewal notices already sitting in your Apple inbox. It connects over IMAP with a revocable app-specific password - for free, with no bank access required."
      primaryCta={{ href: '/login?tab=signup', label: 'Connect iCloud for Free' }}
      secondaryCta={{ href: '/imap', label: 'IMAP Setup Guide' }}
      faqItems={icloudFaqItems}
      relatedHeading="Beyond the iCloud Scan"
      relatedDescription="Once you have your complete list, manage it all in one place - cancel, set reminders, and track spending over time."
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How iCloud Scanning Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Suprascribe connects to <code className="text-foreground">imap.mail.me.com</code> over
              TLS on port 993 with an app-specific password. The{' '}
              <Link href="/imap" className="underline underline-offset-4 hover:text-foreground">
                IMAP setup guide
              </Link>{' '}
              walks through generating one - it takes about a minute.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {icloudFeatures.map((feature) => (
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
              Pick iCloud on the connection screen, then paste the app-specific password. No bank or
              card is ever requested.
            </figcaption>
          </figure>
        </div>
      </section>

      <SEOSection title="Why Scanning iCloud Mail Beats Linking Your Bank">
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
            The iCloud scanner finds emails matching subscription patterns, then reads their
            subject, sender and body so the billing details can be extracted. No email content is
            stored. The scan is ephemeral - only the extracted subscription name, amount, and
            renewal date are saved.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What iCloud scanning finds</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>• Apple charges (iCloud+ storage, Apple TV+, Apple Music, Apple One, Arcade)</li>
            <li>• App Store subscriptions billed through your Apple ID</li>
            <li>• Services billed directly to your card, which Apple never shows you</li>
            <li>• Free trials that converted to paid without notice</li>
            <li>• Annual subscriptions billed once a year and easily forgotten</li>
            <li>• Receipts sent to a @me.com or @mac.com address you still own</li>
          </ul>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
