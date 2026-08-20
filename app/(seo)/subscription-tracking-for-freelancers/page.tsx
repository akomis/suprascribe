import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Tracking for Freelancers - Separate Work From Personal',
  description:
    'Track the tools you pay for as a freelancer and keep business subscriptions separate from personal ones. Suprascribe scans your inbox to build the list - no bank access, one-time Pro upgrade.',
  path: '/subscription-tracking-for-freelancers',
})

const pageFaqItems = faqItems.filter((item) =>
  [
    'How do I separate business and personal subscriptions?',
    'Can freelancers use Suprascribe to track deductible subscriptions?',
    'Is there a subscription tracker that does not require bank access?',
    'How do I find all my subscriptions?',
    'Is Suprascribe really free?',
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
        audienceType: 'Freelancers, contractors, and self-employed professionals',
      },
      description:
        'Subscription tracker for freelancers. Finds recurring tool charges by scanning your inbox and groups them by category, payment method, or source inbox so business subscriptions stay separate from personal ones.',
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
      'Subscription Tracking for Freelancers',
      'https://www.suprascribe.com/subscription-tracking-for-freelancers',
    ),
  ],
}

const freelancerTools = [
  {
    name: 'Adobe Creative Cloud',
    why: 'The annual plan is billed monthly with an early-termination fee, so a quiet quarter still costs full price. Single-app plans are far cheaper if you only ever open one.',
  },
  {
    name: 'Canva Pro',
    why: 'Bought for one client deck and kept because it is cheap. Cheap and recurring is exactly the combination that survives every budget review.',
  },
  {
    name: 'Figma',
    why: 'Client work often arrives through their workspace, so your own paid editor seat can sit unused for months without any prompt to review it.',
  },
  {
    name: 'Notion',
    why: 'Doubles as personal notes and client project tracking, which makes it the classic example of a subscription that is only partly a business expense.',
  },
  {
    name: 'ChatGPT Plus',
    why: 'Charged to whichever card was on file when you signed up, usually the personal one, and then forgotten at the point where it matters most - tax time.',
  },
  {
    name: 'Google Workspace',
    why: 'Paid for the professional address on your own domain, then quietly used for personal mail too. It is small, annual in effect, and almost never revisited once the domain renews itself.',
  },
]

export default function SubscriptionTrackingForFreelancersPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Subscription Tracking for Freelancers"
      description="Subscription tracking for freelancers is messy: when you work for yourself, the line between a business tool and a personal one runs straight through your card statement. Suprascribe finds every recurring charge in your inbox and lets you group them by category, payment method, or the inbox they arrived in - so the split is obvious long before your accountant asks."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Subscription tracking for all"
      relatedDescription="The same tracker, different situations"
      relatedPages={[
        { href: '/subscription-tracking-for-business', label: 'For Business' },
        { href: '/subscription-tracking-for-startups', label: 'For Startups' },
        { href: '/subscription-tracking-for-families', label: 'For Families' },
        { href: '/subscription-tracking-for-students', label: 'For Students' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Subscriptions Most Freelancers Are Paying For
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Small enough individually to ignore, large enough together to matter on an irregular
              income.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {freelancerTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-5 space-y-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.why}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              Carrying all of them puts you{' '}
              <strong className="text-foreground">
                somewhere north of a hundred a month, well over a thousand a year
              </strong>{' '}
              - and that is before the client-specific tools. It is a meaningful share of a slow
              month, and a meaningful deduction if the list is complete.
            </p>
          </div>
        </div>
      </section>

      <SEOSection title="Why This Is Harder When You Work for Yourself">
        <div className="space-y-5 text-muted-foreground">
          <p>
            A company has an expense process. You have a card. Tools get bought mid-project because
            a client needs something delivered on Thursday, charged to whichever account was
            convenient, and never sorted afterwards. The result is one undifferentiated stream of
            recurring payments where roughly half are deductible and nobody knows which half.
          </p>
          <p>
            <strong className="text-foreground">
              Income is irregular; the subscriptions are not.
            </strong>{' '}
            A fixed monthly tooling cost is easy to carry in a good month and genuinely painful in a
            slow one. Knowing the exact number is what lets you decide which tools are worth keeping
            through a quiet quarter.
          </p>
          <p>
            <strong className="text-foreground">
              Deductions go unclaimed because the list is incomplete.
            </strong>{' '}
            Most freelancers can name their three biggest tools and forget the six small ones. Those
            six are real business expenses, and they are only missing from the tax return because
            they were missing from the list.
          </p>
          <p>
            <strong className="text-foreground">Client-driven tools accumulate.</strong> One client
            wants files in a specific format, another uses a particular platform. Those
            subscriptions outlive the projects that justified them, because cancelling requires
            remembering they exist.
          </p>
        </div>
      </SEOSection>

      <SEOSection title="How Suprascribe Helps">
        <div className="space-y-5 text-muted-foreground">
          <p>
            The receipts are already in your inbox, tagged with the amount, the service, and the
            date. Suprascribe reads them and turns that scattered record into one list you can sort
            the way your work is actually structured.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What that looks like in practice</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              • <strong className="text-foreground">Group by source inbox.</strong> If work receipts
              go to one address and personal ones to another, run discovery on both. Every
              subscription is tagged with the inbox it came from, so the business and personal split
              happens on its own.
            </li>
            <li>
              • <strong className="text-foreground">Group by category or payment method.</strong>{' '}
              Using one inbox for everything is fine - categorise each subscription once, or group
              by the card it bills to, and the separation holds from then on.
            </li>
            <li>
              • <strong className="text-foreground">Keep a complete record for tax time.</strong>{' '}
              Amount, currency, and billing frequency for every recurring tool, including the ones
              you cancelled during the year. Suprascribe is a tracker, not accounting software - it
              makes sure the list you hand over is complete.
            </li>
            <li>
              • <strong className="text-foreground">Reminders before renewals.</strong> Pro emails
              you ahead of a renewal date, which is when a rarely-used tool is worth reconsidering -
              not the week after it billed for another year.
            </li>
            <li>
              • <strong className="text-foreground">No bank account access.</strong> Discovery uses
              read-only OAuth on your inbox. Nothing connects to your business or personal accounts,
              and no email content is stored after a scan.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            The free tier tracks unlimited subscriptions manually, and Pro is a one-time purchase -
            which matters more than usual when your whole reason for tracking is that recurring
            costs add up.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
