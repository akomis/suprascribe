export interface CompetitorAdvantage {
  label: string
  detail?: string
}

export interface Competitor {
  slug: string
  name: string
  tagline: string
  isSubscription: boolean
  pricing: string
  strengths: string[]
  suprascribeWins: CompetitorAdvantage[]
  verdict: string
}

export const competitors: Competitor[] = [
  {
    slug: 'resubs',
    name: 'ReSubs',
    tagline: 'Mobile subscription tracker with a recurring fee',
    isSubscription: true,
    pricing:
      'Free tier capped at 5 subscriptions; paid plan is a recurring monthly subscription ($10/month)',
    strengths: [
      'Clean mobile UI',
      'Reminders for upcoming renewals',
      'Decent catalogue of subscriptions',
    ],
    suprascribeWins: [
      { label: 'Web-first', detail: 'Works in any browser - no app download needed' },
      { label: 'One-time purchase', detail: 'No recurring fee for Pro features, ever' },
      {
        label: 'Email auto-discovery',
        detail:
          'Finds your subscriptions automatically via Gmail, Outlook, or iCloud - no manual entry',
      },
      {
        label: 'No bank linking required',
        detail: 'Privacy preserved; we never touch your financial accounts',
      },
      { label: 'Unlimited free tier', detail: 'Track as many subscriptions as you want for free' },
    ],
    verdict: 'ReSubs charges you a subscription to track your subscriptions. Suprascribe does not.',
  },
  {
    slug: 'bobby',
    name: 'Bobby',
    tagline: 'iOS-only manual subscription tracker',
    isSubscription: false,
    pricing: 'Free up to 5 subscriptions; ~$1.99 one-time in-app purchase unlocks full app',
    strengths: ['Polished iOS design', 'Apple Watch support', 'Nice charts and spend overview'],
    suprascribeWins: [
      {
        label: 'Cross-platform',
        detail: 'Web, any OS, any device - not locked to Apple ecosystem',
      },
      {
        label: 'Automatic discovery',
        detail: 'No manual entry required; email scan does the work',
      },
      {
        label: 'Unlimited free tier',
        detail: 'Bobby caps free use at 5 subscriptions; Suprascribe has no cap',
      },
      {
        label: 'Open source',
        detail: 'Fully auditable code - know exactly what runs on your data',
      },
    ],
    verdict:
      'Bobby is excellent on iPhone but useless everywhere else. Suprascribe works wherever you have a browser.',
  },
  {
    slug: 'rocket-money',
    name: 'Rocket Money',
    tagline: 'Personal finance app with subscription detection via bank linking',
    isSubscription: true,
    pricing: 'Monthly subscription (premium tier); limited free tier',
    strengths: [
      'Detects subscriptions automatically from bank feeds',
      'Cancellation concierge service',
      'Broad budgeting features',
    ],
    suprascribeWins: [
      {
        label: 'No bank linking',
        detail: 'We scan emails, not your bank account - zero financial data exposure',
      },
      {
        label: 'Privacy-first',
        detail: 'Rocket Money requires Plaid access to your full transaction history; we do not',
      },
      {
        label: 'One-time purchase',
        detail: 'Rocket Money charges monthly - Suprascribe Pro is a single payment',
      },
      {
        label: 'Subscription-focused',
        detail: 'Suprascribe is purpose-built for subscriptions, not a bloated finance suite',
      },
    ],
    verdict:
      'Rocket Money asks for your bank password to find subscriptions. Suprascribe uses your email instead - less access, same result.',
  },
  {
    slug: 'ynab',
    name: 'YNAB',
    tagline: 'Full-featured budgeting tool, overkill for subscription tracking',
    isSubscription: true,
    pricing:
      'Monthly ($14.99/mo) or annual ($109/yr) subscription, no lifetime option; 34-day free trial',
    strengths: [
      'Comprehensive budgeting methodology',
      'Strong community and educational resources',
      'Detailed financial reporting',
    ],
    suprascribeWins: [
      {
        label: 'Purpose-built',
        detail: 'Suprascribe is laser-focused on subscriptions - no budgeting philosophy to learn',
      },
      {
        label: 'One-time purchase',
        detail: 'YNAB charges annually, every year - Suprascribe Pro is a single payment',
      },
      {
        label: 'No bank linking required',
        detail: 'YNAB requires full account access; Suprascribe only needs email read permissions',
      },
      { label: 'Zero learning curve', detail: 'Set up in minutes, not hours' },
    ],
    verdict:
      "YNAB is a powerful budgeting tool - but if you just want to track subscriptions, you're paying annually for features you'll never touch.",
  },
  {
    slug: 'subby',
    name: 'Subby',
    tagline: 'Lightweight mobile-only tracker, manual entry only',
    isSubscription: false,
    pricing: 'Free (ad-supported, unlimited subscriptions); $2.99 one-time purchase removes ads',
    strengths: [
      'Simple, uncluttered interface',
      'Unlimited free tier (ad-supported)',
      'Good for users who want full manual control',
    ],
    suprascribeWins: [
      {
        label: 'Email auto-discovery',
        detail:
          'Subby requires you to enter every subscription manually; Suprascribe finds them for you',
      },
      { label: 'Web-first', detail: 'No app install needed - works in any browser on any device' },
      {
        label: 'No ads',
        detail: "Suprascribe's free tier is ad-free; Subby's free version is ad-supported",
      },
      { label: 'Open source', detail: 'Inspect the code and trust what you see' },
    ],
    verdict:
      'Subby is honest and cheap, but fully manual. Suprascribe automates the tedious part - finding the subscriptions in the first place.',
  },
  {
    slug: 'tilla',
    name: 'Tilla',
    tagline: 'Android-only, privacy-first tracker with a 5-subscription free cap',
    isSubscription: false,
    pricing: 'One-time purchase (Android only); free tier capped at 5 subscriptions',
    strengths: [
      'Privacy-first - no bank linking, no external data',
      'One-time purchase',
      'Clean Android UI',
    ],
    suprascribeWins: [
      {
        label: 'Cross-platform',
        detail: 'Tilla is Android-only; Suprascribe works on any device with a browser',
      },
      {
        label: 'Unlimited free tier',
        detail: 'Tilla caps free use at 5 subscriptions; Suprascribe has no cap',
      },
      {
        label: 'Email auto-discovery',
        detail:
          'Tilla is fully manual - Suprascribe finds subscriptions automatically via email scan',
      },
    ],
    verdict:
      'Tilla and Suprascribe share the same privacy values, but Suprascribe adds automatic discovery and a truly unlimited free tier.',
  },
  {
    slug: 'subx',
    name: 'SubX',
    tagline: 'Android tracker with "Magic Finder" bank-statement scanning',
    isSubscription: false,
    pricing:
      'Free tier limited to 4 subscriptions; one-time Pro purchase for unlimited (Android; iOS "coming soon")',
    strengths: [
      '1000+ app templates for quick manual entry',
      '"Magic Finder" can parse uploaded bank statements',
      'One-time purchase',
    ],
    suprascribeWins: [
      {
        label: 'Web-first',
        detail: 'SubX is Android-only in practice - Suprascribe works everywhere',
      },
      {
        label: 'No bank data required',
        detail:
          "SubX's Magic Finder requires uploading bank statements; Suprascribe only reads emails",
      },
      {
        label: 'Fully automatic discovery',
        detail:
          'Email scan runs in the background - no manual uploads or template selection needed',
      },
      {
        label: 'Open source',
        detail: "SubX is closed source; Suprascribe's code is fully auditable on GitHub",
      },
    ],
    verdict:
      'SubX and Suprascribe are similarly priced, but Suprascribe runs in any browser and discovers subscriptions from email without requiring bank data.',
  },
  {
    slug: 'pocketguard',
    name: 'PocketGuard',
    tagline: 'Budgeting app with automatic subscription detection via bank linking',
    isSubscription: true,
    pricing: '$12.99/month or $74.99/year subscription; $149.99 lifetime option available',
    strengths: [
      'Available on iOS, Android, and web',
      'Auto-detects subscriptions from connected bank accounts',
      'Budgeting and spending insights built-in',
    ],
    suprascribeWins: [
      {
        label: 'No bank linking',
        detail:
          'PocketGuard requires Plaid or Finicity access to your accounts; Suprascribe only needs email',
      },
      {
        label: 'One-time purchase',
        detail: 'PocketGuard charges monthly or annually - Suprascribe Pro is a single payment',
      },
      {
        label: 'Subscription-focused',
        detail: 'PocketGuard is a budgeting tool first; subscription tracking is a side feature',
      },
      { label: 'Open source', detail: 'Full transparency on how your data is handled' },
    ],
    verdict:
      'PocketGuard is the most feature-rich competitor but demands full bank account access. Suprascribe focuses on what matters - finding subscriptions - without the privacy trade-off.',
  },
]
