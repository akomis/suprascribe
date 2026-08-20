import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Tracking for Business - See Every Tool You Pay For',
  description:
    'Track every business subscription in one place. Suprascribe finds recurring software charges by scanning your billing inbox - no bank access, no per-seat pricing, one-time Pro upgrade.',
  path: '/subscription-tracking-for-business',
})

const pageFaqItems = faqItems.filter((item) =>
  [
    'Can I use Suprascribe to track business subscriptions?',
    'How do I keep track of SaaS renewals so they do not auto-renew?',
    'Is there a subscription tracker that does not require bank access?',
    'How does auto-discovery work? Does it read all my emails?',
    'Is Suprascribe open source?',
    'Is Pro really a one-time payment?',
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
      audience: {
        '@type': 'Audience',
        audienceType: 'Business owners and small business operators',
      },
      description:
        'Subscription tracker for businesses. Finds recurring software charges by scanning the billing inbox instead of linking a bank account - group by category, payment method, or source inbox, with renewal reminders and multi-currency support.',
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
      'Subscription Tracking for Business',
      'https://www.suprascribe.com/subscription-tracking-for-business',
    ),
  ],
}

const businessTools = [
  {
    name: 'Slack',
    why: 'Priced per active user, so the bill grows quietly every time someone new is invited and never shrinks when they stop logging in.',
  },
  {
    name: 'Google Workspace',
    why: 'Accounts for people who have left keep billing until someone remembers to remove them. It is treated as infrastructure, so nobody reviews it.',
  },
  {
    name: 'Zoom',
    why: 'Bought for one project, kept forever. Extra host licences added for a busy quarter are almost never removed afterwards.',
  },
  {
    name: 'QuickBooks',
    why: 'Sits on a plan tier chosen years ago. Upgrades happen when a feature is needed; downgrades never happen when it is not.',
  },
  {
    name: 'Adobe Creative Cloud',
    why: 'Annual commitment billed monthly, with an early-termination fee. Cancelling in month three still costs you, so it renews by default.',
  },
  {
    name: 'Dropbox Business',
    why: 'Priced per user with a storage floor, so a three-person team pays a minimum seat count. Old shared folders keep it justified long after the files stopped being opened.',
  },
]

export default function SubscriptionTrackingForBusinessPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Subscription Tracking for Business"
      description="Subscription tracking for business starts with a problem: every company ends up paying for software nobody remembers buying. Suprascribe builds a complete list of your recurring tools by scanning the inbox your invoices already land in - no bank connection, no per-seat pricing, and no monthly fee for the privilege of tracking your monthly fees."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Subscription tracking for all"
      relatedDescription="The same tracker, different situations"
      relatedPages={[
        { href: '/subscription-tracking-for-startups', label: 'For Startups' },
        { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
        { href: '/subscription-tracking-for-families', label: 'For Families' },
        { href: '/subscription-tracking-for-students', label: 'For Students' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Subscriptions Almost Every Business Is Paying For
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              None of these are wasteful on their own. The problem is that no single person sees all
              of them at once.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {businessTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-5 space-y-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.why}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              For a small team, these together typically run into the{' '}
              <strong className="text-foreground">low hundreds per month</strong> - a few thousand a
              year, before anything else on the card statement. Most of it is per-user pricing, so
              the total moves with headcount whether or not anyone is watching.
            </p>
          </div>
        </div>
      </section>

      <SEOSection title="Why Businesses Lose Track">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Software gets bought the way it gets used: one person needs a tool, expenses it, and
            moves on. There is no moment in the calendar where somebody sits down and reads the full
            list of what the company pays for every month. The list only exists in fragments - a
            card statement here, an invoice folder there, a plan somebody chose in 2023.
          </p>
          <p>
            <strong className="text-foreground">Renewals arrive without a decision.</strong> Annual
            plans are the expensive ones, and they renew eleven months after anyone last thought
            about the tool. By the time the invoice appears, the money is gone and the refund window
            has usually closed.
          </p>
          <p>
            <strong className="text-foreground">Bank statements hide the details.</strong> Software
            billed through Stripe, an app store, or a reseller shows up under a merchant name that
            has nothing to do with the product. Your accounting export tells you money left; it does
            not reliably tell you what for.
          </p>
          <p>
            <strong className="text-foreground">Per-seat pricing drifts upward.</strong> Seats get
            added during a busy month and stay added. The unit price never changes, so nothing looks
            wrong - the total simply grows a little each quarter.
          </p>
        </div>
      </SEOSection>

      <SEOSection title="How Suprascribe Helps">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Your invoices already arrive somewhere. Suprascribe reads that inbox instead of your
            accounts, and turns it into one live list of everything you pay for on a recurring
            basis.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What that looks like in practice</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              • <strong className="text-foreground">Scan the inbox invoices land in.</strong>{' '}
              Connect Gmail, Outlook, or iCloud via OAuth - or any provider over IMAP. Run discovery
              on more than one address if billing and general mail are separated, and group the
              results by source inbox.
            </li>
            <li>
              • <strong className="text-foreground">Group by category or payment method.</strong>{' '}
              See which card or account each tool bills to, and which part of the business it
              belongs to, without exporting anything to a spreadsheet.
            </li>
            <li>
              •{' '}
              <strong className="text-foreground">Get renewal reminders before the charge.</strong>{' '}
              Pro emails you ahead of a renewal date and shows every upcoming one on a calendar, so
              the keep-or-cancel decision happens while it still saves money.
            </li>
            <li>
              • <strong className="text-foreground">Handle multi-currency properly.</strong> Most
              software bills in USD while the account is in EUR or GBP. Suprascribe tracks each
              subscription in its own currency rather than flattening everything.
            </li>
            <li>
              • <strong className="text-foreground">No bank connection to approve.</strong> There is
              no Plaid link and no financial-account access, which removes the usual blocker on
              putting a finance tool in front of an accountant or an IT review.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Suprascribe is a single-account tool - one person holds the list, rather than a shared
            workspace with seats. It is also open source, so the way your data is handled can be
            verified rather than trusted, and Pro is a one-time purchase instead of one more
            recurring line on the statement you are trying to shrink.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
