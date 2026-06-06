export type BlogSectionType = 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'callout'

export interface BlogSection {
  type: BlogSectionType
  text?: string
  items?: string[]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  readingTimeMin: number
  intro: string
  sections: BlogSection[]
  faqQuestions: string[]
  relatedSlugs: string[]
  relatedPageLinks: { href: string; label: string }[]
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'how-to-cancel-subscriptions',
    title: 'How to Cancel Subscriptions You Forgot You Had',
    description:
      'A step-by-step guide to finding and cancelling forgotten subscriptions - before the next charge hits your account.',
    publishedAt: '2026-05-16',
    updatedAt: '2026-05-27',
    readingTimeMin: 5,
    intro:
      'Forgotten subscriptions can drain hundreds of euros a year. Here is how to find every active subscription and cancel the ones you no longer want.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do I find all my subscriptions?',
    ],
    relatedSlugs: [
      'how-to-find-all-your-subscriptions',
      'subscription-fatigue',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Start Tracking for Free' }],
    sections: [
      {
        type: 'callout',
        text: 'Quick answer: To cancel a forgotten subscription, search your inbox for "receipt", "invoice", and "billing" to identify what you are paying for. Then check Apple Subscriptions, Google Play, and PayPal automatic payments. For each subscription to cancel, go to its account settings - EU consumer protection law requires cancellation to be as easy as sign-up.',
      },
      {
        type: 'p',
        text: 'The average person is paying for three to five subscriptions they have completely forgotten about. Streaming services from a free trial, a fitness app from January, an old news site - they keep charging until you notice. This guide walks you through finding every active subscription and cancelling the ones you no longer want.',
      },
      {
        type: 'h2',
        text: 'Step 1: Search Your Email Inbox',
      },
      {
        type: 'p',
        text: 'Most subscriptions send a receipt or renewal notice every billing cycle. Open your inbox and search for terms like "receipt", "invoice", "billing", "renewal", "subscription", and "charged". Check your spam folder too - some billing emails land there.',
      },
      {
        type: 'p',
        text: 'This manual method works, but it takes time. A faster alternative is to use a tool like Suprascribe, which connects to your Gmail, Outlook, or iCloud and automatically surfaces every subscription-related email in minutes - without storing any email content.',
      },
      {
        type: 'h2',
        text: 'Step 2: Review Your Bank and Card Statements',
      },
      {
        type: 'p',
        text: 'Go back at least three months on your bank and credit card statements. Look for small recurring charges - €2.99, €9.99, €14.99 are common subscription prices. Note the merchant name for anything you do not recognise.',
      },
      {
        type: 'callout',
        text: 'Tip: Sort your bank statement by merchant name rather than date. Recurring charges will appear grouped together and are easy to spot.',
      },
      {
        type: 'h2',
        text: 'Step 3: Check App Stores and PayPal',
      },
      {
        type: 'p',
        text: 'Many subscriptions are billed through the Apple App Store, Google Play, or PayPal rather than directly to your card. Check each platform separately:',
      },
      {
        type: 'ul',
        items: [
          'Apple: Settings → Apple ID → Subscriptions',
          'Google Play: Play Store → Profile → Payments & subscriptions → Subscriptions',
          'PayPal: Settings → Payments → Manage automatic payments',
        ],
      },
      {
        type: 'h2',
        text: 'Step 4: Cancel What You No Longer Need',
      },
      {
        type: 'p',
        text: 'Once you have a full list, go service by service. Most subscriptions can be cancelled from the account settings of the respective service. If you struggle to find the cancellation page, search for "[service name] cancel subscription" - consumer protection rules in the EU require services to make cancellation as easy as signing up.',
      },
      {
        type: 'ul',
        items: [
          'Cancel before the next billing date, not after - you typically will not get a refund for a charge that already happened',
          'Download any content you want to keep before cancelling',
          'Check for a pause option if you might want to come back',
          'Screenshot the cancellation confirmation in case of a dispute',
        ],
      },
      {
        type: 'h2',
        text: 'Step 5: Keep Track Going Forward',
      },
      {
        type: 'p',
        text: 'Subscriptions accumulate slowly. The best way to stay in control is to keep a live list - every service, its cost, and its renewal date. Suprascribe provides a free dashboard for exactly this: add subscriptions manually or let the email scanner keep it updated automatically.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free to use for manual subscription management. No bank access required. The email auto-discovery that finds forgotten subscriptions is a one-time Pro upgrade.',
      },
    ],
  },
  {
    slug: 'how-to-find-all-your-subscriptions',
    title: 'How to Find All Your Subscriptions in One Place',
    description:
      'Four methods to uncover every active subscription - from manual email searches to automatic inbox scanning - so nothing slips through.',
    publishedAt: '2026-04-28',
    updatedAt: '2026-05-27',
    readingTimeMin: 4,
    intro:
      'Most people underestimate how many subscriptions they have. Here are the most reliable ways to build a complete list.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'Can Suprascribe detect subscriptions from Gmail?',
      'Can I use Suprascribe without connecting my email?',
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'subscription-fatigue',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Start Tracking for Free' }],
    sections: [
      {
        type: 'callout',
        text: 'Quick answer: To find all your subscriptions, search your email for "receipt", "invoice", "renewal", and "your subscription". Also check Apple Subscriptions (Settings → Apple ID → Subscriptions), Google Play (Profile → Payments & subscriptions), PayPal automatic payments, and Amazon Memberships. The fastest method is connecting Gmail or Outlook to a subscription tracker like Suprascribe, which scans your inbox automatically in minutes.',
      },
      {
        type: 'p',
        text: 'Research consistently shows people underestimate their subscription count by 40–60%. The gap between what you think you are paying and what actually leaves your account each month is rarely zero. Here are the most reliable methods to build a complete picture.',
      },
      {
        type: 'h2',
        text: 'Method 1: Manual Email Search',
      },
      {
        type: 'p',
        text: 'Your inbox is the most complete record of your subscriptions. Search for keywords like "receipt", "invoice", "your subscription", "renewal", "billing", and "thank you for subscribing". Include your spam and promotions folders.',
      },
      {
        type: 'p',
        text: 'The downside is time: this can take an hour or more if your inbox is old or large. But it requires no tools and works for every provider.',
      },
      {
        type: 'h2',
        text: 'Method 2: Automatic Email Scanning',
      },
      {
        type: 'p',
        text: 'Suprascribe connects to Gmail, Outlook, or iCloud via OAuth (no password shared) and scans for subscription-related emails automatically. It takes a few minutes to run and surfaces services you may have genuinely forgotten.',
      },
      {
        type: 'p',
        text: 'Only emails matching subscription patterns are ever read. No email content is stored - the scanner extracts the subscription data and discards the rest. If you prefer not to connect email, you can skip this step and add subscriptions manually instead.',
      },
      {
        type: 'h2',
        text: 'Method 3: Bank and Card Statement Review',
      },
      {
        type: 'p',
        text: 'Download three to six months of statements and look for recurring charges. Subscription prices tend to cluster at round numbers - €4.99, €9.99, €14.99 per month. Anything you do not immediately recognise is worth investigating.',
      },
      {
        type: 'callout',
        text: 'Some subscriptions change their billing entity name. If you see an unfamiliar company charging a suspiciously round amount every month, search for that merchant name online.',
      },
      {
        type: 'h2',
        text: 'Method 4: App Store and PayPal Audits',
      },
      {
        type: 'p',
        text: 'A significant portion of subscriptions never appear on a bank statement because they are billed through intermediaries. Check:',
      },
      {
        type: 'ul',
        items: [
          'Apple App Store: Settings → Apple ID → Subscriptions',
          'Google Play: Play Store → Profile → Payments & subscriptions → Subscriptions',
          'PayPal: Settings → Payments → Manage automatic payments',
          'Amazon: Account → Memberships & Subscriptions',
        ],
      },
      {
        type: 'h2',
        text: 'Keeping Your List Up to Date',
      },
      {
        type: 'p',
        text: 'Finding your subscriptions once is not enough - new ones accumulate over time. The best approach is a dedicated tracker that you update whenever you sign up for or cancel a service. Suprascribe keeps a live dashboard with costs, billing cycles, and renewal dates, and can re-scan your inbox periodically to catch anything new.',
      },
    ],
  },
  {
    slug: 'subscription-fatigue',
    title: 'Subscription Fatigue: How to Audit and Take Back Control of Your Monthly Spending',
    description:
      'Subscription fatigue is the slow drain of too many small recurring charges. Here is how to audit your subscriptions and stop paying for things you do not use.',
    publishedAt: '2026-04-14',
    updatedAt: '2026-05-27',
    readingTimeMin: 6,
    intro:
      'A streaming service here, a cloud backup there - individually small, collectively significant. Subscription fatigue is real, and the fix starts with a proper audit.',
    faqQuestions: [
      'Is Suprascribe really free?',
      "What's the difference between Basic and Pro?",
      'How do renewal reminders work?',
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'how-to-find-all-your-subscriptions',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-manager', label: 'Take Control of Subscriptions' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'Quick answer: Subscription fatigue is the financial and mental drain of paying for more recurring services than you actively use. The fix is a subscription audit: list every active charge, calculate your total monthly cost, and cancel anything you have not used in the past 30 days. Most people find at least two or three subscriptions worth cancelling immediately.',
      },
      {
        type: 'p',
        text: 'Subscription fatigue describes the creeping exhaustion of managing - and paying for - more recurring services than you actually use. It is not a single bad decision. It is the result of dozens of individually reasonable-seeming sign-ups that collectively add up to a serious monthly drain.',
      },
      {
        type: 'h2',
        text: 'Why Subscriptions Accumulate',
      },
      {
        type: 'p',
        text: 'The subscription business model is deliberately designed to reduce friction at sign-up and increase it at cancellation. Free trials auto-convert. Annual plans front-load the value. "Pause" options exist to prevent cancellation. Every one of these mechanisms serves the provider, not the subscriber.',
      },
      {
        type: 'p',
        text: 'The result is predictable: most people have more active subscriptions than they can name. Studies suggest the average household spends significantly more than it believes it does on recurring services each month.',
      },
      {
        type: 'h2',
        text: 'The Subscription Audit: Where to Start',
      },
      {
        type: 'p',
        text: 'A subscription audit is a deliberate exercise: list every recurring charge, assign a value to it, and decide which ones to keep. Here is a simple framework:',
      },
      {
        type: 'ol',
        items: [
          'List every subscription you have (use email search, bank statements, or a tool like Suprascribe to make sure the list is complete)',
          'Note the monthly cost in a single currency for easy comparison',
          'For each subscription, ask: "Did I use this in the last 30 days?"',
          'For ones you did not use: "Will I realistically use this in the next 30 days?"',
          'Cancel everything that fails both tests',
        ],
      },
      {
        type: 'callout',
        text: 'Be honest with yourself at step 3. "I might watch it one day" is not the same as "I actively use this." If a subscription sat unused for a month, it will probably sit unused for another month.',
      },
      {
        type: 'h2',
        text: 'Setting a Subscription Budget',
      },
      {
        type: 'p',
        text: 'After your audit, decide on a maximum monthly spend for all subscriptions combined. Treat it like a budget line item. When a new subscription tempts you, ask which existing one you would drop to make room for it.',
      },
      {
        type: 'p',
        text: 'This framing - finite budget rather than infinite accumulation - naturally limits subscription creep. New sign-ups require an active decision to deprioritise something else.',
      },
      {
        type: 'h2',
        text: 'Using Renewal Reminders to Stay in Control',
      },
      {
        type: 'p',
        text: 'Annual subscriptions are particularly effective at slipping through audits. You pay once in January and forget about it until January next year - by which point you have paid again. Setting a renewal reminder 7–14 days before each annual billing date gives you a decision window: renew consciously or cancel before the charge.',
      },
      {
        type: 'p',
        text: 'Suprascribe Pro includes renewal reminders. You receive an email before any subscription renews, so you are never caught off-guard by a charge you forgot was coming.',
      },
      {
        type: 'h2',
        text: 'The Role of a Subscription Manager',
      },
      {
        type: 'p',
        text: 'A good subscription manager does two things: it gives you a single place to see what you are paying, and it surfaces renewals before they happen. Suprascribe provides both - a free dashboard for manual tracking, with Pro adding automatic discovery, a spending calendar, and reminder emails.',
      },
    ],
  },
  {
    slug: 'best-free-subscription-manager',
    title: 'The Best Free Subscription Manager in 2026',
    description:
      'What to look for in a free subscription manager in 2026 - and why the best options do not require a bank connection or a recurring fee.',
    publishedAt: '2026-05-01',
    updatedAt: '2026-05-27',
    readingTimeMin: 5,
    intro:
      'Not all free subscription managers are equal. Some cap features, some require bank access, some charge a monthly fee to manage your monthly fees. Here is how to pick the right one.',
    faqQuestions: [
      'What is the best free app to track subscriptions?',
      'Is Suprascribe really free?',
      'Is Pro really a one-time payment?',
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'subscription-fatigue',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [{ href: '/compare', label: 'Suprascribe vs the Alternatives' }],
    sections: [
      {
        type: 'callout',
        text: 'Quick answer: The best free subscription manager in 2026 should impose no cap on the free tier, require no bank account access, and offer automatic discovery through email scanning. Suprascribe meets all three criteria: unlimited free tracking, email-based discovery via Gmail and Outlook, and a one-time €10 Pro upgrade with no recurring fees.',
      },
      {
        type: 'p',
        text: 'The irony of paying for a subscription manager has not been lost on the people who build them. Several of the most popular tools in this space cost €5–€15 per month - to manage the other things you pay €5–€15 per month for. Here is what actually matters when evaluating a free subscription manager.',
      },
      {
        type: 'h2',
        text: 'What "Free" Actually Means',
      },
      {
        type: 'p',
        text: 'Most apps that advertise a free tier limit it in ways that make it impractical: a cap of 5 or 10 subscriptions, no renewal reminders, no automatic discovery, or a paywall on basic features like sorting and filtering. A genuinely free subscription manager should handle an unlimited number of subscriptions with the core features intact.',
      },
      {
        type: 'callout',
        text: "Suprascribe's Basic tier is free forever with no subscription cap and no credit card required. Manual management, multi-currency support, and full history are all included at no cost.",
      },
      {
        type: 'h2',
        text: 'Key Features to Evaluate',
      },
      {
        type: 'ul',
        items: [
          'Unlimited subscriptions on the free tier - not capped at 5 or 10',
          'No bank account connection required to get started',
          'Automatic discovery option (email scanning, not bank scraping)',
          'Multi-currency support if you pay in more than one currency',
          'Renewal reminders before charges hit',
          'Cross-device access via web app (no download required)',
        ],
      },
      {
        type: 'h2',
        text: 'Bank-Linked vs. Email-Based Discovery',
      },
      {
        type: 'p',
        text: 'Automatic subscription discovery falls into two categories. Bank-linked apps (Rocket Money, PocketGuard) read your full transaction history to identify recurring charges. Email-based apps (Suprascribe) scan your inbox for billing receipts and renewal notices.',
      },
      {
        type: 'p',
        text: 'Email scanning is more targeted: it accesses only what it needs (subscription emails) and never sees your broader financial picture. For most users, the results are equivalent - subscriptions always generate email receipts - and the privacy trade-off strongly favours email scanning.',
      },
      {
        type: 'h2',
        text: 'The Case for a One-Time Upgrade',
      },
      {
        type: 'p',
        text: 'If you want premium features - automatic inbox scanning, renewal reminders, a spending calendar, search and filtering - a one-time purchase is a significantly better deal than a monthly subscription. Paying €15 once to manage subscriptions is a fundamentally different proposition from paying €5/month indefinitely.',
      },
      {
        type: 'p',
        text: 'Suprascribe Pro is a one-time payment for lifetime access to all premium features. No recurring charges, ever.',
      },
      {
        type: 'h2',
        text: 'Our Recommendation',
      },
      {
        type: 'p',
        text: 'For 2026, Suprascribe stands out as the best free subscription manager for three reasons: the free tier has no subscription cap, no bank access is required at any tier, and the Pro upgrade is a one-time payment rather than yet another recurring charge. It is also open source, so the privacy claims are verifiable.',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}
