import { seoPageBlogLinks } from '@/lib/config/seoPages'
import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Tracking for Startups - Know Your Real SaaS Burn',
  description:
    'Track every tool your startup pays for. Suprascribe scans your billing inbox to find converted trials, forgotten annual plans, and usage-based bills - no bank access, one-time Pro upgrade.',
  path: '/subscription-tracking-for-startups',
})

const pageFaqItems = faqItems.filter((item) =>
  [
    'How do I track software spend at an early-stage startup?',
    'How do I stop free trials from turning into paid subscriptions?',
    'How do I keep track of SaaS renewals so they do not auto-renew?',
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
        audienceType: 'Startup founders and early-stage teams',
      },
      description:
        'Subscription tracker for startups. Finds converted trials, forgotten annual plans, and recurring developer-tool charges by scanning the billing inbox - no bank linking, renewal reminders, multi-currency, one-time Pro purchase.',
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
      'Subscription Tracking for Startups',
      'https://www.suprascribe.com/subscription-tracking-for-startups',
    ),
  ],
}

const startupTools = [
  {
    name: 'AWS',
    why: 'Billed on usage rather than a flat fee, so it never looks like a subscription - which is exactly why it is the one nobody audits. A test cluster left running for a demo bills every hour until someone notices.',
  },
  {
    name: 'Vercel',
    why: 'The hobby plan is free until one project needs a team feature. After that the seat count tracks headcount, including people who only ever needed to look at a preview URL.',
  },
  {
    name: 'Notion',
    why: 'Invited early to everyone, including contractors and advisors. Guests are cheap or free; members are not, and the difference is easy to get wrong.',
  },
  {
    name: 'Figma',
    why: 'Billed per editor rather than per viewer. One engineer nudging a component once turns a free viewer seat into a paid editor seat for the rest of the year.',
  },
  {
    name: 'Linear',
    why: 'Adopted during a sprint when the team was smaller. It scales with headcount silently, and the annual plan renews long after anyone compared it to alternatives.',
  },
  {
    name: 'GitHub',
    why: 'Free until the first private-repo team feature, then billed per seat - with Copilot as a second per-seat charge on top. Contractor accounts from a finished project keep billing on both.',
  },
]

export default function SubscriptionTrackingForStartupsPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Subscription Tracking for Startups"
      description="Subscription tracking for startups matters because at seed stage your tooling bill is a real line in the burn rate, and it is made of thirty small charges nobody has added up. Suprascribe scans the inbox your receipts land in and turns it into one list - converted trials, annual plans, and all the tools the team stopped opening months ago."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Subscription tracking for all"
      relatedDescription="The same tracker, different situations"
      blogSlugs={seoPageBlogLinks['/subscription-tracking-for-startups']}
      relatedPages={[
        { href: '/subscription-tracking-for-business', label: 'For Business' },
        { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
        { href: '/subscription-tracking-for-families', label: 'For Families' },
        { href: '/subscription-tracking-for-students', label: 'For Students' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Tools in Nearly Every Startup Stack
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Each one was the right call when it was adopted. The question is whether it still is,
              at the seat count you are now paying for.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {startupTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-5 space-y-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.why}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Most of these are per-seat, so a team of three or four is usually looking at{' '}
              <strong className="text-foreground">a few hundred a month</strong> before infra is
              counted at all - and AWS on top of that has no ceiling, only a bill. Against a seed
              runway, the tooling line is rarely the number founders expect it to be.
            </p>
          </div>
        </div>
      </section>

      <SEOSection title="Why Tooling Spend Escapes Early-Stage Teams">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Startups adopt tools faster than they review them. A founder signs up during a
            prototype, an engineer starts a trial to unblock a deploy, and both charges settle into
            the card statement as small, unremarkable amounts. Individually none of them justify a
            meeting. Together they are often a meaningful fraction of monthly burn.
          </p>
          <p>
            <strong className="text-foreground">Trials convert in silence.</strong> Almost no
            product warns you before the first real charge, but every one of them sends a signup
            confirmation. The evidence of what you are about to start paying for is in your inbox
            weeks before it reaches your card.
          </p>
          <p>
            <strong className="text-foreground">Annual plans outlive their usefulness.</strong> The
            discount is real, and so is the twelve-month gap before anyone reconsiders. Tools get
            replaced in month four and keep billing until month twelve because the renewal date
            lives nowhere.
          </p>
          <p>
            <strong className="text-foreground">The stack changes faster than the bill.</strong>{' '}
            Pivots, framework swaps, and team churn all leave residue: a monitoring service for a
            deprecated app, a design seat for someone who left, a database on a plan sized for
            traffic you no longer have.
          </p>
        </div>
      </SEOSection>

      <SEOSection title="How Suprascribe Helps">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Developer tools bill through Stripe, app stores, and resellers under names that rarely
            match the product, so reconstructing the stack from a bank export is guesswork. Your
            receipts are already accurate - Suprascribe reads them and builds the list for you.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What that looks like in practice</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              •{' '}
              <strong className="text-foreground">
                Catch trials at signup, not at conversion.
              </strong>{' '}
              Discovery picks up the confirmation emails trials send, so a converting plan can be
              recorded with its date before the first charge lands.
            </li>
            <li>
              • <strong className="text-foreground">See every renewal date on a calendar.</strong>{' '}
              Pro emails a reminder ahead of each renewal, which is the only reliable way to catch
              an annual plan before it rolls for another year.
            </li>
            <li>
              • <strong className="text-foreground">Keep past subscriptions on the record.</strong>{' '}
              Cancelled tools stay in your history, so you can see what the stack cost over time
              rather than only what it costs today.
            </li>
            <li>
              • <strong className="text-foreground">Track USD tools on a EUR account.</strong>{' '}
              Multi-currency support keeps each subscription in the currency it actually bills in,
              which matters when most of your stack is priced in dollars.
            </li>
            <li>
              • <strong className="text-foreground">No bank or card linking.</strong> Discovery uses
              read-only email access over OAuth. Your company accounts are never connected, and no
              email content is stored after a scan.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Suprascribe is a single-account tool rather than a shared workspace with seats - the
            founder or whoever owns the card keeps the list. The free tier tracks unlimited
            subscriptions manually, and Pro is a one-time purchase, so cutting your SaaS bill does
            not start by adding another SaaS bill.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
