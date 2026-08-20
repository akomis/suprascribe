import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Tracking for Families - One List for the Whole Household',
  description:
    'Track every household subscription in one place and find the duplicates. Suprascribe scans your inboxes to build the list - no bank access, free unlimited tracking, one-time Pro upgrade.',
  path: '/subscription-tracking-for-families',
})

const pageFaqItems = faqItems.filter((item) =>
  [
    "Can I track my family's subscriptions in one place?",
    'How do I find duplicate subscriptions in my household?',
    'How do I find all my subscriptions?',
    'Is my data safe and private?',
    'Is Suprascribe really free?',
    'How do I cancel a subscription on my iPhone?',
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
        audienceType: 'Families and households',
      },
      description:
        'Subscription tracker for households. Finds streaming, music, and cloud storage subscriptions across several inboxes and app store accounts, groups them by source inbox or payment method, and surfaces duplicate plans.',
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
      'Subscription Tracking for Families',
      'https://www.suprascribe.com/subscription-tracking-for-families',
    ),
  ],
}

const familyTools = [
  {
    name: 'Netflix',
    why: 'The household plan everyone assumes is shared. Adult children who moved out often keep watching on it, or quietly started paying for their own.',
  },
  {
    name: 'Spotify Family',
    why: 'Only saves money if everyone actually moves onto it. Individual plans left running alongside the family one are the single most common household duplicate.',
  },
  {
    name: 'Disney+',
    why: 'Signed up for one series, kept through the summer nobody opened it. Annual plans renew at a date that has no relationship to when the kids stopped watching.',
  },
  {
    name: 'iCloud+',
    why: 'Every family member hits their storage limit eventually and upgrades on their own device. Several small storage plans cost more than one shared family tier.',
  },
  {
    name: 'Amazon Prime',
    why: 'Usually billed annually to whoever set it up, so it is invisible eleven months of the year - and its video, music, and delivery benefits overlap with things the household pays for separately.',
  },
  {
    name: 'YouTube Premium',
    why: 'Bought individually by whoever got tired of ads first. The family plan requires everyone to share a home address, so households often end up with two or three separate individual plans instead.',
  },
]

export default function SubscriptionTrackingForFamiliesPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Subscription Tracking for Families"
      description="Subscription tracking for families is hard because household subscriptions are spread across several inboxes, two app stores, and whoever happened to sign up first. Suprascribe pulls them into one list so you can finally see the total, spot the plans you are paying for twice, and cancel what nobody has opened in months."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Subscription tracking for all"
      relatedDescription="The same tracker, different situations"
      relatedPages={[
        { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
        { href: '/subscription-tracking-for-business', label: 'For Business' },
        { href: '/subscription-tracking-for-startups', label: 'For Startups' },
        { href: '/subscription-tracking-for-students', label: 'For Students' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Subscriptions in Almost Every Household
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              The issue is rarely any single one of these. It is that two people in the same house
              are often paying for the same thing.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {familyTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-5 space-y-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.why}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              These alone put a typical household{' '}
              <strong className="text-foreground">
                around seventy a month, roughly eight hundred a year
              </strong>{' '}
              - and that is the tidy version, where nobody is paying twice. Add one duplicated music
              or streaming plan and the real figure climbs without anyone deciding it should.
            </p>
          </div>
        </div>
      </section>

      <SEOSection title="Why Households Pay for the Same Thing Twice">
        <div className="space-y-5 text-muted-foreground">
          <p>
            A household is several people signing up independently over several years. Someone
            started a music subscription in university and never moved onto the family plan. Someone
            else pays for extra phone storage on their own account. Each decision was sensible on
            its own, and nobody has ever seen all of them written down together.
          </p>
          <p>
            <strong className="text-foreground">The charges are split across accounts.</strong> Some
            bill through the App Store, some through Google Play, some directly to a card, some to a
            PayPal balance. There is no single screen that lists them, which is why the total is
            almost always higher than anyone guesses.
          </p>
          <p>
            <strong className="text-foreground">
              Family plans only save money if people move.
            </strong>{' '}
            Upgrading to a family tier while an individual plan keeps billing means paying more, not
            less. This is the most common and most expensive household duplicate, and it can run for
            years.
          </p>
          <p>
            <strong className="text-foreground">Nobody owns the review.</strong> Household bills get
            checked when something feels wrong. Subscriptions never feel wrong - each charge is
            small and each one was, at some point, wanted.
          </p>
        </div>
      </SEOSection>

      <SEOSection title="How Suprascribe Helps">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Every subscription in the house sent a receipt to somebody. Suprascribe reads those
            inboxes and builds the one list your household has never had.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What that looks like in practice</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              • <strong className="text-foreground">Scan more than one inbox.</strong> Run discovery
              on each address that receives receipts - Gmail, Outlook, and iCloud over OAuth, or any
              provider over IMAP. Each subscription is tagged with the inbox it came from, so you
              can see at a glance who is paying for what.
            </li>
            <li>
              • <strong className="text-foreground">Spot the duplicates.</strong> With every
              household subscription in one view, grouped by service, overlapping streaming, music,
              and storage plans stop hiding behind separate statements.
            </li>
            <li>
              • <strong className="text-foreground">Group by payment method.</strong> See which card
              or account each charge lands on, which is usually the fastest way to work out which
              ones were forgotten entirely.
            </li>
            <li>
              • <strong className="text-foreground">Reminders before renewal.</strong> Pro emails
              you ahead of each renewal date and shows them on a calendar, so an annual plan gets a
              decision instead of an automatic charge.
            </li>
            <li>
              • <strong className="text-foreground">Nothing touches your bank.</strong> There is no
              Plaid link and no card connection - only read-only email access, and no email content
              is stored after a scan.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Suprascribe is a single-account tool, so in practice whoever manages the household bills
            keeps the list. Tracking is free and unlimited, and Pro is a one-time purchase rather
            than one more monthly charge on a pile you are trying to reduce.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
