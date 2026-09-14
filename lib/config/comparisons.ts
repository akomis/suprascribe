export interface CompetitorAdvantage {
  label: string
  detail?: string
}

export interface Competitor {
  slug: string
  name: string
  tagline: string
  isSubscription: boolean
  /** Some competitors sell both a recurring plan and a lifetime tier, so this is not !isSubscription. */
  hasOneTimeOption: boolean
  hasUnlimitedFree: boolean
  requiresBankLinking: boolean
  isOpenSource: boolean
  hasAutoDiscovery: boolean
  /** Where automatic discovery pulls from - only 'email' competes with our scanner. */
  discoverySource?: 'email' | 'bank'
  isWebBased: boolean
  pricing: string
  /** Date the public claims below were last checked against the vendor's own pages (YYYY-MM-DD). */
  lastVerified: string
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
    tagline: 'Mobile subscription tracker with Gmail import behind a paid plan',
    isSubscription: true,
    hasOneTimeOption: true,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: true,
    discoverySource: 'email',
    isWebBased: false,
    pricing:
      'Free tier with a capped number of subscriptions; Premium is billed weekly, monthly ($3.99-$7.99/month) or yearly ($17.99/year), with a lifetime unlock around $39.99-$49.99',
    lastVerified: '2026-09-12',
    strengths: [
      'Clean mobile UI on both iOS and Android',
      'Gmail import and AI extraction from billing emails and screenshots',
      'Reminders for upcoming renewals',
      'No bank access required',
    ],
    suprascribeWins: [
      {
        label: 'Web-first',
        detail: 'Works in any browser - ReSubs ships as an iOS and Android app only',
      },
      {
        label: 'One-time purchase',
        detail:
          'Suprascribe PRO is a single payment; ReSubs leads with weekly, monthly and yearly plans and prices its lifetime unlock at $39.99-$49.99',
      },
      {
        label: 'Unlimited free tier',
        detail: 'ReSubs reserves unlimited subscriptions for Premium; Suprascribe never caps it',
      },
      {
        label: 'Open source',
        detail: "ReSubs is closed source; Suprascribe's code is fully auditable on GitHub",
      },
    ],
    verdict:
      'ReSubs also reads your inbox, but it puts Gmail import behind a recurring plan and never leaves the phone. Suprascribe runs in any browser and charges once.',
    metaDescription:
      'Suprascribe vs ReSubs: both find subscriptions in Gmail, but ReSubs is mobile-only with a capped free tier and weekly, monthly or yearly Premium plans. Suprascribe is web-based, open source, and unlimited on the free tier.',
    intro:
      'ReSubs is a mobile-first subscription tracker for iOS and Android with a clean UI, renewal reminders, and Gmail import that pulls subscriptions out of billing emails. Both of its trade-offs are structural: the import and unlimited tracking sit behind Premium, which it sells weekly, monthly and yearly alongside a lifetime unlock, and there is no web version at all. Suprascribe covers the same ground in any browser, keeps the free tier uncapped, and sells PRO as a single payment.',
  },
  {
    slug: 'bobby',
    name: 'Bobby',
    tagline: 'Apple-only manual subscription tracker',
    isSubscription: false,
    hasOneTimeOption: true,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    isWebBased: false,
    pricing:
      'Free with a capped number of subscriptions; the All-in-one Pack is a $2.99 one-time in-app purchase, with individual unlocks (subscription limit, categories) at $0.99 each',
    lastVerified: '2026-09-12',
    strengths: [
      'Polished design across iPhone, iPad, Mac and Vision',
      'Apple Watch support',
      'Nice charts and spend overview',
    ],
    suprascribeWins: [
      {
        label: 'Cross-platform',
        detail: 'Web, any OS, any device - Bobby only runs inside the Apple ecosystem',
      },
      {
        label: 'Automatic discovery',
        detail: 'No manual entry required; email scan does the work',
      },
      {
        label: 'Unlimited free tier',
        detail: 'Bobby caps the free tier and charges to lift the limit; Suprascribe has no cap',
      },
      {
        label: 'Open source',
        detail: 'Fully auditable code - know exactly what runs on your data',
      },
    ],
    verdict:
      'Bobby is excellent on Apple hardware and unavailable everywhere else. Suprascribe works wherever you have a browser.',
    metaDescription:
      'Suprascribe vs Bobby: Bobby is a polished Apple-only tracker with a capped free tier and a $2.99 one-time unlock. Suprascribe works in any browser, has unlimited free tracking, and auto-discovers subscriptions from your inbox.',
    intro:
      'Bobby is a well-designed subscription tracker for iPhone, iPad, Mac and Vision, with Apple Watch support and one-time in-app unlocks rather than a recurring fee. Its core limitation is platform lock-in: it only runs on Apple devices. If you use Android, Windows, or want a web-based option, Bobby is not an option. Suprascribe is web-first - it works in any browser on any device - and automatically finds subscriptions by scanning your email rather than requiring manual entry.',
  },
  {
    slug: 'rocket-money',
    name: 'Rocket Money',
    tagline: 'Personal finance app with subscription detection via bank linking',
    isSubscription: true,
    hasOneTimeOption: false,
    hasUnlimitedFree: true,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: true,
    discoverySource: 'bank',
    isWebBased: true,
    pricing:
      'Free tier detects and tracks subscriptions (capped at 2 custom budget categories); Premium is pay-what-you-want at $7-$14/month and Premium+ is $15/month, both with a 7-day trial',
    lastVerified: '2026-09-12',
    strengths: [
      'Detects subscriptions automatically from bank feeds',
      'Subscription detection is included on the free tier',
      'Cancellation concierge service (Premium)',
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
        detail: 'Rocket Money charges monthly - Suprascribe PRO is a single payment',
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
    hasOneTimeOption: false,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    isWebBased: true,
    pricing:
      'Monthly ($14.99/mo) or annual ($109/yr) subscription, no lifetime option; 34-day free trial, then no free tier',
    lastVerified: '2026-09-12',
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
        detail: 'YNAB charges annually, every year - Suprascribe PRO is a single payment',
      },
      {
        label: 'Nothing to reconcile',
        detail:
          'YNAB works from transactions - linked via Direct Import, imported as files, or typed in by hand; Suprascribe reads billing emails with read-only access and needs no account ledger at all',
      },
      { label: 'Zero learning curve', detail: 'Set up in minutes, not hours' },
    ],
    verdict:
      "YNAB is a powerful budgeting tool - but if you just want to track subscriptions, you're paying annually for features you'll never touch.",
    metaDescription:
      'Suprascribe vs YNAB: YNAB charges $109/year, asks you to learn a budgeting methodology, and never identifies subscriptions for you. Suprascribe is purpose-built for subscription tracking - free to start, no bank linking, no learning curve.',
    intro:
      'YNAB is a comprehensive budgeting tool built around a specific financial methodology. It is excellent for users who want to manage every dollar - but if your goal is simply tracking and managing subscriptions, YNAB is significant overkill. You pay $109 per year, go through an onboarding process, and use a fraction of its features. YNAB does not detect subscriptions for you either: it shows the transactions you link, import, or enter, and spotting the recurring ones is your job. Suprascribe focuses exclusively on subscriptions: find them, track them, and cancel what you no longer need.',
    openAlternativeUrl: 'https://openalternative.co/alternatives/ynab',
  },
  {
    slug: 'subby',
    name: 'Subby',
    tagline: 'Lightweight mobile-only tracker, manual entry only',
    isSubscription: false,
    hasOneTimeOption: true,
    hasUnlimitedFree: true,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    isWebBased: false,
    pricing:
      'Free on iOS and Android (ad-supported, unlimited subscriptions); $2.99 one-time PRO purchase removes ads and adds backup, widgets and AI import',
    lastVerified: '2026-09-12',
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
    hasOneTimeOption: true,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    isWebBased: false,
    pricing:
      'Free tier capped at 5 subscriptions, no ads; $2.99 one-time lifetime premium unlocks unlimited subscriptions, analytics, cloud sync and backups (Android only)',
    lastVerified: '2026-09-12',
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
    hasOneTimeOption: true,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    isWebBased: false,
    pricing:
      'Free tier covers day-to-day tracking; one-time PRO purchase adds multi-device sync, detailed reports and an ad-free app (Android; iOS "coming soon")',
    lastVerified: '2026-09-12',
    strengths: [
      '1000+ app templates for quick manual entry',
      '"Magic Finder" parses bank statements, documents and screenshots you upload',
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
    hasOneTimeOption: true,
    hasUnlimitedFree: false,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: true,
    discoverySource: 'bank',
    isWebBased: true,
    pricing:
      'PocketGuard Plus is $12.99/month, $74.99/year, or $149.99 once for lifetime access. The free plan was retired in 2026 - new users get a 7-day trial and then pay',
    lastVerified: '2026-09-12',
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
        label: 'One-time purchase that is not $149.99',
        detail:
          'PocketGuard bills $12.99/month or $74.99/year unless you buy its $149.99 lifetime tier; Suprascribe PRO is a single, far smaller payment',
      },
      {
        label: 'Subscription-focused',
        detail: 'PocketGuard is a budgeting tool first; subscription tracking is a side feature',
      },
      { label: 'Open source', detail: 'Full transparency on how your data is handled' },
    ],
    verdict:
      'PocketGuard is the most feature-rich competitor but demands full bank account access and, since 2026, payment from day eight. Suprascribe focuses on what matters - finding subscriptions - without the privacy trade-off.',
    metaDescription:
      'Suprascribe vs PocketGuard: PocketGuard charges $12.99/month, $74.99/year or $149.99 for lifetime access, dropped its free plan in 2026, and requires full bank access via Plaid. Suprascribe finds subscriptions through email scanning - no bank linking, free to start, one-time PRO upgrade.',
    intro:
      'PocketGuard is a full-featured budgeting app available on iOS, Android, and web. It automatically detects subscriptions by connecting to your bank accounts through Plaid or Finicity. This gives it broad financial visibility, but at a cost: you hand over access to all your transactions, and since the free plan was retired in 2026 you are on a 7-day trial and then paying - $12.99 a month, $74.99 a year, or $149.99 up front for lifetime access. Suprascribe is subscription-focused by design, uses email scanning instead of bank linking, keeps a free tier with no cap, and charges nothing recurring.',
  },
  {
    slug: 'unsubby',
    name: 'Unsubby',
    tagline: 'Bank-linked subscription manager and cancellation letter service',
    isSubscription: true,
    hasOneTimeOption: false,
    hasUnlimitedFree: false,
    requiresBankLinking: true,
    isOpenSource: false,
    hasAutoDiscovery: true,
    discoverySource: 'bank',
    isWebBased: true,
    pricing:
      'My Unsubby premium is $27.99 per 4 weeks and covers up to 5 cancellations per period, after a 7-day free trial; one-off cancellation letters are sold separately (~$14.95)',
    lastVerified: '2026-09-12',
    strengths: [
      'Sends cancellation letters on your behalf (1,500+ supported services)',
      'Auto-detects subscriptions via Plaid bank connection',
      'Budget planner with spending insights and visual trends',
      'Billing notifications before renewals',
      '27,000+ Trustpilot reviews at a 4.2 TrustScore',
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
          'Unsubby charges $27.99 every 4 weeks to manage your subscriptions - and caps that at 5 cancellations per period; Suprascribe PRO is a one-time upgrade with no recurring fees',
      },
      {
        label: 'Open source',
        detail:
          'Unsubby is closed source - you cannot verify what it does with your bank data; Suprascribe is fully auditable on GitHub',
      },
      {
        label: 'Unlimited free tier',
        detail:
          'Unsubby gates its subscription management behind a trial and then a paid plan; Suprascribe free tier has no cap and no clock',
      },
    ],
    verdict:
      'Unsubby adds a useful cancellation-letter service on top of subscription tracking, but it requires Plaid bank access and bills every 4 weeks. Suprascribe finds the same subscriptions through email scanning - no bank login, no recurring cost.',
    metaDescription:
      'Suprascribe vs Unsubby: Unsubby auto-detects subscriptions via Plaid and sends cancellation letters, but requires bank access and charges $27.99 per 4 weeks. Suprascribe discovers subscriptions from Gmail, Outlook, or iCloud with no bank linking and a one-time PRO upgrade.',
    intro:
      'Unsubby is a web-based subscription manager that connects to your bank account via Plaid to detect recurring payments and can send cancellation letters to services on your behalf. It has built meaningful scale - over 27,000 Trustpilot reviews at a 4.2 score - and the cancellation letter feature is genuinely useful. The tradeoffs are significant though: Plaid access means handing over your bank login credentials to a third party, and My Unsubby premium runs $27.99 per 4 weeks for up to 5 cancellations in that window - a recurring fee to manage other recurring fees. Suprascribe takes the opposite approach: subscriptions are found by scanning your email inbox (read-only OAuth, no passwords), the free tier is unlimited, and the PRO upgrade is a one-time purchase.',
  },
  {
    slug: 'subchecks',
    name: 'SubChecks',
    tagline: 'Web-based subscription tracker with manual entry and renewal reminders',
    isSubscription: false,
    hasOneTimeOption: true,
    hasUnlimitedFree: false,
    requiresBankLinking: false,
    isOpenSource: false,
    hasAutoDiscovery: false,
    isWebBased: true,
    pricing:
      'Free plan capped at 5 subscriptions; Forever Access is a $29 one-time purchase for unlimited subscriptions, reminders and analytics',
    lastVerified: '2026-09-12',
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
