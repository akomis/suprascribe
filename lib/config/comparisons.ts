export interface CompetitorAdvantage {
  label: string
  detail?: string
}

export interface Competitor {
  slug: string
  name: string
  tagline: string
  isSubscription: boolean
  hasUnlimitedFree: boolean
  requiresBankLinking: boolean
  isOpenSource: boolean
  hasAutoDiscovery: boolean
  pricing: string
  strengths: string[]
  suprascribeWins: CompetitorAdvantage[]
  verdict: string
  metaDescription: string
  intro: string
  openAlternativeUrl?: string
}

export const competitors: Competitor[] = [
  {
    slug: 'resubs',
    name: 'ReSubs',
    tagline: 'Mobile subscription tracker with a recurring fee',
    isSubscription: true,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
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
    metaDescription:
      'Suprascribe vs ReSubs: Suprascribe offers unlimited free tracking and email auto-discovery with no recurring fee. ReSubs charges $10/month and caps free use at 5 subscriptions.',
    intro:
      'ReSubs is a mobile-first subscription tracker with a clean UI and renewal reminders. The catch: its free tier caps you at 5 subscriptions, and unlimited tracking requires a $10/month plan - meaning you pay a subscription to track your subscriptions. Suprascribe flips that model: unlimited tracking is free, and the only paid option is a one-time upgrade.',
  },
  {
    slug: 'bobby',
    name: 'Bobby',
    tagline: 'iOS-only manual subscription tracker',
    isSubscription: false,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
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
    metaDescription:
      'Suprascribe vs Bobby: Bobby is a polished iOS-only tracker capped at 5 free subscriptions. Suprascribe works in any browser, has unlimited free tracking, and auto-discovers subscriptions from your inbox.',
    intro:
      'Bobby is a well-designed iOS subscription tracker with Apple Watch support and a one-time unlock. Its core limitation is platform lock-in: it only works on Apple devices. If you use Android, Windows, or want a web-based option, Bobby is not an option. Suprascribe is web-first - it works in any browser on any device - and automatically finds subscriptions by scanning your email rather than requiring manual entry.',
  },
  {
    slug: 'rocket-money',
    name: 'Rocket Money',
    tagline: 'Personal finance app with subscription detection via bank linking',
    isSubscription: true,
    hasUnlimitedFree: false,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: true,
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
    metaDescription:
      'Suprascribe vs Rocket Money: Both auto-detect subscriptions, but Rocket Money requires full bank account access via Plaid. Suprascribe uses email scanning - no bank linking, no monthly fee, same result.',
    intro:
      'Rocket Money is a personal finance app that detects subscriptions by connecting to your bank account through Plaid. It works, but it requires handing over access to your full transaction history - a significant privacy trade-off. Suprascribe achieves the same automatic discovery by scanning your email inbox instead. No bank credentials, no Plaid, and no monthly subscription fee on top.',
  },
  {
    slug: 'ynab',
    name: 'YNAB',
    tagline: 'Full-featured budgeting tool, overkill for subscription tracking',
    isSubscription: true,
    hasUnlimitedFree: false,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: false,
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
    metaDescription:
      'Suprascribe vs YNAB: YNAB charges $109/year and requires a budgeting methodology to use. Suprascribe is purpose-built for subscription tracking - free to start, no bank linking, no learning curve.',
    intro:
      'YNAB is a comprehensive budgeting tool built around a specific financial methodology. It is excellent for users who want to manage every dollar - but if your goal is simply tracking and managing subscriptions, YNAB is significant overkill. You pay $109 per year, go through an onboarding process, and use a fraction of its features. Suprascribe focuses exclusively on subscriptions: find them, track them, and cancel what you no longer need.',
    openAlternativeUrl: 'https://openalternative.co/alternatives/ynab',
  },
  {
    slug: 'subby',
    name: 'Subby',
    tagline: 'Lightweight mobile-only tracker, manual entry only',
    isSubscription: false,
    hasUnlimitedFree: true,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
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
    metaDescription:
      'Suprascribe vs Subby: Both offer unlimited free tiers, but Subby is mobile-only and requires manual entry. Suprascribe works in any browser and auto-discovers subscriptions from Gmail, Outlook, or iCloud.',
    intro:
      'Subby is a lightweight, ad-supported subscription tracker with a genuinely unlimited free tier. It is honest and straightforward. The downside is that it is entirely manual - you enter every subscription yourself - and it only works as a mobile app. Suprascribe covers the same use case with two key advantages: it automatically finds subscriptions by scanning your email, and it runs in any browser without an app install.',
  },
  {
    slug: 'tilla',
    name: 'Tilla',
    tagline: 'Android-only, privacy-first tracker with a 5-subscription free cap',
    isSubscription: false,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
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
    metaDescription:
      'Suprascribe vs Tilla: Both are privacy-first and require no bank linking. Tilla is Android-only with a 5-subscription cap. Suprascribe works in any browser, has an unlimited free tier, and auto-discovers subscriptions via email.',
    intro:
      "Tilla shares Suprascribe's core philosophy: no bank linking, no financial data exposure, privacy by design. Where they differ is scope and platform. Tilla is Android-only and caps its free tier at 5 subscriptions. Suprascribe runs in any browser on any device and places no cap on the free tier. Suprascribe also adds automatic email discovery - Tilla requires every subscription to be entered manually.",
  },
  {
    slug: 'subx',
    name: 'SubX',
    tagline: 'Android tracker with "Magic Finder" bank-statement scanning',
    isSubscription: false,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
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
    metaDescription:
      'Suprascribe vs SubX: SubX is Android-only and requires uploading bank statements for auto-detection. Suprascribe is web-based, open source, and discovers subscriptions by scanning your email - no bank data needed.',
    intro:
      'SubX is an Android subscription tracker with a "Magic Finder" feature that parses uploaded bank statements to detect subscriptions. The approach works but requires sharing financial documents. Suprascribe takes a different angle: it scans your email inbox for subscription signals - receipts, renewal notices, billing confirmations - without any bank data. SubX is also closed source and Android-only in practice, while Suprascribe runs in any browser and publishes its full source code on GitHub.',
  },
  {
    slug: 'pocketguard',
    name: 'PocketGuard',
    tagline: 'Budgeting app with automatic subscription detection via bank linking',
    isSubscription: true,
    hasUnlimitedFree: false,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: true,
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
    metaDescription:
      'Suprascribe vs PocketGuard: PocketGuard charges up to $150/year and requires full bank access via Plaid. Suprascribe finds subscriptions through email scanning - no bank linking, free to start, one-time Pro upgrade.',
    intro:
      'PocketGuard is a full-featured budgeting app available on iOS, Android, and web. It automatically detects subscriptions by connecting to your bank accounts through Plaid or Finicity. This gives it broad financial visibility, but at a cost: you hand over access to all your transactions, and you pay a recurring subscription fee for the privilege. Suprascribe is subscription-focused by design, uses email scanning instead of bank linking, and charges nothing recurring.',
  },
  {
    slug: 'unsubby',
    name: 'Unsubby',
    tagline: 'Bank-linked subscription manager and cancellation letter service',
    isSubscription: true,
    hasUnlimitedFree: false,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: true,
    pricing:
      'Free tier capped at 4 subscriptions; Premium is $9.95 per 4 weeks (~$12.95/month), 7-day free trial',
    strengths: [
      'Sends cancellation letters on your behalf (1,500+ supported services)',
      'Auto-detects subscriptions via Plaid bank connection',
      'Budget planner with spending insights and visual trends',
      'Billing notifications before renewals',
      '50,000+ users, 22,000+ Trustpilot reviews',
    ],
    suprascribeWins: [
      {
        label: 'No bank access required',
        detail:
          'Unsubby requires connecting your bank account via Plaid; Suprascribe discovers subscriptions from your email inbox with no financial account access at any tier',
      },
      {
        label: 'One-time payment, not a recurring fee',
        detail:
          'Unsubby charges ~$12.95/month to manage your subscriptions; Suprascribe Pro is a one-time upgrade with no recurring fees',
      },
      {
        label: 'Open source',
        detail:
          'Unsubby is closed source — you cannot verify what it does with your bank data; Suprascribe is fully auditable on GitHub',
      },
      {
        label: 'Unlimited free tier',
        detail: 'Unsubby free plan is capped at 4 subscriptions; Suprascribe free tier has no cap',
      },
    ],
    verdict:
      'Unsubby adds a useful cancellation-letter service on top of subscription tracking, but it requires Plaid bank access and charges a recurring monthly fee. Suprascribe finds the same subscriptions through email scanning — no bank login, no monthly cost.',
    metaDescription:
      'Suprascribe vs Unsubby: Unsubby auto-detects subscriptions via Plaid and sends cancellation letters, but requires bank access and charges ~$12.95/month. Suprascribe discovers subscriptions from Gmail, Outlook, or iCloud with no bank linking and a one-time Pro upgrade.',
    intro:
      'Unsubby is a web-based subscription manager that connects to your bank account via Plaid to detect recurring payments and can send cancellation letters to services on your behalf. It has built meaningful scale — 50,000+ users and 22,000+ Trustpilot reviews — and the cancellation letter feature is genuinely useful. The tradeoffs are significant though: Plaid access means handing over your bank login credentials to a third party, the free tier is capped at 4 subscriptions, and the Premium plan runs ~$12.95/month — a recurring fee to manage other recurring fees. Suprascribe takes the opposite approach: subscriptions are found by scanning your email inbox (read-only OAuth, no passwords), the free tier is unlimited, and the Pro upgrade is a one-time purchase.',
  },
  {
    slug: 'subchecks',
    name: 'SubChecks',
    tagline: 'Web-based subscription tracker with manual entry and renewal reminders',
    isSubscription: false,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    pricing:
      'Free tier capped at 5 subscriptions; $20 one-time purchase (50% off original $40) for unlimited',
    strengths: [
      'Clean web-based dashboard',
      'Email renewal reminders before charges occur',
      'Calendar view and spending trends',
      'No bank linking required',
      'Data export',
    ],
    suprascribeWins: [
      {
        label: 'Email auto-discovery',
        detail:
          'SubChecks requires manual entry for every subscription; Suprascribe finds them automatically by scanning your inbox',
      },
      {
        label: 'Unlimited free tier',
        detail: 'SubChecks caps free use at 5 subscriptions; Suprascribe has no cap',
      },
      {
        label: 'Open source',
        detail: 'SubChecks is closed source; Suprascribe is fully auditable on GitHub',
      },
    ],
    verdict:
      'SubChecks and Suprascribe are both web-based and avoid bank linking - but SubChecks is fully manual and caps the free tier at 5. Suprascribe finds your subscriptions for you.',
    metaDescription:
      'Suprascribe vs SubChecks: Both are web-based and require no bank access. SubChecks caps free use at 5 subscriptions and requires manual entry. Suprascribe auto-discovers subscriptions from Gmail, Outlook, or iCloud with an unlimited free tier.',
    intro:
      'SubChecks is a web-based subscription tracker focused on manual entry and renewal reminders. It shares two of the same values as Suprascribe - no bank linking and a clean web interface - but stops there. The free tier is capped at 5 subscriptions, and every subscription must be entered by hand. Suprascribe removes both friction points: the free tier is unlimited, and connecting your email inbox lets the scanner find subscriptions automatically without any manual input.',
  },
]
