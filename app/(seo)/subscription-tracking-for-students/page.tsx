import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema } from '@/lib/utils/schema'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Tracking for Students - See What You Actually Pay Each Month',
  description:
    'Track every student subscription in one place and catch discounts before they expire at full price. Suprascribe scans your inbox to build the list - no bank access, free unlimited tracking, one-time Pro upgrade.',
  path: '/subscription-tracking-for-students',
})

const pageFaqItems = faqItems.filter((item) =>
  [
    'How can students keep track of subscriptions on a small budget?',
    'What happens to my student discount when I graduate?',
    'How do I stop free trials from turning into paid subscriptions?',
    'How do I cancel a subscription on my iPhone?',
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
        audienceType: 'Students',
      },
      description:
        'Subscription tracker for students. Finds streaming, music, storage, and study-tool charges by scanning the inbox they were signed up with - tracks student plans and the dates their discounts expire, with renewal reminders and no bank access.',
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
      'Subscription Tracking for Students',
      'https://www.suprascribe.com/subscription-tracking-for-students',
    ),
  ],
}

const studentTools = [
  {
    name: 'Spotify Premium Student',
    why: 'Cheap enough to forget, and it needs re-verifying every year. When the verification lapses the plan quietly moves to full price without a new decision from you.',
  },
  {
    name: 'Netflix',
    why: 'Started on a flatmate arrangement that nobody tracks. Either you are paying for a household you have moved out of, or you started your own plan and the old share is still coming out of your account.',
  },
  {
    name: 'Adobe Creative Cloud',
    why: 'The student price is heavily discounted for the first year and then jumps sharply on renewal. It is billed annually, so the increase arrives long after the course that justified it ended.',
  },
  {
    name: 'ChatGPT Plus',
    why: 'Signed up during an assessment period and kept through the holidays. There is no student tier to fall back to, so the full monthly price runs through every quiet month.',
  },
  {
    name: 'Amazon Prime Student',
    why: 'Free for the trial period, then half price, then full price - a three-stage escalation with no prompt at any step. The delivery benefit is the reason people miss the video and music charges bundled with it.',
  },
  {
    name: 'iCloud+ or Google One',
    why: 'The smallest storage tier is a couple of euros and gets upgraded the first time a phone backup fails. It bills to an app store account rather than a card, which is why it rarely shows up when you check your bank app.',
  },
]

export default function SubscriptionTrackingForStudentsPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="Subscription Tracking for Students"
      description="Subscription tracking for students is about real money: on a student budget the difference between what you think you spend on subscriptions and what you actually spend adds up fast. Suprascribe scans the inbox you signed up with and builds one list - including the student plans about to renew at full price."
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading="Subscription tracking for all"
      relatedDescription="The same tracker, different situations"
      relatedPages={[
        { href: '/subscription-tracking-for-families', label: 'For Families' },
        { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
        { href: '/subscription-tracking-for-startups', label: 'For Startups' },
        { href: '/subscription-tracking-for-business', label: 'For Business' },
      ]}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Subscriptions Almost Every Student Is Paying For
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              Each one is a few euros. The problem is that most of them are discounted temporarily,
              and nothing tells you when that stops.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {studentTools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-5 space-y-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.why}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              At student pricing these come to{' '}
              <strong className="text-foreground">roughly forty a month</strong> - and closer to
              double that once the discounts expire, which they all do on dates nobody wrote down.
              That gap is the part worth catching early.
            </p>
          </div>
        </div>
      </section>

      <SEOSection title="Why Student Subscriptions Are Easy to Lose Track Of">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Student subscriptions get signed up for across several years, on whichever account was
            open at the time - a personal Gmail, a university address, an app store account tied to
            a phone bought before you started. Nothing joins those up, so the total only exists as a
            feeling rather than a number.
          </p>
          <p>
            <strong className="text-foreground">Discounts expire silently.</strong> Student pricing
            is time-limited and verification-based. When the term ends or re-verification fails, the
            plan converts to the full adult price automatically, and the first full-price charge is
            the only notification you get.
          </p>
          <p>
            <strong className="text-foreground">Trials are aimed squarely at you.</strong> Free
            months for students are a standard acquisition tactic, and they are designed to convert
            without a reminder. The signup confirmation lands in your inbox weeks before the charge
            reaches your card.
          </p>
          <p>
            <strong className="text-foreground">App store billing hides the charge.</strong> A lot
            of student subscriptions bill through the App Store, Google Play, or PayPal rather than
            directly to a card, so they do not appear under the service name when you scroll your
            banking app looking for what to cut.
          </p>
          <p>
            <strong className="text-foreground">Shared plans outlive the sharing.</strong> Streaming
            splits with flatmates, a family plan back home, a friend covering one service while you
            cover another - these arrangements end when people move, but the payments usually do
            not.
          </p>
        </div>
      </SEOSection>

      <SEOSection title="How Suprascribe Helps">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Every subscription you have ever started sent a receipt to an inbox. Suprascribe reads
            those receipts and turns them into one list with real numbers on it.
          </p>
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">What that looks like in practice</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            <li>
              • <strong className="text-foreground">Scan the inboxes you signed up with.</strong>{' '}
              Run discovery on your personal address and your university one - Gmail, Outlook, and
              iCloud over OAuth, or any provider over IMAP. Each subscription is tagged with the
              inbox it came from.
            </li>
            <li>
              • <strong className="text-foreground">Catch discounts before they end.</strong> Record
              a student plan with the date its discount expires, and Pro emails you ahead of it -
              which is the point where full price is worth a decision rather than a surprise.
            </li>
            <li>
              • <strong className="text-foreground">See the real monthly total.</strong> Amounts,
              currencies, and billing frequencies in one place, so an annual plan is compared on the
              same footing as a monthly one instead of being ignored eleven months of the year.
            </li>
            <li>
              • <strong className="text-foreground">Find the app store charges.</strong> Receipts
              from the App Store, Google Play, and PayPal name the service even when your bank
              statement does not, so subscriptions billed through them stop being invisible.
            </li>
            <li>
              • <strong className="text-foreground">No bank account needed.</strong> Discovery uses
              read-only email access, so it works the same whether you are on a student account, a
              prepaid card, or a parent&apos;s card - and no email content is stored after a scan.
            </li>
          </ul>
          <p className="text-xs text-muted-foreground pt-1">
            Tracking is free and unlimited, and Pro is a one-time purchase rather than a monthly fee
            - which matters when the whole point is to cut recurring costs, not add one.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
