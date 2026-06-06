import { CompetitorTable } from '@/components/landing/CompetitorTable'
import { SEOPage } from '@/components/shared/SEOPage'
import { Separator } from '@/components/ui/separator'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Free Subscription Tracker - Find Every Subscription Automatically',
  description:
    'Track all your subscriptions for free. Suprascribe scans Gmail, Outlook, and iCloud to find subscriptions you forgot about - no bank access, no recurring fees.',
  alternates: {
    canonical: 'https://www.suprascribe.com/free-subscription-tracker',
  },
}

const trackerFaqItems = faqItems.filter((item) =>
  [
    'Is Suprascribe really free?',
    'Can I use Suprascribe without connecting my email?',
    'How do I find all my subscriptions?',
    'Is there a subscription tracker that does not require bank access?',
    'Can Suprascribe detect subscriptions from Gmail?',
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
        'Free subscription tracker that scans Gmail, Outlook, and iCloud to find all your recurring payments automatically.',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: 'Basic',
        description: 'Free forever - unlimited subscription tracking',
      },
    },
    faqPageSchema(trackerFaqItems),
    breadcrumbSchema(
      'Free Subscription Tracker',
      'https://www.suprascribe.com/free-subscription-tracker',
    ),
  ],
}

export default function FreeSubscriptionTrackerPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="The Free Subscription Tracker That Finds Subscriptions For You"
      description="Suprascribe scans your Gmail, Outlook, or iCloud inbox to surface every recurring charge - streaming services, SaaS tools, memberships - without touching your bank account. The core tracker is free, forever."
      primaryCta={{ href: '/login?tab=signup', label: 'Start Tracking for Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={trackerFaqItems}
      relatedHeading="Also Looking For a Full Subscription Manager?"
      relatedDescription="Suprascribe tracks and manages - cancel, organize, set reminders, and view a spending calendar. All in one place."
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">How It Works</h2>
            <p className="text-muted-foreground">
              Three steps from signup to a complete subscription list.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2 text-center">
              <div className="text-4xl font-bold text-muted-foreground/30">1</div>
              <h3 className="font-semibold">Connect Your Inbox</h3>
              <p className="text-sm text-muted-foreground">
                Link Gmail, Outlook, or iCloud via OAuth. No password shared - only subscription
                emails are scanned.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="text-4xl font-bold text-muted-foreground/30">2</div>
              <h3 className="font-semibold">Suprascribe Scans</h3>
              <p className="text-sm text-muted-foreground">
                The scanner identifies receipts, billing notices, and renewal confirmations -
                nothing else is read or stored.
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="text-4xl font-bold text-muted-foreground/30">3</div>
              <h3 className="font-semibold">Review Your List</h3>
              <p className="text-sm text-muted-foreground">
                Your dashboard shows every subscription found - name, cost, billing cycle, and next
                renewal date.
              </p>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Prefer not to connect email?{' '}
            <Link
              href="/login?tab=signup"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Add subscriptions manually
            </Link>{' '}
            - no email required.
          </p>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Subscription Tracker Comparison
            </h2>
            <p className="text-muted-foreground">
              Not all subscription trackers are built the same.
            </p>
          </div>
          <CompetitorTable />
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
    </SEOPage>
  )
}
