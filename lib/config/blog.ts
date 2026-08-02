export type BlogSectionType = 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'callout'

export interface BlogSectionLink {
  /** Exact substring of `text` (or of an entry in `items`) to turn into an anchor. */
  text: string
  href: string
}

export interface BlogSection {
  type: BlogSectionType
  text?: string
  items?: string[]
  /**
   * Optional in-body anchors. Each entry's `text` is matched against `text` and
   * `items`, and the first occurrence is replaced with a link to `href`.
   * A phrase that is not found renders unchanged.
   */
  links?: BlogSectionLink[]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  publishedAt: string
  updatedAt?: string
  /** Marks a post as part of the "subscription era" set surfaced on the landing page. */
  subscriptionEra?: boolean
  /** Short punchy title for the landing card. Falls back to `title`. */
  landingTitle?: string
  /** Short blurb for the landing card. `description` stays long for meta/OG. */
  landingBlurb?: string
  /** Source publication shown on the landing card badge. */
  source?: string
  /** Logo for `source`, shown on the landing card instead of the text badge. */
  sourceLogo?: string
  /** Link to the original report at `source`. Rendered next to the source badge. */
  sourceUrl?: string
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
    title: 'Cancel Subscriptions You Forgot You Had: The Full Playbook',
    description:
      'A step-by-step guide to finding and cancelling forgotten subscriptions - before the next charge hits your account.',
    publishedAt: '2026-05-16',
    updatedAt: '2026-07-29',
    readingTimeMin: 5,
    intro:
      'Forgotten subscriptions can drain hundreds of euros a year. Here is how to find every active subscription and cancel the ones you no longer want.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do I find all my subscriptions?',
    ],
    relatedSlugs: [
      'cancel-subscriptions-iphone',
      'cancel-subscriptions-android',
      'how-to-find-all-your-subscriptions',
      'how-to-find-hidden-subscriptions-bank-statement',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To cancel a forgotten subscription, search your inbox for "receipt", "invoice", and "billing" to identify what you are paying for. Then check Apple Subscriptions, Google Play, and PayPal automatic payments. For each subscription to cancel, go to its account settings - EU consumer protection law requires cancellation to be as easy as sign-up.',
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
        type: 'p',
        text: 'Suprascribe keeps that list for you. Quick Unsubscribe then takes you straight to the cancel page for each service on it, so the hardest part of cancelling - finding the button - is already done.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free to use for manual subscription management. No bank access required. The email auto-discovery that finds forgotten subscriptions is a one-time Pro upgrade.',
      },
    ],
  },
  {
    slug: 'how-to-find-all-your-subscriptions',
    title: 'How to find all your subscriptions in one place',
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
      'how-to-save-money-fast',
      'how-to-find-hidden-subscriptions-bank-statement',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To find all your subscriptions, search your email for "receipt", "invoice", "renewal", and "your subscription". Also check Apple Subscriptions (Settings → Apple ID → Subscriptions), Google Play (Profile → Payments & subscriptions), PayPal automatic payments, and Amazon Memberships. The fastest method is connecting Gmail or Outlook to a subscription tracker like Suprascribe, which scans your inbox automatically in minutes.',
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
    title: 'Subscription fatigue: how to audit and take back control of your monthly spending',
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
      'how-to-save-money-fast',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [{ href: '/free-subscription-manager', label: 'Free Subscription Manager' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Subscription fatigue is the financial and mental drain of paying for more recurring services than you actively use. The fix is a subscription audit: list every active charge, calculate your total monthly cost, and cancel anything you have not used in the past 30 days. Most people find at least two or three subscriptions worth cancelling immediately.',
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
    title: 'The best free subscription manager in 2026',
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
      'best-subscription-tracker-app',
      'how-to-cancel-subscriptions',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [
      { href: '/compare', label: 'Suprascribe vs the Alternatives' },
      {
        href: '/subscription-tracker-without-bank-account',
        label: 'Tracker With No Bank Linking',
      },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: The best free subscription manager in 2026 should impose no cap on the free tier, require no bank account access, and offer automatic discovery through email scanning. Suprascribe meets all three criteria: unlimited free tracking, email-based discovery via Gmail and Outlook, and a one-time Pro upgrade with no recurring fees.',
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
  {
    slug: 'how-to-cancel-netflix-subscription',
    title: 'Cancel Netflix in 2026 (Web, App, Apple, Google, PayPal)',
    description:
      'Cancel Netflix on the web, in the mobile app, or through Apple, Google, or PayPal billing - and keep watching until your paid period ends.',
    publishedAt: '2026-06-22',
    updatedAt: '2026-07-29',
    readingTimeMin: 5,
    intro:
      'Cancelling Netflix takes about two minutes once you know where you are billed. The only real catch is third-party billing - if you signed up through Apple, Google, or PayPal, the cancel button is not inside Netflix.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'how-to-cancel-disney-plus',
      'cancel-subscriptions-iphone',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To cancel Netflix, go to netflix.com, open Account, and select "Cancel Membership". If you subscribed through Apple, Google Play, or PayPal, you must cancel there instead - the option will not appear inside Netflix. Either way, you keep access until the end of your current paid period and there is nothing to refund.',
      },
      {
        type: 'p',
        text: 'Netflix is one of the easier services to cancel, but where you cancel depends entirely on how you pay. This guide covers the web, the mobile app, and the three most common third-party billing routes, plus what happens to your account afterwards.',
      },
      {
        type: 'h2',
        text: 'Cancel on the Web (Recommended)',
      },
      {
        type: 'p',
        text: 'The most reliable way to cancel is from a browser, where every billing type is handled in one place:',
      },
      {
        type: 'ol',
        items: [
          'Go to netflix.com and sign in',
          'Click your profile icon in the top-right corner and choose "Account"',
          'Under "Membership", select "Cancel Membership"',
          'Confirm on the next screen - you will see the date your access ends',
        ],
      },
      {
        type: 'h2',
        text: 'Cancel in the Mobile App',
      },
      {
        type: 'p',
        text: 'You can manage your membership from the Netflix app under "Account", and the steps mirror the web. Note that if you subscribed via the Apple App Store or Google Play, the app will not show a cancel option at all - it will point you to the store instead. That is normal, and it is covered next.',
      },
      {
        type: 'h2',
        text: "If You're Billed Through Apple, Google, or PayPal",
      },
      {
        type: 'p',
        text: 'When a third party handles your billing, Netflix cannot cancel the charge for you. Cancel from the platform that bills you:',
      },
      {
        type: 'ul',
        items: [
          'Apple: Settings → Apple ID → Subscriptions → Netflix → Cancel Subscription',
          'Google Play: Play Store → Profile → Payments & subscriptions → Subscriptions → Netflix → Cancel',
          'PayPal: Settings → Payments → Manage automatic payments → Netflix → Cancel',
        ],
      },
      {
        type: 'callout',
        text: 'Tip: Not sure who bills you? Open your Netflix Account page and check the payment method shown, or search your inbox for the Netflix receipt - it names the billing platform.',
      },
      {
        type: 'h2',
        text: 'What Happens After You Cancel',
      },
      {
        type: 'p',
        text: 'Cancelling does not cut you off immediately. Your plan stays active until the end of the period you have already paid for, so there is no partial refund to chase.',
      },
      {
        type: 'ul',
        items: [
          'You keep full access until your current billing period ends',
          'No partial refund is issued - and none is needed, since you keep what you paid for',
          'Netflix retains your profiles and viewing history for 10 months in case you return',
          'You can restart anytime before that without losing your settings',
        ],
      },
      {
        type: 'h2',
        text: "Don't Lose Track of the Next One",
      },
      {
        type: 'p',
        text: 'Netflix is rarely the only recurring charge on an account. The reason subscriptions add up is that each one is easy to forget individually. Keeping a single live list of every service, its cost, and its renewal date is the simplest way to stay in control - and a renewal reminder a week before each charge turns every renewal into a conscious choice rather than a surprise.',
      },
      {
        type: 'p',
        text: 'If Netflix is one of several services you have been meaning to review, Quick Unsubscribe drops you straight onto the cancel page for each one in your list, so you are not hunting through account menus service by service.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free to use for manual subscription tracking - no bank access required. Pro adds automatic email discovery and renewal reminders as a one-time payment, not another monthly fee.',
      },
    ],
  },
  {
    slug: 'how-to-cancel-amazon-prime',
    title: 'Cancel Amazon Prime (And Get a Refund If Eligible)',
    description:
      'A step-by-step guide to cancelling Amazon Prime, skipping the retention screens, and knowing when you qualify for a refund on unused benefits.',
    publishedAt: '2026-06-22',
    updatedAt: '2026-07-29',
    readingTimeMin: 5,
    intro:
      'Amazon hides Prime cancellation behind several "are you sure?" retention screens. Here is the direct path to the real cancel button, plus the refund rules most people miss.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do I find all my subscriptions?',
    ],
    relatedSlugs: [
      'how-to-cancel-free-trial-before-charged',
      'how-to-cancel-subscriptions',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To cancel Amazon Prime, go to Account → Prime Membership → "Manage Membership" → "End Membership", then click past the retention offers until you reach the final confirmation. If you have not used any Prime benefits in the current period, you may be entitled to a full or prorated refund.',
      },
      {
        type: 'p',
        text: 'Cancelling Prime is straightforward in principle, but Amazon deliberately adds friction: a series of screens offering reminders, pauses, and discounts designed to talk you out of leaving. The trick is knowing that the real cancel button sits at the end of that maze.',
      },
      {
        type: 'h2',
        text: 'Cancel Prime Step by Step',
      },
      {
        type: 'ol',
        items: [
          'Sign in at amazon.com and open "Accounts & Lists"',
          'Select "Prime Membership" (or "Prime" from the menu)',
          'Choose "Manage Membership" → "End Membership" (sometimes labelled "Update, Cancel and More")',
          'Click through the retention offers - decline each one',
          'Confirm the cancellation and note the end date shown',
        ],
      },
      {
        type: 'callout',
        text: 'The retention maze: Amazon shows several screens designed to keep you - "Remind Me Later", "Pause Membership", and discount offers. None of these cancel your membership. Keep declining until you see a clear end date confirmation.',
      },
      {
        type: 'h2',
        text: 'Will You Get a Refund?',
      },
      {
        type: 'p',
        text: 'Whether you get money back depends on your plan and how much you have used:',
      },
      {
        type: 'ul',
        items: [
          'Annual plan, no benefits used this term: typically a full refund',
          'Annual plan, benefits already used: a prorated refund or none, depending on usage',
          'Monthly plan: usually no refund - the membership simply runs to the end of the period',
          'In the EU, a 14-day right of withdrawal can apply to a recent renewal - cancel promptly to use it',
        ],
      },
      {
        type: 'h2',
        text: 'Cancel a Prime Free Trial',
      },
      {
        type: 'p',
        text: 'If you are on a Prime free trial, cancel before it ends and you will not be charged - and you usually keep the benefits until the trial expiry date. Cancelling early does not cut the trial short. For the full playbook on timing trial cancellations, see our guide on cancelling a free trial before you get charged.',
      },
      {
        type: 'h2',
        text: 'Other Amazon Subscriptions to Check',
      },
      {
        type: 'p',
        text: 'Cancelling Prime does not stop the other recurring charges Amazon bills separately. Check each of these under "Memberships & Subscriptions":',
      },
      {
        type: 'ul',
        items: [
          'Prime Video Channels (e.g. add-on streaming services)',
          'Audible credits and memberships',
          'Kindle Unlimited',
          'Subscribe & Save recurring deliveries',
        ],
      },
      {
        type: 'h2',
        text: 'Keep an Eye on Recurring Amazon Charges',
      },
      {
        type: 'p',
        text: 'Because Amazon spreads subscriptions across several products, it is easy to cancel Prime and still be paying for an Audible plan or a Prime Video channel you forgot about. A single dashboard that lists every recurring charge - Amazon and otherwise - makes these easy to spot before they renew.',
      },
      {
        type: 'p',
        text: 'Prime is rarely the only membership worth a second look. Quick Unsubscribe takes you straight to the cancel page for every service in your list, so an audit that would take an afternoon takes a few minutes.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe gives you one place to see every subscription and its renewal date, free for manual tracking. Pro adds automatic email discovery to surface charges like Audible or Prime Video channels you may have missed - a one-time payment, not a recurring fee.',
      },
    ],
  },
  {
    slug: 'how-to-cancel-free-trial-before-charged',
    title: 'Cancel a Free Trial Before You Get Charged',
    description:
      'How to cancel a free trial in time, keep access until it ends, avoid the auto-renewal charge - and what to do if you get billed anyway.',
    publishedAt: '2026-06-22',
    updatedAt: '2026-07-29',
    readingTimeMin: 6,
    intro:
      'Around 86% of people mean to cancel a free trial and forget. The auto-renewal is the trap - it converts silently the moment the trial ends. Here is how to win every time.',
    faqQuestions: [
      'How do renewal reminders work?',
      'How do I cancel a subscription I forgot about?',
    ],
    relatedSlugs: [
      'cancel-chatgpt-subscription',
      'how-to-cancel-amazon-prime',
      'how-to-cancel-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-manager', label: 'Free Subscription Manager' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Cancel a free trial 24-48 hours before it ends, not at the last minute. Most major services - Netflix, Spotify, Apple, Google, Amazon - let you cancel immediately after signing up and still keep access until the trial expiry date. The safest move is to set a reminder the moment you start the trial.',
      },
      {
        type: 'p',
        text: 'Free trials work because of negative-option billing: doing nothing means you get charged. The trial is genuinely free, but it auto-converts to a paid subscription the instant it ends unless you act. Beating it is about timing and a reliable reminder, not about cancelling at the perfect second.',
      },
      {
        type: 'h2',
        text: 'Cancel Immediately, Keep the Trial',
      },
      {
        type: 'p',
        text: 'The most common myth is that cancelling early cuts your trial short. For most major services it does not - you can cancel right after signing up and still use the trial until its expiry date. Cancelling simply switches off the auto-renewal.',
      },
      {
        type: 'ul',
        items: [
          'Netflix, Spotify, Apple services, Google services, and Amazon Prime all let you cancel during a trial and keep access until it ends',
          'Always check the wording on the confirmation screen - a few smaller services do end access on cancellation',
          'When in doubt, cancel a day before expiry rather than on day one',
        ],
      },
      {
        type: 'h2',
        text: 'Where to Cancel',
      },
      {
        type: 'p',
        text: 'The cancel option lives wherever you set up billing, which is not always the provider itself:',
      },
      {
        type: 'ul',
        items: [
          "The provider's own account settings, under Billing or Subscription",
          'Apple: Settings → Apple ID → Subscriptions',
          'Google Play: Play Store → Profile → Payments & subscriptions → Subscriptions',
          'PayPal: Settings → Payments → Manage automatic payments',
        ],
      },
      {
        type: 'callout',
        text: 'Tip: "I will cancel tomorrow" is exactly how most people get charged. Cancel the day you sign up if the service lets you keep trial access, or set a hard reminder for 48 hours before the deadline.',
      },
      {
        type: 'h2',
        text: "Set a Reminder You Won't Miss",
      },
      {
        type: 'p',
        text: 'A calendar reminder works, but it is easy to dismiss and forget. A dedicated renewal reminder tied to the subscription itself is harder to ignore. Suprascribe Pro sends you an email before any subscription - including a converting trial - renews, so you always get a decision window instead of a surprise charge.',
      },
      {
        type: 'h2',
        text: 'Know Your Rights (EU)',
      },
      {
        type: 'p',
        text: 'In the EU you often have a 14-day right of withdrawal on online purchases, and providers must disclose auto-renewal terms clearly up front. Cancellation must also be as easy as sign-up. These rules give you leverage if a service makes cancelling deliberately difficult.',
      },
      {
        type: 'h2',
        text: "What If You're Charged Anyway",
      },
      {
        type: 'p',
        text: 'If a charge slips through despite cancelling, act quickly:',
      },
      {
        type: 'ol',
        items: [
          'Contact the provider and request a refund - many will reverse a charge made days after a clear cancellation',
          'Keep evidence: screenshots, the cancellation confirmation email, and any reference number',
          'If the provider refuses, ask your card issuer or bank to block future payments or dispute the charge',
        ],
      },
      {
        type: 'h2',
        text: 'Track Trials So None Slip Through',
      },
      {
        type: 'p',
        text: 'The reliable long-term fix is to log every trial the moment you start it, with its end date, in one place. Suprascribe keeps a live list of your subscriptions and trials, and its email auto-discovery can surface trials you signed up for and forgot - before they quietly convert.',
      },
      {
        type: 'p',
        text: "When a trial does need to go, Quick Unsubscribe takes you straight to that service's cancel page rather than leaving you to find it - which is usually where the intention to cancel dies.",
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual tracking, with no bank access required. Renewal reminders and automatic email discovery are part of a one-time Pro upgrade - pay once, never pay a monthly fee to manage your monthly fees.',
      },
    ],
  },
  {
    slug: 'how-much-americans-spend-on-subscriptions',
    title: 'How much do Americans spend on subscriptions? (2025 survey)',
    description:
      'A 2025 CNET survey found the average American spends about $1,080 a year on subscriptions - and wastes roughly $200 of it on services they barely use.',
    publishedAt: '2026-06-24',
    subscriptionEra: true,
    landingTitle: 'People waste ~$200/yr on subscriptions they never use',
    landingBlurb:
      'Based on a CNET survey, the average American spends $1,080 a year on subscriptions and barely touches $200 of it.',
    source: 'CNET',
    sourceLogo: '/sources_logos/cnet.svg',
    sourceUrl: 'https://www.cnet.com/tech/services-and-software/subscription-survey-2025/',
    readingTimeMin: 6,
    intro:
      'The average American spends around $1,080 a year on subscriptions, and roughly $205 of that goes to services they rarely or never use. Those figures come from a 2025 CNET survey, and they line up with a feeling most people already have: the small monthly charges add up to a lot more than expected.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'What is the best free app to track subscriptions?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: ['how-to-save-money-fast', 'subscription-fatigue', 'how-to-cancel-subscriptions'],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: According to a 2025 CNET survey conducted with YouGov, the average American spends about $90 a month - roughly $1,080 a year - on subscriptions, and around $17 of that monthly total (about $205 a year) goes to services they barely touch. Streaming video is the most common category, and most people underestimate their own total until they add it up.',
      },
      {
        type: 'p',
        text: 'It is easy to dismiss any single subscription as a few dollars a month. The problem is that almost nobody has just one. CNET surveyed 2,440 Americans in 2025 in partnership with YouGov, of whom 1,932 had paid for at least one subscription in the past year, and the results put a hard number on a soft, creeping cost most households never sit down to total. The figures below are drawn from that survey.',
      },
      {
        type: 'h2',
        text: 'What Americans Actually Spend',
      },
      {
        type: 'p',
        text: 'The headline numbers are larger than most people guess for themselves. When CNET asked respondents to account for everything they pay for on a recurring basis, the averages came out like this:',
      },
      {
        type: 'ul',
        items: [
          'About $90 per month on subscriptions overall',
          'Roughly $1,080 per year once those monthly charges are added up',
          'Around $17 per month - about $205 a year - spent on subscriptions that are rarely or never used',
        ],
      },
      {
        type: 'p',
        text: 'That last figure is the one worth pausing on. Over $200 a year, for most people, is money leaving the account every month for something that delivers no value - not because of a single bad decision, but because forgotten subscriptions quietly renew in the background.',
      },
      {
        type: 'h2',
        text: 'Where the Money Goes',
      },
      {
        type: 'p',
        text: 'The survey also mapped which categories dominate household subscription budgets. Streaming led by a wide margin, but the long tail of e-commerce memberships and music services adds up:',
      },
      {
        type: 'ul',
        items: [
          'Streaming video - the most common subscription, held by 61% of respondents',
          'E-commerce memberships like Amazon Prime and Walmart+ - 37%',
          'Streaming music services - 33%',
        ],
      },
      {
        type: 'p',
        text: 'These three categories alone explain a large share of the monthly total, and because each one auto-renews on its own schedule, they are rarely reviewed together. That is precisely how the bill creeps upward without any single moment where someone decided to spend more.',
      },
      {
        type: 'h2',
        text: 'People Are Already Cutting Back',
      },
      {
        type: 'p',
        text: 'The CNET survey found that subscription fatigue is translating into action. With economic pressure on household budgets, 61% of respondents said they were reconsidering at least one subscription, and one in four said they had already cancelled one. The appetite to trim is clearly there - what most people lack is a clear, complete picture of what they are paying for in the first place.',
      },
      {
        type: 'h2',
        text: 'How to Audit Your Own Subscriptions',
      },
      {
        type: 'p',
        text: 'The survey numbers are averages, but the only ones that matter are yours. A short audit usually surfaces at least one or two charges worth cutting. Work through it in order:',
      },
      {
        type: 'ol',
        items: [
          'List every recurring charge you have - check email receipts and bank statements, or use a tracker so nothing slips through',
          'Convert each one to a monthly cost and add them up to get your real total',
          'For each subscription ask: did I actually use this in the last 30 days?',
          'For the ones you did not: will I realistically use it in the next 30 days?',
          'Cancel everything that fails both questions',
        ],
      },
      {
        type: 'callout',
        text: 'Be honest at step 3. "I might watch it one day" is not the same as using a service. If it sat untouched for a month, it will probably sit untouched for the next one - and that is exactly the $205-a-year category the CNET survey identified.',
      },
      {
        type: 'h2',
        text: 'Stop Paying for the Ones You Forgot',
      },
      {
        type: 'p',
        text: 'The reason these costs accumulate is that each subscription is forgettable on its own. The fix is a single live list of every service, what it costs, and when it renews - so the total is always visible and every renewal is a conscious choice rather than a surprise charge. Suprascribe is free for manual tracking with no bank access required. The Pro upgrade adds automatic email discovery to surface subscriptions you have forgotten, plus renewal reminders that email you before each charge so you can decide to keep or cancel in time.',
      },
      {
        type: 'callout',
        text: 'Suprascribe Pro is a one-time payment, not another monthly fee. You should not have to pay a recurring subscription just to keep your other recurring subscriptions under control.',
      },
    ],
  },
  {
    slug: 'car-feature-subscriptions',
    title: 'Your car is becoming a subscription: BMW dropped the heated seat fee, not the model',
    description:
      'BMW charged £15 a month to switch on heated seats already fitted to your car. It backed down on that one - and stayed committed to selling car features after you have bought the car.',
    publishedAt: '2026-07-16',
    updatedAt: '2026-07-23',
    subscriptionEra: true,
    landingTitle: 'Even your car is becoming a subscription',
    landingBlurb:
      'BMW dropped the £15 a month heated seat fee. It did not drop the model - and the rest of the industry is heading the same way.',
    source: 'BBC',
    sourceLogo: '/sources_logos/bbc.svg',
    sourceUrl: 'https://www.bbc.com/news/technology-62142208',
    readingTimeMin: 6,
    intro:
      'BMW once offered UK drivers a £15 per month subscription to turn on the heated front seats already fitted to their cars. That specific fee is gone - the backlash worked. What did not go anywhere is the business model behind it, and BMW is far from the only manufacturer committed to it.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'How do I cancel a subscription I forgot about?',
    ],
    relatedSlugs: [
      'subscription-fatigue',
      'how-much-americans-spend-on-subscriptions',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: BMW charged UK drivers £15 per month to activate heated front seats that were already installed in the car, sold through its ConnectedDrive online store. After the backlash it dropped that fee - heated seats are not a subscription any more. But BMW told The Drive it remains "fully committed" to selling features after purchase through the same platform, and anything requiring a data package will likely carry a recurring charge. Tesla has moved Full Self-Driving to a subscription, GM has billed for OnStar since the 1990s, and most semi-autonomous driving software now comes with a monthly fee.',
      },
      {
        type: 'p',
        text: 'A car used to be the clearest example of a thing you buy once. You pay, you own it, the hardware is yours. That assumption is quietly being unwound. The hardware still ships in the vehicle - the question is now whether you are allowed to use it without a monthly payment.',
      },
      {
        type: 'h2',
        text: 'The Fee That Made Everyone Notice',
      },
      {
        type: 'p',
        text: 'BMW offered UK owners a £15 per month subscription to switch on their heated front seats, activated remotely through the ConnectedDrive online store with no dealer visit needed. The seats, the elements, the wiring - all of it shipped in the car regardless. As The Verge put it at the time, owners already had every necessary component, and BMW had simply placed a software block on the functionality that buyers then paid to remove. The Register was blunter: it may feel like buying a mug and having to rent the handle.',
      },
      {
        type: 'p',
        text: 'BMW told the BBC that "where heated seats, or any feature available in the ConnectedDrive store have been purchased when a customer vehicle is ordered, no subsequent subscription or payment is necessary", and framed the store as flexibility - owners who change their minds after purchase can add features later, second-hand buyers can add features the original owner did not choose, and short-term trials let you test before committing.',
      },
      {
        type: 'p',
        text: 'The objection was never really about £15. It was about what the charge implies - that a switch physically present in something you own can be disabled at the factory and rented back to you. Kurt Opsahl, then general counsel of the Electronic Frontier Foundation, put it as a repair question: a seat heater blocked by software is broken, and the owner should have the right to fix their seats.',
      },
      {
        type: 'h2',
        text: 'BMW Dropped the Fee, Not the Model',
      },
      {
        type: 'p',
        text: 'The backlash worked, in the narrow sense. BMW backed down on heated seats, and they are not sold as a subscription today. It is tempting to file that away as a win. It was not, really - what got withdrawn was the single example that made the model impossible to ignore, not the model itself.',
      },
      {
        type: 'p',
        text: 'BMW has been explicit about that. "BMW remains fully committed to the ConnectedDrive environment as an essential part of the global BMW Aftersales strategy," a spokesperson told The Drive. "With these established digital offerings, we offer our customers even more comfort and flexibility in line with their individual wishes after they purchase a vehicle. This allows customers to opt for additional functions and services retroactively."',
      },
      {
        type: 'p',
        text: '"Retroactively" is doing a lot of work in that sentence. It means the feature set of your car is no longer settled at the point of sale - it stays open, indefinitely, as a place to sell you something. And the dividing line BMW now works to is a practical one: if a feature needs a data connection of some kind, it will probably carry a recurring fee. BMW says its customers are already comfortable subscribing to that sort of add-on.',
      },
      {
        type: 'p',
        text: 'That is the shape the model settled into everywhere. Physical hardware held behind a paywall produces an obvious moment of outrage. Data-dependent and connected features do not, because there is no switch you can point at and say you already paid for it. The charge just appears, and it keeps appearing.',
      },
      {
        type: 'h2',
        text: 'It Is Not Just BMW',
      },
      {
        type: 'p',
        text: 'Treating this as one company misreading its customers misses the pattern. Manufacturers and dealers have always made money after the sale, mostly through maintenance - and electric cars need far less of it. Recurring software revenue is what fills that gap, which is why the direction is industry-wide:',
      },
      {
        type: 'ul',
        items: [
          'Tesla has moved Full Self-Driving to a subscription, paywalling features that were previously standard, after years of selling software upgrades as one-time purchases',
          'GM has charged membership fees for OnStar services since the mid-1990s, long before the current wave',
          'Most semi-autonomous driving software now carries a subscription, typically after a free trial period',
          'Infotainment and concierge services have been coming and going as paid add-ons for years',
        ],
      },
      {
        type: 'p',
        text: 'When every major player moves the same way, opting out stops being a choice you make between brands. It becomes a condition of buying a car at all.',
      },
      {
        type: 'h2',
        text: 'What This Means for Your Monthly Total',
      },
      {
        type: 'p',
        text: 'The practical problem is not the price of any one car feature. It is that recurring charges are now arriving from categories that never had them, and those charges are much harder to see than the ones you are used to.',
      },
      {
        type: 'ul',
        items: [
          'Car feature subscriptions do not appear in your Apple or Google Play subscription list - the two places most people think to check',
          'They are often billed annually or bundled into a manufacturer account, so they skip the monthly statement scan entirely',
          'They are attached to a purchase you mentally filed as finished years ago, so you are not looking for them',
          'The same logic is spreading to appliances, software and hardware you assumed you owned outright',
        ],
      },
      {
        type: 'p',
        text: 'This is how subscription creep actually works. Nobody sits down and decides to spend more every month. The total rises because each individual charge is small, defensible, and invisible from wherever you happen to be looking.',
      },
      {
        type: 'h2',
        text: 'Get the Full Picture Back',
      },
      {
        type: 'p',
        text: 'You cannot opt out of an industry-wide shift in how products are sold. You can refuse to lose track of what it is costing you. The defence is the same as it has always been: one live list of every recurring charge, what it costs, and when it renews - so that each renewal is a decision you make rather than a line you discover later. Suprascribe is free for manual tracking with no bank access required. The Pro upgrade scans your inbox for the charges you have forgotten, including the ones that never show up in an app store, and reminds you before each renewal.',
      },
      {
        type: 'callout',
        text: 'Suprascribe will never be a subscription. Pro is a one-time payment - because paying a monthly fee to keep track of your monthly fees is exactly the problem, not the fix.',
      },
    ],
  },
  {
    slug: 'netflix-price-increase-2026',
    title: 'Netflix raised every plan again - the price you signed up for was never the price',
    description:
      'Netflix increased the cost of every US plan in March 2026, the second hike in under two years. Here are the new prices and what repricing means for your subscription total.',
    publishedAt: '2026-07-16',
    subscriptionEra: true,
    landingTitle: 'The price you signed up for was never the price',
    landingBlurb:
      'Netflix raised every US plan in March 2026 - the second hike in under two years. Each rise is small enough to ignore.',
    source: 'CNBC',
    sourceLogo: '/sources_logos/cnbc.svg',
    sourceUrl:
      'https://www.cnbc.com/2026/03/26/netflix-raises-prices-across-all-streaming-plans.html',
    readingTimeMin: 5,
    intro:
      'In March 2026 Netflix raised the price of every single US plan - the second increase in under two years. The number you agreed to when you signed up was never a fixed price. It was a starting point, and it moves without you.',
    faqQuestions: [
      'How do renewal reminders work?',
      'How do I cancel a subscription I forgot about?',
    ],
    relatedSlugs: [
      'how-to-cancel-netflix-subscription',
      'how-much-americans-spend-on-subscriptions',
      'subscription-fatigue',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: On 26 March 2026 Netflix raised the price of every US plan. Standard with Ads went from $7.99 to $8.99, Standard from $17.99 to $19.99, and Premium from $24.99 to $26.99. The new rates applied to new subscribers immediately, with existing subscribers notified ahead of their billing cycles. It is the second increase in under two years, following one in early 2025.',
      },
      {
        type: 'p',
        text: 'Nobody cancels over two dollars. That is precisely why this works. A price rise small enough to shrug at, applied to a service you have already integrated into your evenings, is not a decision point - it is a notification you skim and forget. Repeat that across every subscription you hold and the arithmetic stops being trivial.',
      },
      {
        type: 'h2',
        text: 'The New Prices',
      },
      {
        type: 'p',
        text: 'Every tier moved, including the ad-supported one that was introduced as the affordable option:',
      },
      {
        type: 'ul',
        items: [
          'Standard with Ads: $7.99 → $8.99 per month, an increase of $1',
          'Standard (no ads, two devices at once): $17.99 → $19.99 per month, an increase of $2',
          'Premium (no ads, four devices, Ultra HD and HDR): $24.99 → $26.99 per month, an increase of $2',
        ],
      },
      {
        type: 'p',
        text: 'The changes took effect for new users on 26 March 2026. Existing subscribers were notified in advance of their own billing cycles, which means the charge landed at a different time for almost everyone - and rarely at a moment when anyone was thinking about it.',
      },
      {
        type: 'h2',
        text: 'Twice in Two Years',
      },
      {
        type: 'p',
        text: 'This was the second Netflix price increase in less than two years, following an adjustment in early 2025. That cadence is the part worth noticing. A subscription is not a purchase with a price; it is an open-ended agreement that can be repriced while you are inside it.',
      },
      {
        type: 'p',
        text: 'Compare it to buying anything else. If a product costs more next year, you decide whether to buy it at the new price. With a subscription the default runs the other way: the new price is charged unless you take action to stop it. Inertia is not a side effect of the model. It is the business case.',
      },
      {
        type: 'h2',
        text: 'Why This Keeps Happening',
      },
      {
        type: 'p',
        text: 'Netflix has been spending heavily on content, expanding into live events and video podcasts, and is expected to spend roughly $20 billion on content in 2026. Those are real costs, and the price rise is a coherent response to them.',
      },
      {
        type: 'p',
        text: 'But the reasoning matters less than the structure. As long as revenue can be raised by adjusting a number that millions of people have already agreed to pay indefinitely, that number will keep being adjusted. Every subscription service you hold faces the same incentive, and most of them will act on it.',
      },
      {
        type: 'h2',
        text: 'The Compounding Problem',
      },
      {
        type: 'p',
        text: 'A $2 rise on one service is genuinely nothing. That is the whole trick. You are not holding one service - you are holding a dozen, each raising prices on its own schedule, each individually too small to trigger a reaction.',
      },
      {
        type: 'p',
        text: 'A few dollars a month across a dozen services is a few hundred dollars a year, and it arrives without a single moment where anyone chose to spend more. This is the same mechanism behind the roughly $205 a year that the average American spends on subscriptions they barely use - small amounts, invisible individually, significant in aggregate.',
      },
      {
        type: 'h2',
        text: 'What to Do About It',
      },
      {
        type: 'p',
        text: 'You cannot stop services from repricing. You can make sure a price rise reaches you as a decision instead of a statement line you notice months later:',
      },
      {
        type: 'ol',
        items: [
          'List every recurring charge you have, with its current price - not the price you remember signing up at',
          'Add them up. The total is almost always higher than the number in your head',
          'For each one, ask whether you would sign up today at the price you are now paying',
          'Set a reminder before each renewal date so the charge arrives as a choice, not a surprise',
          'Cancel anything that failed step three - a price rise is the natural moment to re-evaluate, which is exactly why the notification is designed to be forgettable',
        ],
      },
      {
        type: 'p',
        text: 'Suprascribe is free for manual tracking, with no bank access required. The Pro upgrade scans your inbox to surface the subscriptions you have forgotten and sends renewal reminders before each charge, so repricing gets caught at the moment you can still do something about it.',
      },
      {
        type: 'callout',
        text: 'Suprascribe Pro is a one-time payment and will never be a subscription. Your price will not quietly go up in two years, because there is no recurring price to raise.',
      },
    ],
  },
  {
    slug: 'how-to-cancel-disney-plus',
    title: 'Cancel Disney+ in 2026 (Web, App, and Bundle)',
    description:
      'Cancel Disney+ whether you are billed directly or through Apple, Google, Amazon, or a cable provider - plus what the Hulu merger means for your bundle.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-07-29',
    readingTimeMin: 5,
    intro:
      'Cancelling Disney+ takes two minutes once you know who bills you. The one thing to watch in 2026 is the Hulu merger - if you are on a Disney+ and Hulu bundle, the cancel path is not where you expect it.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: [
      'how-to-cancel-netflix-subscription',
      'how-to-cancel-subscriptions',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To cancel Disney+, sign in at disneyplus.com, open your profile → Account → your subscription, then choose "Cancel Subscription" and confirm. If you signed up through Apple, Google, Amazon, or a cable provider, cancel there instead - Disney cannot stop that charge. You keep access until the end of the current billing period.',
      },
      {
        type: 'p',
        text: 'Disney+ is one of the more straightforward services to leave, but where you cancel depends entirely on how you pay. This guide covers the web, the app, third-party billing, and the one wrinkle that is new in 2026 - the folding of Hulu into Disney+.',
      },
      {
        type: 'h2',
        text: 'Cancel on the Web (Recommended)',
      },
      {
        type: 'p',
        text: 'The browser is the most reliable place to cancel because it handles every billing type in one flow:',
      },
      {
        type: 'ol',
        items: [
          'Go to disneyplus.com and sign in',
          'Click your profile icon in the top-right and choose "Account"',
          'Under "Subscription", select your Disney+ plan',
          'Choose "Cancel Subscription" and confirm - you will see the date your access ends',
        ],
      },
      {
        type: 'h2',
        text: "If You're Billed Through Apple, Google, Amazon, or Cable",
      },
      {
        type: 'p',
        text: 'When a third party handles your billing, Disney cannot cancel the charge. Cancel from whoever bills you:',
      },
      {
        type: 'ul',
        items: [
          'Apple: Settings → Apple ID → Subscriptions → Disney+ → Cancel Subscription',
          'Google Play: Play Store → Profile → Payments & subscriptions → Subscriptions → Disney+ → Cancel',
          'Amazon: Account → Memberships & Subscriptions → Disney+ → Cancel',
          'Cable or telecom provider: manage it in your provider account, not on Disney+',
        ],
      },
      {
        type: 'callout',
        text: 'Not sure who bills you? Open your Disney+ Account page and check the payment method shown, or search your inbox for the Disney+ receipt - it names the billing platform.',
      },
      {
        type: 'h2',
        text: 'The Hulu Bundle Wrinkle',
      },
      {
        type: 'p',
        text: 'In 2026 Hulu is being merged into the Disney+ app, and the Disney+ and Hulu bundle is being restructured. If you are on a bundle, cancelling one part may not cancel the other, and some legacy bundle plans have been retired. Check your Account page to see exactly which plan you hold before you cancel, so you do not accidentally keep paying for the half you meant to drop.',
      },
      {
        type: 'h2',
        text: 'What Happens After You Cancel',
      },
      {
        type: 'ul',
        items: [
          'You keep full access until the end of the period you already paid for',
          'No partial refund is issued, and none is needed',
          'Your profiles and watchlist are retained for a while in case you return',
          'You can resubscribe anytime without losing your settings',
        ],
      },
      {
        type: 'h2',
        text: "Don't Lose Track of the Next One",
      },
      {
        type: 'p',
        text: 'Disney+ is rarely the only streaming charge on an account. The reason streaming costs creep up is that each service is easy to forget on its own. A single live list of every subscription, its price, and its renewal date is the simplest way to stay in control - and a reminder before each renewal turns every charge into a decision instead of a surprise.',
      },
      {
        type: 'p',
        text: 'If the Disney+ audit turns up other streaming services you no longer watch, Quick Unsubscribe takes you straight to the cancel page for each of them, so you can clear the whole set in one sitting.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free to use for manual subscription tracking - no bank access required. Pro adds automatic email discovery and renewal reminders as a one-time payment, not another monthly fee.',
      },
    ],
  },
  {
    slug: 'how-to-cancel-spotify',
    title: 'Cancel Spotify Premium in 2026',
    description:
      'Cancel Spotify Premium and drop back to the free tier - on the web or through Apple, Google, or PayPal - and keep your playlists, follows, and library.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-07-29',
    readingTimeMin: 4,
    intro:
      'Cancelling Spotify Premium does not delete your account - it drops you to the free tier and keeps every playlist. The only catch is where you cancel, which depends on how you signed up.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: [
      'how-to-cancel-netflix-subscription',
      'cancel-subscriptions-android',
      'cancel-subscriptions-iphone',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To cancel Spotify Premium, go to spotify.com/account, open "Manage your plan", and select "Cancel Premium". If you subscribed through Apple, Google, or PayPal, cancel there instead. Cancelling drops you to the free tier - your account, playlists, and follows all stay.',
      },
      {
        type: 'p',
        text: 'Spotify is unusual among subscriptions: cancelling Premium does not close your account or wipe your data. You simply revert to the ad-supported free tier and keep everything you built. Here is where to actually do it.',
      },
      {
        type: 'h2',
        text: 'Cancel on the Web',
      },
      {
        type: 'p',
        text: 'Spotify does not let you cancel Premium inside the mobile app - you have to use a browser:',
      },
      {
        type: 'ol',
        items: [
          'Go to spotify.com/account and log in',
          'Open "Manage your plan" (or "Available plans")',
          'Select "Cancel Premium" and follow the prompts',
          'Confirm - you keep Premium until the end of the paid period, then move to free',
        ],
      },
      {
        type: 'h2',
        text: "If You're Billed Through Apple, Google, or PayPal",
      },
      {
        type: 'p',
        text: 'If your Spotify page shows no cancel option, a third party is billing you. Cancel from there:',
      },
      {
        type: 'ul',
        items: [
          'Apple: Settings → Apple ID → Subscriptions → Spotify → Cancel Subscription',
          'Google Play: Play Store → Profile → Payments & subscriptions → Subscriptions → Spotify → Cancel',
          'PayPal: Settings → Payments → Manage automatic payments → Spotify → Cancel',
        ],
      },
      {
        type: 'callout',
        text: 'Bundled Premium, like an old Spotify and Hulu plan, is managed differently - switch to a standalone plan first, then cancel, or the bundled service can keep billing.',
      },
      {
        type: 'h2',
        text: 'What You Keep After Cancelling',
      },
      {
        type: 'ul',
        items: [
          'Your account stays open - cancelling Premium is not the same as deleting your account',
          'Playlists, saved albums, podcasts, and follows all remain',
          'You keep Premium features until the current period ends',
          'You can upgrade again anytime and pick up exactly where you left off',
        ],
      },
      {
        type: 'h2',
        text: 'Watch the Renewal, Not Just the Cancel',
      },
      {
        type: 'p',
        text: 'Music is one of those categories where people quietly hold two or three overlapping services - Spotify, a video service that came with music, an audiobook subscription. Keeping one live list of every recurring charge and its renewal date is how you catch the overlap you would otherwise pay for indefinitely.',
      },
      {
        type: 'p',
        text: 'If Spotify is part of a wider music and streaming clear-out, Quick Unsubscribe takes you straight to the cancel page for each service in your list rather than making you dig through settings for every one.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking, with no bank access required. Pro finds the subscriptions you have forgotten by scanning your inbox and reminds you before each renewal - a one-time payment, never a subscription.',
      },
    ],
  },
  {
    slug: 'how-to-cancel-adobe',
    title: 'Cancel Adobe Creative Cloud Without the Cancellation Fee',
    description:
      'Cancel an Adobe Creative Cloud plan and avoid the early-termination fee - the annual-plan trap, the 14-day refund window, the App Store exception, and what happens to your files afterwards.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-07-29',
    readingTimeMin: 7,
    intro:
      'Adobe will let you cancel in a few clicks - and then charge you up to half of your remaining contract to do it. The fee is real, but it is avoidable if you know which plan you are on and when you are allowed to leave for free. There is also a second cost nobody warns you about: your cloud storage drops to 5 GB the moment you leave.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: [
      'cancel-subscriptions-iphone',
      'cancel-subscriptions-android',
      'how-to-cancel-free-trial-before-charged',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Sign in at account.adobe.com → Plans → "Manage plan" → "Cancel your plan". Cancel within 14 days of purchase for a full refund. After that, an annual plan paid monthly costs 50% of the remaining balance to leave. Bought through the App Store or Google Play? You cannot cancel it on adobe.com at all - go to Apple or Google. And whenever you do leave, your Creative Cloud storage drops to 5 GB with a 30-day grace period.',
      },
      {
        type: 'p',
        text: "Adobe's cancellation is not hard to find - the friction is financial. The company sells most Creative Cloud plans as annual commitments, and leaving one early triggers a fee that surprises a lot of people. Understanding the plan types is the whole game.",
      },
      {
        type: 'h2',
        text: 'First, Know Which Plan You Are On',
      },
      {
        type: 'p',
        text: 'Adobe sells the same apps under three billing structures, and the cancellation cost is completely different for each:',
      },
      {
        type: 'ul',
        items: [
          'Annual, paid monthly: the common default. Cancelling early after day 14 incurs a fee of 50% of the remaining contract balance',
          'Annual, prepaid: paid upfront for the year. You generally finish the term you paid for; there is no monthly commitment left to buy out',
          'Month-to-month: costs more per month but has no early-termination fee - you can leave anytime',
        ],
      },
      {
        type: 'callout',
        text: 'Check your plan type at account.adobe.com under "Plans and payment" before doing anything. The word "annual" next to your plan is the signal that a fee may apply.',
      },
      {
        type: 'h2',
        text: 'The 14-Day Full-Refund Window',
      },
      {
        type: 'p',
        text: 'For most plans, Adobe gives a full refund if you cancel within 14 days of the initial purchase - no cancellation fee. If you have just been charged for a renewal you did not want, act inside that window; it is the cleanest exit and the one Adobe advertises least. Refunds are typically returned to the original payment method within 10 to 15 business days.',
      },
      {
        type: 'h2',
        text: 'The Fee After 14 Days, and Why Adobe Charges It',
      },
      {
        type: 'p',
        text: "Past day 14 on an annual plan paid monthly, Adobe charges an early-termination fee of 50% of the remaining balance of the contract. Adobe's own worked example: cancel in the ninth month of a twelve-month term and you pay 50% of the fee for the three remaining months.",
      },
      {
        type: 'p',
        text: "Adobe's stated reasoning is worth knowing because it points at the workaround. The annual price is discounted against the month-to-month price, so the fee is framed as clawing back part of that discount when you leave early. That is also why moving to a month-to-month plan removes the fee entirely - you give up the discount, and with it the commitment.",
      },
      {
        type: 'h2',
        text: 'How to Cancel on adobe.com',
      },
      {
        type: 'ol',
        items: [
          'Sign in at account.adobe.com',
          'Open "Plans" (the Plans and payment window)',
          'Select "Manage plan" for the plan you want to cancel',
          'Select "Cancel your plan" and step past the retention offers',
          'Review any fee Adobe quotes before you confirm - it appears on the final screen',
          'Confirm, and save the cancellation confirmation email',
        ],
      },
      {
        type: 'h2',
        text: 'If You Bought Adobe Through the App Store or Google Play',
      },
      {
        type: 'p',
        text: 'This is the step that sends people in circles. Adobe plans purchased through the Apple App Store or the Google Play Store cannot be cancelled at adobe.com - Apple and Google manage all billing, cancellation, and refunds for their own purchases. If you sign in to your Adobe account and cannot find the subscription at all, that is almost always why.',
      },
      {
        type: 'ul',
        items: [
          'Bought in an Adobe iOS app: cancel in Settings → [your name] → Subscriptions on your iPhone or iPad',
          'Bought in an Adobe Android app: cancel in the Play Store under Subscriptions',
          'Bought on adobe.com: cancel at account.adobe.com using the steps above',
        ],
        links: [
          {
            text: 'Settings → [your name] → Subscriptions',
            href: '/blog/cancel-subscriptions-iphone',
          },
          {
            text: 'the Play Store under Subscriptions',
            href: '/blog/cancel-subscriptions-android',
          },
        ],
      },
      {
        type: 'h2',
        text: 'The Part Nobody Warns You About: Your Files',
      },
      {
        type: 'p',
        text: 'Cancelling does not only end app access. After cancellation, your Creative Cloud storage allowance drops to 5 GB. If you are over that limit - and anyone who has been syncing project files for a year probably is - you have 30 days to bring your usage down. After those 30 days you can lose access to some or all of the files stored on Adobe servers.',
      },
      {
        type: 'callout',
        text: 'Before you confirm the cancellation, download anything you care about from Creative Cloud to local storage. The 30-day window starts at cancellation, not at the end of your paid term, and it is easy to let it run out while you still have working app access.',
      },
      {
        type: 'h2',
        text: 'Ways to Avoid or Shrink the Fee',
      },
      {
        type: 'ul',
        items: [
          'Wait until you are near the end of the annual term - the 50% is of what remains, so it shrinks every month',
          'Switch to a month-to-month plan first if you only need the apps a little longer, then cancel with no fee',
          'Downgrade to a single-app plan instead of the full suite if cost is the real issue',
          'Cancel within the 14-day window after any renewal for a full refund',
        ],
      },
      {
        type: 'h2',
        text: 'Why This One Is Worth Tracking',
      },
      {
        type: 'p',
        text: 'The Adobe fee is a clean example of why the renewal date matters as much as the price. An annual plan that auto-renews on a date you have forgotten locks you into another year - and another potential fee - before you have a chance to reconsider. A reminder a week before the renewal is the difference between choosing to continue and being committed by default.',
      },
      {
        type: 'p',
        text: 'Adobe is also rarely the only annual plan in the pile. Quick Unsubscribe takes you straight to the cancel page for each service in your list, so the annual renewals you only think about once a year get reviewed on your schedule rather than theirs.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual tracking with no bank access required. Pro surfaces the annual renewals hiding in your inbox and reminds you before each one - a one-time payment, so the tool that watches your subscriptions is never a subscription itself.',
      },
    ],
  },
  {
    slug: 'how-to-cancel-planet-fitness',
    title: 'Cancel Planet Fitness (And Beat the Cancellation Runaround)',
    description:
      'Planet Fitness makes you cancel in person or by certified letter. Here is the exact process, a cancellation-letter template, and how to stop the annual fee.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-07-29',
    readingTimeMin: 6,
    intro:
      'Planet Fitness is cheap to join and deliberately awkward to leave. There is no cancel button online - you have to show up in person or mail a certified letter. Here is the process that actually works, and how to avoid the annual fee catching you on the way out.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: ['how-to-cancel-subscriptions', 'how-to-cancel-adobe', 'subscription-fatigue'],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Planet Fitness does not let you cancel online or by phone. Go to your home club in person and fill out a cancellation form, or send a signed cancellation letter by certified mail to that club. Do it before the 10th of the month to avoid next month’s dues, and watch the timing around the annual fee, which usually hits in the first quarter.',
      },
      {
        type: 'p',
        text: 'Planet Fitness runs on the same model as most gyms: a low monthly price that is easy to sign up for and, by design, harder to stop. The cancellation friction is not an accident - it is the retention strategy. Knowing the exact process removes most of the pain.',
      },
      {
        type: 'h2',
        text: 'The Two Methods That Actually Work',
      },
      {
        type: 'p',
        text: 'Planet Fitness only accepts two cancellation methods, and both go through your specific home club rather than a central line:',
      },
      {
        type: 'ul',
        items: [
          'In person: visit your home club and ask to fill out a membership cancellation form. Keep the copy they give you',
          'Certified mail: send a signed cancellation letter to your home club’s address and pay for certified delivery so you have proof it arrived',
        ],
      },
      {
        type: 'callout',
        text: 'Email, the app, and phone calls do not count as valid cancellation. Members who "cancelled" by app have kept being charged - use one of the two methods above and keep proof.',
      },
      {
        type: 'h2',
        text: 'A Cancellation Letter Template',
      },
      {
        type: 'p',
        text: 'If you mail it, keep the letter short and include everything the club needs to identify your account:',
      },
      {
        type: 'p',
        text: 'To Whom It May Concern: I am writing to cancel my Planet Fitness membership, effective immediately. My name is [full name], my membership number is [number], and the account is registered at [address / phone / email]. Please confirm the cancellation in writing and stop all future charges, including the annual fee. Signed, [signature and date].',
      },
      {
        type: 'h2',
        text: 'Timing: The 10th of the Month and the Annual Fee',
      },
      {
        type: 'p',
        text: 'Two dates decide how much you pay on the way out:',
      },
      {
        type: 'ul',
        items: [
          'Cancel before the 10th of the month to avoid being billed for the following month - cancellations after the billing date usually let one more charge through',
          'The annual fee (sometimes called the annual maintenance fee) typically posts once a year, often in the first quarter. If yours is due soon, cancel before it hits or you will pay for a full year you are leaving',
        ],
      },
      {
        type: 'h2',
        text: 'If They Keep Charging You',
      },
      {
        type: 'p',
        text: 'If dues keep coming after you cancelled correctly, you have proof - the signed form or the certified-mail receipt. Dispute the charges with your bank or card issuer and attach that proof. Many auto-renewal laws require a gym to honour a written cancellation, so document everything.',
      },
      {
        type: 'h2',
        text: 'Catch the Next Sneaky Renewal Early',
      },
      {
        type: 'p',
        text: 'Gym memberships and their once-a-year fees are exactly the kind of charge that hides in plain sight - too small monthly to notice, large enough annually to matter. Keeping a live list of every recurring charge with its renewal date is how the annual fee stops being a surprise.',
      },
      {
        type: 'p',
        text: 'For the services that do have a real cancel page - which is most of them - Quick Unsubscribe takes you straight to it, so Planet Fitness stays the exception rather than the standard you brace for.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking - no bank access required. Pro finds forgotten recurring charges in your inbox and reminds you before each renewal, including annual ones, as a one-time payment rather than a monthly fee.',
      },
    ],
  },
  {
    slug: 'ftc-click-to-cancel-rule-2026',
    title: 'The FTC "Click-to-Cancel" rule in 2026: what protects you now',
    description:
      'The FTC’s Click-to-Cancel rule was finalized, struck down, and revived. Here is where it actually stands in 2026 and how to force a cancellation a company is stalling.',
    publishedAt: '2026-07-26',
    source: 'FTC',
    sourceUrl:
      'https://www.ftc.gov/news-events/news/press-releases/2024/10/federal-trade-commission-announces-final-click-cancel-rule-making-it-easier-consumers-end-recurring',
    readingTimeMin: 6,
    intro:
      'The idea behind Click-to-Cancel is simple and hard to argue with: cancelling should be as easy as signing up. The rule to enforce that was finalized, then struck down before it ever took effect, and is now being revived. Here is what it means for you in 2026 - and what actually protects you today.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'how-much-americans-spend-on-subscriptions',
      'car-feature-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: The FTC finalized the Click-to-Cancel rule in October 2024, but a federal appeals court vacated it in 2025 before enforcement began, on procedural grounds. In March 2026 the FTC began the process of reviving it. It is not currently enforceable as a standalone rule - but ROSCA, the FTC’s deceptive-practices authority, and state auto-renewal laws still protect you.',
      },
      {
        type: 'p',
        text: 'You have almost certainly hit the pattern the rule was written to kill: a service you signed up for in two clicks that suddenly requires a phone call, a retention agent, and a "call during business hours" wall to leave. Click-to-Cancel was the federal answer to that. Its bumpy path tells you a lot about the state of subscription regulation.',
      },
      {
        type: 'h2',
        text: 'What the Rule Was Meant to Do',
      },
      {
        type: 'p',
        text: 'The core principle was symmetry: cancelling had to be at least as easy as signing up. If you could subscribe online without talking to anyone, you had to be able to cancel the same way - no phone-only cancellation, no maze of retention screens, no hidden cancel page. It also required clear consent and upfront disclosure of terms before billing.',
      },
      {
        type: 'h2',
        text: 'The Timeline: Finalized, Vacated, Revived',
      },
      {
        type: 'ul',
        items: [
          'October 2024: the FTC finalized the Click-to-Cancel rule (an amendment to the Negative Option Rule)',
          '2025: a federal appeals court vacated the rule before enforcement began, finding the FTC had skipped a required economic-impact analysis - a procedural defect, not a rejection of the idea',
          'March 2026: the FTC issued an Advance Notice of Proposed Rulemaking to revive the rule, restarting the process with the analysis the court demanded',
        ],
      },
      {
        type: 'callout',
        text: 'The rule falling was procedural, not philosophical. The court did not say companies are allowed to trap you - it said the FTC had to show its economic homework first.',
      },
      {
        type: 'h2',
        text: 'What Protects You Right Now',
      },
      {
        type: 'p',
        text: 'Even without Click-to-Cancel in force, you are not unprotected. Several overlapping rules still apply:',
      },
      {
        type: 'ul',
        items: [
          'ROSCA (the Restore Online Shoppers’ Confidence Act) governs online negative-option sign-ups and requires clear disclosure and simple cancellation mechanisms',
          'The FTC’s general authority over unfair and deceptive practices still reaches deliberately obstructive cancellation flows',
          'State automatic-renewal laws - California, New York, and Illinois among them - are in some cases stricter than the federal rule and require easy online cancellation',
        ],
      },
      {
        type: 'h2',
        text: 'How to Force a Cancellation a Company Is Stalling',
      },
      {
        type: 'p',
        text: 'If a service is making it deliberately hard to leave, put it in writing. A formal cancellation request that cites the relevant rules tends to move faster than a support-chat loop:',
      },
      {
        type: 'ol',
        items: [
          'Email a clear, dated cancellation request that references the FTC Negative Option Rule (16 CFR Part 425) and your state auto-renewal law',
          'State that you are revoking authorization for any future charges as of that date',
          'Keep every reply and a copy of your request',
          'If charges continue, dispute them with your bank or card issuer and attach your written cancellation',
          'Report the company to the FTC at reportfraud.ftc.gov and your state attorney general',
        ],
      },
      {
        type: 'h2',
        text: 'The Real Lesson',
      },
      {
        type: 'p',
        text: 'The takeaway is not that the law will save you on a predictable schedule - it is that "easy to cancel" is still not guaranteed, so the burden of noticing stays with you. The subscriptions that cost you the most are the ones you forgot you had, because you never reach the cancellation flow at all. Regulation cannot fix what you are not tracking.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking - no bank access required. Pro scans your inbox to surface the subscriptions you have forgotten and reminds you before each renewal, as a one-time payment. The best defence against a hard cancellation is knowing the charge exists before it renews.',
      },
    ],
  },
  {
    slug: 'how-to-find-hidden-subscriptions-bank-statement',
    title: 'How to find hidden subscriptions on your bank statement',
    description:
      'A 30-minute audit to uncover every hidden recurring charge - how to read a statement, decode cryptic labels like APPLE.COM/BILL and GOOGLE *, and check every app store.',
    publishedAt: '2026-07-26',
    readingTimeMin: 6,
    intro:
      'The subscriptions draining the most money are the ones you never see, because they hide behind cryptic statement labels and app-store billing. This is a straightforward audit that surfaces all of them in about half an hour.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    relatedSlugs: [
      'how-to-find-all-your-subscriptions',
      'how-to-cancel-subscriptions',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Review at least three months of bank and card statements, sorted by merchant, to spot repeating charges - then check 12 months for annual renewals. Decode cryptic labels: APPLE.COM/BILL is an App Store subscription, GOOGLE * is a Play Store one. Then audit each billing hub directly: Apple Subscriptions, Google Play, PayPal automatic payments, and Amazon Memberships.',
      },
      {
        type: 'p',
        text: 'Most people underestimate their subscription count by a wide margin, and the reason is structural: a big share of recurring charges never appear under a recognisable name. They are billed through an intermediary and land on your statement as a code. Here is how to find every one.',
      },
      {
        type: 'h2',
        text: 'Step 1: Pull Three Months, Sorted by Merchant',
      },
      {
        type: 'p',
        text: 'Download at least three months of checking-account and credit-card statements. If your banking app lets you sort or group by merchant instead of date, use it - recurring charges cluster together and become obvious. Look for repeated names and identical amounts, especially the round prices subscriptions favour ($4.99, $9.99, $14.99).',
      },
      {
        type: 'callout',
        text: 'Then repeat the scan across a full 12 months. Annual subscriptions only charge once a year, so a three-month window misses them entirely - and annual charges are usually the biggest.',
      },
      {
        type: 'h2',
        text: 'Step 2: Decode the Cryptic Labels',
      },
      {
        type: 'p',
        text: 'App-store and platform billing hides the real service behind a generic code. These are the ones that catch people out:',
      },
      {
        type: 'ul',
        items: [
          'APPLE.COM/BILL - an App Store or Apple subscription (Apple Music, iCloud+, or any app billed through Apple). The service name is not on the statement',
          'GOOGLE *<name> - a Google Play charge; "GOOGLE *YouTube" is YouTube Premium, "GOOGLE *Google Storage" is Google One',
          'PAYPAL *<name> - billed via a PayPal automatic-payment agreement',
          'Unfamiliar company names - some services bill under a parent company or payment processor you will not recognise; search the name online',
        ],
      },
      {
        type: 'h2',
        text: 'Step 3: Audit Each Billing Hub Directly',
      },
      {
        type: 'p',
        text: 'A statement tells you money left your account, but not always what for. Go to the source and read the actual subscription list in each hub:',
      },
      {
        type: 'ul',
        items: [
          'Apple: Settings → tap your name → Subscriptions (shows active and recently expired)',
          'Android / Google: Play Store → Profile → Payments & subscriptions → Manage subscriptions',
          'PayPal: paypal.com → Settings → Payments → Manage automatic payments',
          'Amazon: Account → Memberships & Subscriptions',
        ],
      },
      {
        type: 'h2',
        text: 'Step 4: Write Down the Full List',
      },
      {
        type: 'p',
        text: 'For every charge you confirm, record the service name, the amount, the billing cycle, and the next renewal date. That list is the whole point of the exercise - it turns a pile of statement lines into a clear picture of what you actually pay each month and year.',
      },
      {
        type: 'h2',
        text: 'The Faster Way',
      },
      {
        type: 'p',
        text: 'The manual audit works, but it is slow and easy to abandon halfway. Your email inbox already holds a receipt or renewal notice for almost every subscription, which makes it a more complete record than any single statement. A tool that scans your inbox can assemble the same list in minutes - without ever touching your bank account, which is the part privacy-conscious people care about.',
      },
      {
        type: 'callout',
        text: 'Suprascribe finds subscriptions by scanning your email, not your bank - no Plaid, no financial-account access. It is free for manual tracking; the inbox auto-discovery that surfaces hidden charges is a one-time Pro upgrade.',
      },
    ],
  },
  {
    slug: 'best-subscription-tracker-app',
    title: 'The best subscription tracker apps in 2026 (honestly compared)',
    description:
      'A straight comparison of the best subscription tracker apps in 2026 - which need bank access, which charge monthly, and which are actually free. Picks for privacy, automation, and budgeting.',
    publishedAt: '2026-07-26',
    readingTimeMin: 8,
    intro:
      'Every "best subscription tracker" list is written by one of the apps on it. Here is the honest version: what each tool is genuinely good at, what it costs, and the trade-off nobody mentions - whether it demands access to your bank account.',
    faqQuestions: [
      'What is the best free app to track subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    relatedSlugs: [
      'best-free-subscription-manager',
      'how-to-find-all-your-subscriptions',
      'subscription-fatigue',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      {
        href: '/subscription-tracker-without-bank-account',
        label: 'Tracker With No Bank Linking',
      },
      { href: '/open-source-subscription-tracker', label: 'Open Source Subscription Tracker' },
      { href: '/compare', label: 'Compare All Trackers' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: If you want automatic discovery without handing over your bank login, Suprascribe (email scanning, unlimited free tier, one-time Pro) is the pick. Rocket Money and PocketGuard are the strongest bank-linked options if you also want budgeting. Bobby and Subby are the simplest fully manual trackers. YNAB is overkill unless you want full budgeting.',
      },
      {
        type: 'p',
        text: 'Subscription trackers split into three camps, and which camp you want decides everything. Bank-linked apps connect to your accounts via Plaid and detect charges automatically - powerful, but they read your entire transaction history and usually charge monthly. Email-based tools find the same subscriptions from your inbox without touching your bank. Manual trackers make you type each one in, trading effort for total privacy.',
      },
      {
        type: 'h2',
        text: 'How We Compared Them',
      },
      {
        type: 'p',
        text: 'For each app the three questions that actually matter: Does it require bank account access? Is it a one-time cost or a recurring fee? And how much work is it to get a complete list? Everything else - charts, calendars, categories - is secondary to those.',
      },
      {
        type: 'h2',
        text: '1. Suprascribe - Best for automatic discovery without bank access',
      },
      {
        type: 'p',
        text: 'Suprascribe finds subscriptions by scanning your Gmail, Outlook, or iCloud inbox for receipts and renewal notices - the same automatic result as a bank-linked app, but it never touches your financial accounts. The free tier is genuinely unlimited (no cap on subscriptions, no credit card), and the Pro upgrade that adds email auto-discovery, renewal reminders, and a calendar view is a one-time payment rather than a subscription. It is also open source, so the privacy claims are verifiable.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want auto-discovery but refuse to link a bank account',
          'Bank access: never - email scanning or manual entry only',
          'Cost: free unlimited tier; Pro is a one-time purchase, not recurring',
          'Watch out for: auto-discovery needs an email connection (or add subscriptions manually)',
        ],
      },
      {
        type: 'h2',
        text: '2. Rocket Money - Best bank-linked option with bill negotiation',
      },
      {
        type: 'p',
        text: 'Rocket Money detects subscriptions automatically from your bank feed and will even negotiate bills or cancel on your behalf. It genuinely works. The trade-offs are the reason people look for alternatives: it needs full transaction-history access via Plaid, it is a broad finance app rather than a focused tracker, and the premium tier is a recurring monthly fee.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want budgeting and bill negotiation alongside tracking',
          'Bank access: required via Plaid',
          'Cost: limited free tier; premium is a monthly subscription',
          'Watch out for: it reads all your transactions, not just subscriptions',
        ],
      },
      {
        type: 'h2',
        text: '3. PocketGuard - Best all-in-one budgeting with tracking built in',
      },
      {
        type: 'p',
        text: 'PocketGuard is a full budgeting app on iOS, Android, and web that auto-detects subscriptions from linked accounts. It is the most feature-rich of the bank-linked tools and offers a lifetime option alongside its subscription plans. But subscription tracking is a side feature of a bigger product, and like Rocket Money it needs Plaid or Finicity access to your accounts.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want a complete budgeting app, not just a tracker',
          'Bank access: required',
          'Cost: monthly or annual, with a lifetime option (~$150)',
          'Watch out for: subscription tracking is secondary to budgeting',
        ],
      },
      {
        type: 'h2',
        text: '4. YNAB - Best for serious budgeters (overkill for tracking alone)',
      },
      {
        type: 'p',
        text: 'YNAB is a powerful budgeting system with a devoted community. If you want to manage every dollar, it is excellent. But if your only goal is tracking subscriptions, you are paying about $109 a year and learning a whole methodology to use a fraction of the tool.',
      },
      {
        type: 'ul',
        items: [
          'Best for: committed zero-based budgeters',
          'Bank access: required for automatic import',
          'Cost: ~$14.99/month or ~$109/year, no lifetime option',
          'Watch out for: significant overkill if you just want subscriptions',
        ],
      },
      {
        type: 'h2',
        text: '5. Bobby - Best simple manual tracker on iPhone',
      },
      {
        type: 'p',
        text: 'Bobby is a long-running, beautifully designed iOS tracker with Apple Watch support and a cheap one-time unlock. It is fully manual and Apple-only, so it is ideal if you live in the Apple ecosystem and do not mind entering subscriptions yourself - but the free tier caps at five subscriptions.',
      },
      {
        type: 'ul',
        items: [
          'Best for: iPhone users who want a polished, private manual tracker',
          'Bank access: none',
          'Cost: free up to 5 subscriptions; small one-time unlock for unlimited',
          'Watch out for: iOS-only, and every subscription is entered by hand',
        ],
      },
      {
        type: 'h2',
        text: '6. Subby - Best free, no-frills manual tracker',
      },
      {
        type: 'p',
        text: 'Subby offers a genuinely unlimited free tier (ad-supported) with a clean, simple interface. It is honest and cheap. The limits: it is mobile-only and fully manual, so you do the work of finding and entering every subscription.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want an unlimited free manual tracker and do not mind ads',
          'Bank access: none',
          'Cost: free (ad-supported); small one-time purchase removes ads',
          'Watch out for: mobile-only, manual entry, ads on the free version',
        ],
      },
      {
        type: 'h2',
        text: '7. Unsubby - Best for hands-off cancellation letters',
      },
      {
        type: 'p',
        text: 'Unsubby pairs subscription detection with a service that mails cancellation letters to providers on your behalf - useful for the services that make leaving deliberately hard. But it detects subscriptions through a Plaid bank connection, caps the free tier at four, and charges a recurring monthly fee.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want someone else to send cancellation letters',
          'Bank access: required via Plaid',
          'Cost: free up to 4 subscriptions; premium is ~$12.95/month',
          'Watch out for: bank linking plus a recurring fee to cancel recurring fees',
        ],
      },
      {
        type: 'h2',
        text: 'How to Choose',
      },
      {
        type: 'p',
        text: 'Start with the bank-access question, because it eliminates half the field instantly. If you are comfortable linking your bank and want budgeting too, Rocket Money or PocketGuard are the strongest. If you want the automatic list without exposing your transaction history, an email-based tracker like Suprascribe gives you the same outcome with far less access. If you want maximum privacy and do not mind manual entry, Bobby (iPhone) or Subby (Android) are clean choices.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for unlimited manual tracking with no bank access required, and the Pro upgrade that auto-discovers subscriptions from your inbox is a one-time payment. See the full side-by-side comparisons against Rocket Money, YNAB, Bobby, and the rest on the compare page.',
      },
    ],
  },
  {
    slug: 'subscription-tracker-spreadsheet-template',
    title: 'A free subscription tracker spreadsheet template (and when to upgrade)',
    description:
      'A ready-to-copy subscription tracker spreadsheet layout for Google Sheets or Excel - the exact columns to use, how to total annual cost, and the point where an app saves you the upkeep.',
    publishedAt: '2026-07-26',
    readingTimeMin: 6,
    intro:
      'A spreadsheet is the most private way to track subscriptions - nothing is linked, nothing is shared. Here is a template you can rebuild in two minutes, the columns that actually matter, and an honest look at where a spreadsheet stops being enough.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    relatedSlugs: [
      'how-to-find-all-your-subscriptions',
      'best-free-subscription-manager',
      'how-to-find-hidden-subscriptions-bank-statement',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      {
        href: '/subscription-tracker-without-bank-account',
        label: 'Tracker With No Bank Linking',
      },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Build a subscription tracker in Google Sheets or Excel with these columns: Service, Cost, Billing Cycle, Renewal Date, Category, Payment Method, and Annual Cost. Use a formula to normalize every cost to a yearly figure, then sum it. A spreadsheet is free and private but has no reminders - which is the one thing that actually stops forgotten charges.',
      },
      {
        type: 'p',
        text: 'Plenty of people track subscriptions in a spreadsheet, and for good reason: it costs nothing, links to nothing, and you control every field. The trick is setting up the right columns so the sheet answers the only two questions that matter - how much am I really spending a year, and what renews next?',
      },
      {
        type: 'h2',
        text: 'The Columns to Use',
      },
      {
        type: 'p',
        text: 'Keep it to the fields that drive a decision. Anything more and you stop maintaining it:',
      },
      {
        type: 'ul',
        items: [
          'Service - the name of the subscription (Netflix, Spotify, iCloud+)',
          'Cost - the amount charged each cycle',
          'Billing Cycle - monthly, annual, quarterly, or weekly',
          'Renewal Date - the next date it charges',
          'Category - streaming, software, fitness, news, etc., so you can spot overlap',
          'Payment Method - card, PayPal, App Store, so you know where to cancel',
          'Annual Cost - a calculated column that normalizes everything to a yearly figure',
        ],
      },
      {
        type: 'h2',
        text: 'The One Formula That Matters',
      },
      {
        type: 'p',
        text: 'The Annual Cost column is what turns a list into insight. Normalize every subscription to a yearly number so a $15/month service and a $120/year service are directly comparable. In Google Sheets or Excel, with Cost in column B and Billing Cycle in column C, put this in the Annual Cost column:',
      },
      {
        type: 'callout',
        text: '=IF(C2="Monthly", B2*12, IF(C2="Annual", B2, IF(C2="Quarterly", B2*4, IF(C2="Weekly", B2*52, B2))))',
      },
      {
        type: 'p',
        text: 'Then total the Annual Cost column with =SUM(...) at the bottom. That single number - your true yearly subscription spend - is almost always higher than people expect, because monthly charges hide how much they add up to over a year.',
      },
      {
        type: 'h2',
        text: 'Make Renewals Visible',
      },
      {
        type: 'p',
        text: 'Add conditional formatting on the Renewal Date column to highlight anything due in the next seven days. It is the closest a spreadsheet gets to a reminder - but you only see it when you happen to open the sheet, which is the catch.',
      },
      {
        type: 'h2',
        text: 'Where a Spreadsheet Falls Short',
      },
      {
        type: 'p',
        text: 'A spreadsheet is excellent at holding data and terrible at three things that actually stop wasted money:',
      },
      {
        type: 'ul',
        items: [
          'No reminders - it cannot ping you before a renewal; you have to remember to look',
          'No discovery - it only contains what you manually found and typed, so anything you forgot stays invisible',
          'Upkeep - every new signup, price rise, or cancellation is a manual edit, and sheets drift out of date fast',
        ],
      },
      {
        type: 'p',
        text: 'The discovery gap is the big one. The subscriptions costing you the most are the ones you forgot about - and a spreadsheet, by definition, never contains those.',
      },
      {
        type: 'h2',
        text: 'When to Move From Sheet to App',
      },
      {
        type: 'p',
        text: 'If you like the control of a spreadsheet but want the parts it cannot do - automatic discovery of forgotten subscriptions and reminders before each renewal - a dedicated tracker is the upgrade. Suprascribe keeps the spreadsheet virtues that matter: it needs no bank access, and the free tier lets you add unlimited subscriptions by hand just like a sheet. The difference is that it can also scan your inbox to find the ones you would never have added, and it actually reminds you before a charge lands.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for unlimited manual tracking - a spreadsheet with reminders and a real dashboard, no bank access required. Pro adds inbox auto-discovery and renewal reminders as a one-time payment.',
      },
    ],
  },
  {
    slug: 'how-to-track-company-software-subscriptions',
    title: "How to track your company's software subscriptions in 2026",
    description:
      "A practical way to track your company's SaaS and software subscriptions - surface shadow IT, kill duplicate tools, and catch renewals, using an open source tool with no bank access and a one-time cost instead of a per-seat SaaS bill.",
    publishedAt: '2026-07-26',
    readingTimeMin: 7,
    intro:
      'Every growing company ends up paying for software nobody remembers signing up for - duplicate tools, seats for people who left, annual renewals that sail through unnoticed. Here is how to get a complete picture of your company’s subscriptions without buying yet another per-seat SaaS platform to do it.',
    faqQuestions: ['Is Suprascribe open source?', 'Is Pro really a one-time payment?'],
    relatedSlugs: [
      'best-subscription-tracker-app',
      'best-free-subscription-manager',
      'subscription-fatigue',
    ],
    relatedPageLinks: [
      { href: '/open-source-subscription-tracker', label: 'Open Source Subscription Tracker' },
      {
        href: '/subscription-tracker-without-bank-account',
        label: 'Tracker With No Bank Linking',
      },
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Pull every software charge from your finance exports and shared billing inboxes, consolidate them into one list with owner, cost, renewal date, and seats, then review quarterly for duplicates and unused seats. Track it in an open source tool with a one-time cost rather than a per-seat SaaS spend platform - you should not pay a recurring subscription to manage your subscriptions.',
      },
      {
        type: 'p',
        text: 'SaaS sprawl is now a normal part of running a company. Teams sign up for tools on a card, trials convert to annual plans, and departments buy overlapping products without knowing it. The result is a software bill that grows faster than headcount and a renewal calendar nobody owns. The fix is not complicated - it is a repeatable process plus one place to keep the list.',
      },
      {
        type: 'h2',
        text: 'Step 1: Find Every Software Charge',
      },
      {
        type: 'p',
        text: 'Your subscriptions are spread across more places than any single report shows. Pull from all of them:',
      },
      {
        type: 'ul',
        items: [
          'Accounting/finance exports (Xero, QuickBooks, your ERP) - filter for recurring software vendors',
          'Corporate card and expense-tool statements, including personal-card reimbursements for tools',
          'Shared billing inboxes - receipts and renewal notices land here for most SaaS',
          'App-store and marketplace billing (Google Workspace Marketplace, Apple, cloud marketplaces)',
          'Department leads - ask each team to list the tools they actually use',
        ],
      },
      {
        type: 'callout',
        text: 'The billing inbox is the highest-signal source. Almost every SaaS tool emails a receipt or renewal notice, which catches the tools that never show up cleanly on a card statement.',
      },
      {
        type: 'h2',
        text: 'Step 2: Consolidate Into One List',
      },
      {
        type: 'p',
        text: 'A pile of charges is not a subscription inventory. For each tool, capture the fields that drive decisions:',
      },
      {
        type: 'ul',
        items: [
          'Tool and vendor',
          'Owner - the person or team responsible for it',
          'Cost and billing cycle (monthly vs annual)',
          'Seats - how many licenses you pay for vs how many are active',
          'Renewal date - the single most-missed field',
          'Category - so overlap between tools becomes visible',
        ],
      },
      {
        type: 'h2',
        text: 'Step 3: Cut the Obvious Waste',
      },
      {
        type: 'p',
        text: 'With everything in one view, the waste is usually easy to spot:',
      },
      {
        type: 'ul',
        items: [
          'Duplicate tools - two products doing the same job in different teams',
          'Empty seats - licenses for people who left or never onboarded',
          'Zombie subscriptions - tools from a project that ended but still renew',
          'Annual-vs-monthly - tools you will keep are usually cheaper billed annually',
        ],
      },
      {
        type: 'h2',
        text: 'Step 4: Own the Renewal Calendar',
      },
      {
        type: 'p',
        text: 'Most wasted SaaS spend is not a bad purchase - it is a renewal that auto-charged before anyone reviewed it. Every subscription needs a renewal date and a reminder a couple of weeks ahead, so each renewal is a decision instead of a surprise line on the statement.',
      },
      {
        type: 'h2',
        text: 'Why Open Source and One-Time Payment Matter Here',
      },
      {
        type: 'p',
        text: 'The tools built for this - SaaS spend-management platforms - almost all charge per seat or per tracked subscription, monthly. You end up paying a recurring bill to control your recurring bills, and the tool that holds your vendor and spend data is a closed-source black box.',
      },
      {
        type: 'p',
        text: 'An open source tracker changes both problems. Because the code is public and self-hostable, your IT and security teams can verify exactly how data is handled and keep the whole inventory on infrastructure you control - which matters when the data is your company’s vendor and spend map. And a one-time cost means the tracker itself never becomes another line on the renewal calendar you are trying to shrink.',
      },
      {
        type: 'ul',
        items: [
          'Open source: auditable by your own team, self-hostable, no vendor lock-in',
          'One-time payment: no per-seat pricing, no recurring fee to manage recurring fees',
          'No bank access: discovers subscriptions from billing emails, not by connecting company accounts',
        ],
      },
      {
        type: 'p',
        text: 'Suprascribe fits this exactly. It finds subscriptions by scanning a billing inbox rather than linking financial accounts, the full source is on GitHub so you can audit or self-host it, and Pro is a one-time purchase instead of a per-seat subscription. Start with a manual inventory on the free tier, then let inbox discovery keep it current.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is open source and free for unlimited manual tracking - no bank access, no per-seat pricing. Pro adds inbox auto-discovery and renewal reminders as a one-time payment, and you can self-host the whole thing if you want full control of the data.',
      },
    ],
  },
  {
    slug: 'cancel-chatgpt-subscription',
    title: 'Cancel ChatGPT: Plus, Pro, and Go on Web, iPhone, and Android',
    description:
      'Cancel a ChatGPT subscription on the platform you actually subscribed on - chatgpt.com, Apple, or Google Play - keep access until the period ends, and know when a refund is possible.',
    publishedAt: '2026-07-29',
    readingTimeMin: 6,
    intro:
      'Most people who fail to cancel ChatGPT do everything right in the wrong place. OpenAI, Apple, and Google each bill separately, and only the one that took your money can stop taking it. Here is how to work out which one you are dealing with, and cancel there.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do renewal reminders work?',
    ],
    relatedSlugs: [
      'cancel-subscriptions-iphone',
      'cancel-subscriptions-android',
      'how-to-cancel-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Cancel where you subscribed. Signed up on chatgpt.com? Profile icon → Settings → Billing → Cancel. Signed up in the iOS app? Settings → [your name] → Subscriptions → ChatGPT → Cancel Subscription. Signed up in the Android app? Play Store → Subscriptions → Cancel subscription. Cancel at least 24 hours before your next billing date, and keep access until the current period ends.',
      },
      {
        type: 'h2',
        text: 'You Must Cancel Where You Subscribed',
      },
      {
        type: 'p',
        text: 'This single rule explains almost every failed ChatGPT cancellation. If you subscribed inside the ChatGPT iOS app, the subscription lives under your Apple Account, not your OpenAI account - Apple is the merchant, Apple takes the payment, and only Apple can stop it. The same is true of a subscription started through Google Play. OpenAI states it plainly in the other direction too: a subscription created on chatgpt.com must be cancelled on chatgpt.com.',
      },
      {
        type: 'p',
        text: 'The practical consequence is that clicking around in ChatGPT settings looking for a cancel button you cannot find is not a bug. It means your billing is somewhere else.',
      },
      {
        type: 'callout',
        text: 'Deleting the ChatGPT app does not cancel anything. Neither does signing out. An app-store subscription keeps billing until it is cancelled at the store, whether the app is installed or not.',
      },
      {
        type: 'h2',
        text: 'How to Tell Which One You Are On',
      },
      {
        type: 'ul',
        items: [
          'Search your email for a receipt. A receipt from Apple or an invoice from Apple means Apple billing; a Google Play order confirmation means Google billing; a receipt from OpenAI or Stripe means direct billing',
          'Check your card or bank statement - the merchant name on the charge tells you the same thing',
          'Open Settings → Subscriptions on iPhone, or Subscriptions in the Play Store on Android. If ChatGPT is listed there, that is where it is billed',
        ],
      },
      {
        type: 'h2',
        text: 'Cancel ChatGPT on the Web (chatgpt.com)',
      },
      {
        type: 'ol',
        items: [
          'Log in to ChatGPT with the account that is being charged',
          'Select your profile icon, then select "Settings"',
          'Select "Billing"',
          'Under "Cancel plan", select "Cancel"',
          'Confirm, and keep the confirmation email',
        ],
      },
      {
        type: 'h2',
        text: 'Cancel ChatGPT on iPhone (Apple Billing)',
      },
      {
        type: 'ol',
        items: [
          'Open the Settings app',
          'Tap your name at the top (this is your Apple Account)',
          'Tap "Subscriptions"',
          'Tap ChatGPT in the list',
          'Tap "Cancel Subscription" and confirm',
        ],
        links: [{ text: 'Tap "Subscriptions"', href: '/blog/cancel-subscriptions-iphone' }],
      },
      {
        type: 'h2',
        text: 'Cancel ChatGPT on Android (Google Play Billing)',
      },
      {
        type: 'ol',
        items: [
          'Open the Play Store signed in with the same Google account you used to subscribe',
          'Go to Subscriptions',
          'Select ChatGPT',
          'Tap "Cancel subscription" and follow the instructions',
        ],
        links: [{ text: 'Go to Subscriptions', href: '/blog/cancel-subscriptions-android' }],
      },
      {
        type: 'p',
        text: 'You can do the same thing from a computer on the Google Play website while signed in with that account - Manage, then Cancel subscription.',
      },
      {
        type: 'h2',
        text: 'Timing: Cancel 24 Hours Before the Renewal',
      },
      {
        type: 'p',
        text: 'Cancellation takes effect the day after your next billing date, so you keep Plus or Pro features until the end of the cycle you have already paid for. To avoid being charged for the next period, OpenAI advises cancelling at least 24 hours before your next billing date. Cancelling on the morning of the renewal is cutting it too fine.',
      },
      {
        type: 'h2',
        text: 'Can You Get a Refund?',
      },
      {
        type: 'p',
        text: 'Subscription fees are generally non-refundable, but there are two real exceptions worth knowing:',
      },
      {
        type: 'ul',
        items: [
          'EU, UK, and Turkey: you are eligible for a prorated refund if you cancel within 14 days of purchase',
          'Accidental purchases: generally eligible for a refund if you make contact within 14 days of the charge',
        ],
      },
      {
        type: 'p',
        text: 'To request one, log in to help.openai.com with the same OpenAI account that was charged, open the chat widget at the bottom right, and ask for a refund. The system shows a summary of your eligibility before connecting you to an agent, and approved refunds are processed within 5 to 7 business days. If Apple or Google took the payment, the refund request goes to them instead, not to OpenAI.',
      },
      {
        type: 'callout',
        text: 'Deleting your ChatGPT account does automatically cancel a chatgpt.com subscription - but it is a destructive fix for a billing problem, and it does nothing to an Apple- or Google-billed subscription. Cancel properly first.',
      },
      {
        type: 'h2',
        text: 'The Wider Problem: AI Subscriptions Multiply Quietly',
      },
      {
        type: 'p',
        text: 'ChatGPT is rarely the only AI tool on the card. Between assistants, image generators, transcription tools, and writing add-ons, most people who pay for one pay for three - each one signed up for during a busy week and each one renewing on a different date. They are also unusually easy to forget, because there is no physical delivery and no monthly statement to prompt a review.',
      },
      {
        type: 'p',
        text: 'A list of every recurring charge with its renewal date fixes that. Quick Unsubscribe then takes you straight to the cancel page for each service, so the decision to keep or drop a tool is a thirty-second job rather than a research project.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking - no bank access required. Pro scans your inbox to surface the AI tools and trials you have forgotten and reminds you before each renewal, as a one-time payment rather than another monthly fee.',
      },
    ],
  },
  {
    slug: 'cancel-subscriptions-iphone',
    title: 'Cancel Subscriptions on iPhone: Every App Store Subscription in One Place',
    description:
      'Find and cancel every App Store subscription on your iPhone, plus the ones Apple never shows you - the recurring charges billed outside the App Store entirely.',
    publishedAt: '2026-07-29',
    readingTimeMin: 6,
    intro:
      'Your iPhone has a single screen listing every subscription Apple bills you for. It is genuinely good - and it is also only half the picture, because anything charged directly to your card never appears there at all.',
    faqQuestions: [
      'How do I cancel a subscription on my iPhone?',
      'How do I find all my subscriptions?',
    ],
    relatedSlugs: [
      'cancel-subscriptions-android',
      'cancel-chatgpt-subscription',
      'how-to-cancel-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Settings → [your name] → Subscriptions → tap the subscription → "Cancel Subscription". If there is no Cancel button, it is already cancelled. Cancel free trials at least 24 hours before they end. And remember: this screen only shows subscriptions billed through Apple - anything charged straight to your card is invisible here.',
      },
      {
        type: 'h2',
        text: 'How to Cancel a Subscription on iPhone',
      },
      {
        type: 'ol',
        items: [
          'Open the Settings app',
          'Tap your name at the top of the screen',
          'Tap "Subscriptions"',
          'Tap the subscription you want to end',
          'Tap "Cancel Subscription" - you may need to scroll down to reach it',
          'Confirm. Some bundles show "Cancel All Services" instead',
        ],
      },
      {
        type: 'p',
        text: 'One naming note that trips people up on older guides: from iOS 18 Apple renamed "Apple ID" to "Apple Account" throughout Settings. The path itself did not change - it is still your name at the top of Settings, then Subscriptions - but the label you are looking for may not match what an older article describes.',
      },
      {
        type: 'h2',
        text: 'When There Is No Cancel Button',
      },
      {
        type: 'p',
        text: 'If you open a subscription and there is no "Cancel" or "Cancel Subscription" button, the subscription is already cancelled. An expiry date shown in red text means the same thing: it will run to the end of the paid period and then stop. Nothing further is needed.',
      },
      {
        type: 'h2',
        text: 'When the Subscription Is Not in the List at All',
      },
      {
        type: 'p',
        text: 'Two things cause this, and they need different fixes.',
      },
      {
        type: 'p',
        text: 'The first is that it is on a different Apple Account. Plenty of people have an old personal account and a newer one, or share a device history with a family member. Search your email for the words "receipt from Apple" or "invoice from Apple" - the receipt shows which Apple Account was charged. Sign in with that one to cancel. If you need the subscription moved to a different Apple Account, only Apple Support can do it.',
      },
      {
        type: 'p',
        text: 'The second is that Apple was never the merchant. That is the bigger problem, and it is the subject of the rest of this guide.',
      },
      {
        type: 'h2',
        text: 'Free Trials: The 24-Hour Rule',
      },
      {
        type: 'p',
        text: 'If you started a free or discounted trial and do not want it to convert, cancel at least 24 hours before the trial ends. Cancelling inside that final day is unreliable - the renewal may already be in flight. You keep access for the rest of the trial period either way, so there is no benefit to waiting.',
      },
      {
        type: 'h2',
        text: 'What the Subscriptions Screen Does Not Show You',
      },
      {
        type: 'p',
        text: 'Settings → Subscriptions lists only what is billed through Apple - purchases made inside an app on your device. It is a complete list of a subset. Everything below is billed directly by the company and will never appear on that screen:',
      },
      {
        type: 'ul',
        items: [
          'Anything you signed up for on a website in a browser rather than in an app',
          'Software billed through Stripe, Paddle, or the company’s own checkout',
          'Gym memberships, insurance, storage units, and other direct-debit style charges',
          'Services you subscribed to on a computer and merely use on your phone',
          'Anything billed through PayPal automatic payments',
        ],
      },
      {
        type: 'p',
        text: 'For most people this second category is larger than the App Store one, and it is where the genuinely forgotten charges live - precisely because there is no equivalent screen to scroll through. Apple gives you a tidy list of the subscriptions you were always going to remember.',
      },
      {
        type: 'h2',
        text: 'How to Find the Rest',
      },
      {
        type: 'ol',
        items: [
          'Work through the four billing hubs: Settings → Subscriptions on iPhone, the Play Store if you also use Android, PayPal automatic payments, and Amazon Memberships & Subscriptions',
          'Search your email for "receipt", "invoice", "your subscription", "renewal", and "payment confirmation"',
          'Scan three months of bank and card statements for repeating amounts on repeating dates',
          'Write every charge into one list with its cost and renewal date, regardless of who bills it',
        ],
        links: [
          {
            text: 'the Play Store if you also use Android',
            href: '/blog/cancel-subscriptions-android',
          },
        ],
      },
      {
        type: 'h2',
        text: 'A Universal List Instead of Four Partial Ones',
      },
      {
        type: 'p',
        text: 'Suprascribe works from your inbox rather than an app store, which is the one place every subscription leaves a trace - App Store receipts, Google Play receipts, Stripe invoices, and direct company billing all arrive as email. That gives you a single list across all of them instead of four partial ones you have to remember to check.',
      },
      {
        type: 'p',
        text: 'Quick Unsubscribe then takes you straight to each service’s own cancel page. That matters most for the non-App-Store half, where there is no central screen to work from and finding the cancel button is the actual obstacle.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual tracking on iPhone and everywhere else - no bank access required, and it installs as an app straight from the browser. Pro adds inbox auto-discovery and renewal reminders as a one-time payment, not another monthly charge.',
      },
    ],
  },
  {
    slug: 'cancel-subscriptions-android',
    title: 'Cancel Subscriptions on Android: Google Play and Everything It Misses',
    description:
      'Cancel, pause, or restore any Google Play subscription on Android or the web - and find the recurring charges Google Play never lists.',
    publishedAt: '2026-07-29',
    readingTimeMin: 6,
    intro:
      'Google Play gives Android users something iPhone does not: the option to pause a subscription instead of killing it. It also shares the same blind spot - it only knows about the subscriptions Google itself bills.',
    faqQuestions: [
      'How do I cancel a subscription on Android?',
      'How do I find all my subscriptions?',
    ],
    relatedSlugs: [
      'cancel-subscriptions-iphone',
      'cancel-chatgpt-subscription',
      'how-to-cancel-subscriptions',
    ],
    relatedPageLinks: [{ href: '/free-subscription-tracker', label: 'Free Subscription Tracker' }],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Play Store → Subscriptions → select the subscription → "Cancel subscription". On a computer, go to subscriptions on play.google.com → "Manage" → "Cancel subscription" → pick a reason → "Continue". Uninstalling the app does not cancel anything. And Play only lists Play-billed subscriptions - direct card charges never show up there.',
      },
      {
        type: 'h2',
        text: 'How to Cancel a Subscription on Android',
      },
      {
        type: 'ol',
        items: [
          'Open the Play Store on your Android device',
          'Go to subscriptions (Profile → Payments & subscriptions → Subscriptions)',
          'Select the subscription you want to cancel',
          'Tap "Cancel subscription"',
          'Follow the instructions to confirm',
        ],
      },
      {
        type: 'h2',
        text: 'How to Cancel from a Computer',
      },
      {
        type: 'ol',
        items: [
          'On your computer, go to subscriptions in Google Play at play.google.com',
          'For the subscription you want to cancel, click "Manage"',
          'Click "Cancel subscription"',
          'In the confirmation pop-up, select a reason',
          'Click "Continue"',
        ],
      },
      {
        type: 'callout',
        text: 'Google states it directly: "When you uninstall the app, your subscription won’t cancel." Deleting an app removes it from your phone and nothing else. This is the single most common reason people keep getting charged for something they thought they had dealt with.',
      },
      {
        type: 'h2',
        text: 'What Happens After You Cancel',
      },
      {
        type: 'p',
        text: 'You keep access for the time you have already paid for. Google’s own example: buy a one-year subscription on 1 January for $10 and cancel on 1 July, and you keep access until 31 December, with no charge the following January. There is no advantage to delaying the cancellation until the end of the term - cancel as soon as you have decided, and use what is left.',
      },
      {
        type: 'h2',
        text: 'Pause Instead of Cancel',
      },
      {
        type: 'p',
        text: 'This is a genuine Android advantage over iPhone, and it is under-used. If you want a break from a service rather than a permanent exit, you can pause payments and keep your account, history, and settings intact:',
      },
      {
        type: 'ol',
        items: [
          'Go to subscriptions in Google Play',
          'Select the subscription you want to pause',
          'Tap "Manage", then "Pause payments"',
          'Set how long to pause - anywhere from one week to three months, depending on the app',
          'Tap "Confirm"',
        ],
      },
      {
        type: 'p',
        text: 'To come back early, open the subscription and tap "Resume". If you already cancelled and changed your mind, the same screen offers "Resubscribe".',
      },
      {
        type: 'h2',
        text: 'When You Cannot Find the Subscription',
      },
      {
        type: 'p',
        text: 'If a subscription is missing from the list, the usual cause is that it belongs to a different Google Account - sign in with the account that actually holds it and check again. The other cause is that Google never billed it in the first place, which is covered below.',
      },
      {
        type: 'h2',
        text: 'Refunds on Google Play',
      },
      {
        type: 'p',
        text: 'Past subscription periods generally cannot be refunded, though Google’s refund policies carve out exceptions. An unused prepaid plan is the clearest case where a refund may be available. As with everything else here, this applies only to purchases Google processed - a subscription billed directly by the company is that company’s refund policy, not Google’s.',
      },
      {
        type: 'h2',
        text: 'What Google Play Does Not Show You',
      },
      {
        type: 'p',
        text: 'The Play Store subscriptions screen lists only subscriptions billed through Google Play. Anything charged directly by the merchant is invisible there:',
      },
      {
        type: 'ul',
        items: [
          'Services you signed up for in a browser rather than through the app',
          'Software billed through Stripe, Paddle, or a company’s own checkout',
          'Anything running through PayPal automatic payments',
          'Gym memberships, insurance, and other direct-debit charges',
          'Subscriptions started on an iPhone or a work laptop and merely used on Android',
        ],
      },
      {
        type: 'p',
        text: 'This is the same structural gap Apple has. Between them, the two stores can show you two partial lists and no combined view - and the charges that get forgotten are almost always the ones outside both.',
      },
      {
        type: 'h2',
        text: 'A Universal List Instead of Two Partial Ones',
      },
      {
        type: 'p',
        text: 'Suprascribe works from your inbox rather than an app store, so Google Play receipts, App Store receipts, Stripe invoices, and direct company billing all land in the same list. It also means the same list works if you switch phones or use both platforms, because it was never tied to a store account in the first place.',
      },
      {
        type: 'p',
        text: 'Quick Unsubscribe then takes you straight to each service’s own cancel page - which matters most for the merchant-billed charges, where there is no Play Store screen to fall back on.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual tracking with no bank access required, and installs as an app on Android straight from the browser. Pro adds inbox auto-discovery and renewal reminders as a one-time payment - not another subscription to manage alongside the rest.',
      },
    ],
  },
  {
    slug: 'how-to-save-money-fast',
    title: 'How to Save Money Fast: 5 Things That Actually Work This Month',
    description:
      'Five practical ways to cut spending starting today - beginning with the recurring charges quietly leaving your account every month.',
    publishedAt: '2026-07-29',
    readingTimeMin: 7,
    intro:
      'Most saving advice asks you to change your habits and wait. These five take effect this month, and the second one is usually the biggest single win available - because it cuts money you are already spending on things you are not using.',
    faqQuestions: [
      'What is the fastest way to cut my monthly spending?',
      'How much does the average person spend on subscriptions?',
    ],
    relatedSlugs: [
      'how-to-cancel-subscriptions',
      'how-much-americans-spend-on-subscriptions',
      'subscription-fatigue',
    ],
    relatedPageLinks: [
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Put a 48-hour delay on non-essential purchases. Audit and clear out your recurring payments - the fastest single win. Renegotiate your three biggest fixed bills. Automate a transfer on payday before you can spend it. Run a 30-day no-buy on whichever category your statement says is worst.',
      },
      {
        type: 'p',
        text: 'Saving money fast means finding spending you can stop without lowering your standard of living. That rules out most budgeting advice, which asks you to want less. It rules in two things: purchases you have not made yet, and payments you are already making for nothing.',
      },
      {
        type: 'h2',
        text: '1. Put a 48-Hour Rule on Non-Essential Purchases',
      },
      {
        type: 'p',
        text: 'Add anything non-essential to a list instead of a basket, and revisit it in two days. The delay costs nothing and removes the urgency that most online checkouts are designed to create - limited-time banners, one-click purchasing, saved cards.',
      },
      {
        type: 'p',
        text: 'This works because you are not deciding to go without. You are deciding to decide later, which is much easier to stick to than a ban. A useful share of the list simply stops looking appealing by the time you come back to it, and the things that survive two days were probably worth buying.',
      },
      {
        type: 'h2',
        text: '2. Clear Out Your Recurring Payments',
      },
      {
        type: 'p',
        text: 'This is the anchor of the whole list. Every other tip on this page asks you to change a decision you have not made yet. This one recovers money already leaving your account each month for services you are not using - which means it is the only item here with a guaranteed, immediate return.',
      },
      {
        type: 'p',
        text: 'The scale is bigger than most people assume for themselves. A 2025 CNET survey conducted with YouGov put average American subscription spending at about $90 a month, with roughly $17 of that going to services people barely touch - about $205 a year for nothing. The averages are not the point; your own number is, and almost nobody knows it until they add it up.',
      },
      {
        type: 'h3',
        text: 'Step 1: Build the complete list',
      },
      {
        type: 'p',
        text: 'The reason subscriptions get forgotten is that there is no single place they all appear. You have to check four separate hubs, and even then you will miss the ones billed directly:',
      },
      {
        type: 'ul',
        items: [
          'iPhone: Settings → [your name] → Subscriptions',
          'Android: Play Store → Subscriptions',
          'PayPal: Settings → Payments → Automatic payments',
          'Amazon: Account → Memberships & Subscriptions',
        ],
        links: [
          {
            text: 'Settings → [your name] → Subscriptions',
            href: '/blog/cancel-subscriptions-iphone',
          },
          { text: 'Play Store → Subscriptions', href: '/blog/cancel-subscriptions-android' },
        ],
      },
      {
        type: 'p',
        text: 'Then pull three months of bank and card statements and look for repeating amounts on repeating dates. Three months matters because it catches quarterly charges and gives you a second look at anything you might have written off as a one-off. Search your email for "receipt", "invoice", "renewal", and "your subscription" to catch the rest.',
      },
      {
        type: 'h3',
        text: 'Step 2: Sort ruthlessly',
      },
      {
        type: 'p',
        text: 'Write every charge into one list with its cost and renewal date, then mark each one: used this month, used this year, or not used. Be honest at that third category. "I might watch it one day" is not usage. If it sat untouched for a month it will probably sit untouched for the next one - and that is exactly the $200-a-year bucket the survey identified.',
      },
      {
        type: 'h3',
        text: 'Step 3: Cancel in one sitting',
      },
      {
        type: 'p',
        text: 'Do the cancellations immediately, in one block, while the list is in front of you. Splitting it across a week is how audits die - each individual cancellation is small enough to postpone, and the ones you postpone renew.',
      },
      {
        type: 'p',
        text: 'Two things to watch as you go. Anything billed through Apple or Google must be cancelled at that store, not on the company’s website. And for annual plans, check the terms before you confirm - Adobe, for one, charges 50% of the remaining balance to leave an annual plan early.',
        links: [
          { text: 'billed through Apple', href: '/blog/cancel-subscriptions-iphone' },
          { text: 'Adobe', href: '/blog/how-to-cancel-adobe' },
        ],
      },
      {
        type: 'callout',
        text: 'Quick Unsubscribe takes you straight to the cancel page for each service in your list, which removes the step that kills most subscription audits: hunting through account settings for a button the company has deliberately buried.',
        links: [{ text: 'Quick Unsubscribe', href: '/free-subscription-manager' }],
      },
      {
        type: 'h2',
        text: '3. Renegotiate Your Three Biggest Fixed Bills',
      },
      {
        type: 'p',
        text: 'Phone, broadband, and insurance are priced on the assumption that you will not check. Loyalty is usually penalised rather than rewarded: the best price is offered to new customers, and existing customers roll onto a higher rate quietly at the end of each contract term.',
      },
      {
        type: 'p',
        text: 'Get a competitor quote first, then call and ask to be matched. Say plainly that you are considering switching and name the number. It is one afternoon of unpleasant phone calls for a saving that repeats every month for a year, which makes it the highest hourly rate available to most people.',
      },
      {
        type: 'h2',
        text: '4. Move Money Out of Reach on Payday',
      },
      {
        type: 'p',
        text: 'Set up an automatic transfer to a separate savings account for the day after you are paid. Saving what is left at the end of the month does not work, because there is never anything left - spending expands to fill the balance in the account you can see.',
      },
      {
        type: 'p',
        text: 'Start with an amount small enough that you will not reverse it in week three. A transfer you leave alone for six months beats an ambitious one you cancel in February.',
      },
      {
        type: 'h2',
        text: '5. Run a 30-Day No-Buy on One Category',
      },
      {
        type: 'p',
        text: 'Pick one category and stop spending in it for 30 days. One category, not everything - broad restrictions collapse within a fortnight, and the collapse usually takes the rest of your intentions with it.',
      },
      {
        type: 'p',
        text: 'Choose the category from your statement, not from instinct. Almost everyone guesses wrong about where their discretionary money actually goes, and the whole exercise depends on aiming it at the real total rather than the one that feels most indulgent.',
      },
      {
        type: 'h2',
        text: 'Why Start With the Subscriptions',
      },
      {
        type: 'p',
        text: 'Tips 1, 3, 4, and 5 all require you to keep doing something. Tip 2 requires one afternoon and then keeps paying out on its own, because a cancelled subscription stays cancelled. That is why it is second on this list rather than last - it is the one you should do today, and the only one that gives you money back without asking you to change how you live.',
      },
      {
        type: 'p',
        text: 'The reason it needs redoing at all is that new subscriptions accumulate. A live list of every recurring charge with its renewal date turns a once-a-year audit into a standing view, so the next forgotten trial gets caught before it converts rather than eleven months after.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking - no bank access required. Pro scans your inbox to surface the recurring charges you have forgotten and emails you before each renewal, as a one-time payment. Paying a monthly fee to control your monthly fees was never going to work.',
      },
    ],
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getSubscriptionEraPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.subscriptionEra)
}

/** Newest first, by publish date. Posts sharing a date keep their array order. */
export function getBlogPostsNewestFirst(): BlogPost[] {
  return [...blogPosts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}
