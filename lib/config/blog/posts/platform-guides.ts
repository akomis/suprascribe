import type { BlogPost } from '../types'

export const platformGuides: BlogPost[] = [
  {
    slug: 'how-to-cancel-subscriptions',
    topics: ['cancel', 'discovery'],
    pillar: 'cancel',
    title: 'Cancel Subscriptions You Forgot You Had: The Full Playbook',
    description:
      'How to cancel subscriptions you forgot you had - find every recurring charge and shut it down before the next payment hits your account.',
    publishedAt: '2026-05-16',
    updatedAt: '2026-09-02',
    readingTimeMin: 5,
    intro:
      'Forgotten subscriptions can drain hundreds of euros a year. Here is how to find every active subscription and cancel the ones you no longer want. The cancelling is the easy part - the work is tracking down charges that are spread across app stores, PayPal, your bank and the services themselves.',
    faqQuestions: [
      'How do I cancel a subscription I forgot about?',
      'How do I find all my subscriptions?',
    ],
    faq: [
      {
        question: 'Do I get a refund if I cancel mid-billing-cycle?',
        answer:
          'Usually not. Cancelling stops the next charge; it rarely reverses the one already taken. You normally keep access until the end of the period you have paid for, so there is no benefit to waiting - cancel as soon as you have decided and use the remaining time.',
      },
      {
        question: 'Where do I cancel a subscription I cannot find in any app store?',
        answer:
          'In the service\'s own account settings. Apple, Google Play, PayPal and Amazon each show only what they bill; browser signups, Stripe or Paddle checkouts and direct debits are handled by the company itself. If the cancel page is buried, search for "[service name] cancel subscription" - EU consumer rules require cancelling to be as easy as signing up.',
      },
      {
        question: 'What should I do before I cancel?',
        answer:
          'Download anything you want to keep, since access usually ends with the billing period. Check whether a pause option exists if you might come back. Then screenshot the cancellation confirmation - it is the only evidence you have if the charges continue and you need to dispute them.',
      },
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
        type: 'diagram',
        diagram: {
          kind: 'cancel-path',
          alt: 'Where to start depends on what you have to work from: an iPhone, an Android phone, a bank statement, or your inbox for a complete list in one pass.',
          data: {
            question: 'Where do you want to start?',
            branches: [
              {
                condition: 'You mostly use an iPhone',
                action: 'Cancel subscriptions on iPhone',
                href: '/blog/cancel-subscriptions-iphone',
              },
              {
                condition: 'You mostly use Android',
                action: 'Cancel subscriptions on Android',
                href: '/blog/cancel-subscriptions-android',
              },
              {
                condition: 'You only have a bank statement',
                action: 'Find hidden subscriptions on a bank statement',
                href: '/blog/how-to-find-hidden-subscriptions-bank-statement',
              },
              {
                condition: 'You want the complete list quickly',
                action: 'Find all your subscriptions',
                href: '/blog/how-to-find-all-your-subscriptions',
              },
            ],
          },
        },
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
        text: 'This manual method works, but it takes time. A faster alternative is to automatically find your subscriptions with a tool like Suprascribe, which connects to your Gmail, Outlook, or iCloud and surfaces every subscription-related email in minutes - without storing any email content.',
        links: [
          {
            text: 'automatically find your subscriptions',
            href: '/blog/how-to-find-all-your-subscriptions',
          },
        ],
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
        type: 'table',
        table: {
          caption: 'The five places a subscription can be billed from',
          rowHeaders: true,
          headers: ['Billing channel', 'Where to look', 'What you can cancel there'],
          rows: [
            [
              'Apple',
              'Settings → [your name] → Subscriptions',
              'Anything bought inside an app on an Apple device',
            ],
            [
              'Google Play',
              'Play Store → Payments & subscriptions',
              'Anything bought inside an Android app',
            ],
            [
              'PayPal',
              'Settings → Payments → Manage automatic payments',
              'Anything set up as an automatic payment',
            ],
            [
              'Amazon',
              'Account → Memberships & Subscriptions',
              'Prime, Audible, Kindle Unlimited, Prime Video Channels',
            ],
            [
              'The service itself',
              "The service's own account settings",
              'Browser signups, Stripe or Paddle billing, direct debits',
            ],
          ],
        },
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
    topics: ['discovery', 'cancel'],
    pillar: 'discovery',
    title: 'How to Automatically Find All Your Subscriptions (2026)',
    description:
      'How to automatically find all your subscriptions by scanning your inbox - plus the three manual methods, compared on time, coverage, and cost.',
    publishedAt: '2026-04-28',
    updatedAt: '2026-09-02',
    readingTimeMin: 9,
    intro:
      'The fastest way to find every subscription you are paying for is to let a scanner read the receipts already sitting in your inbox. Here is how automatic discovery works, and how it compares to doing it by hand. No bank connection is involved - every subscription you have ever started sent you a receipt, so the record you need is already in your email.',
    faqQuestions: [
      'How does auto-discovery work? Does it read all my emails?',
      'Is my data safe and private?',
      'Can I use Suprascribe without connecting my email?',
      'How do I find all my subscriptions?',
      'Can Suprascribe detect subscriptions from Gmail?',
      'Which email providers are supported?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    relatedSlugs: [
      'how-to-find-hidden-subscriptions-bank-statement',
      'how-to-track-subscriptions-on-iphone-and-android',
      'what-is-a-subscription-tracker',
      'best-free-subscription-manager',
    ],
    relatedPageLinks: [
      { href: '/gmail-subscription-tracker', label: 'Gmail Subscription Tracker' },
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: To automatically find all your subscriptions, connect Gmail, Outlook, or iCloud to a subscription tracker that scans your inbox for billing emails - it takes a few minutes and needs no bank access. Every subscription you have ever started sent you a receipt, so your inbox is already a complete record; a scanner just reads it faster than you can. If you would rather not connect an inbox, the manual fallbacks are a keyword search of your email, a three-to-six-month bank statement review, and an audit of Apple Subscriptions, Google Play, and PayPal automatic payments.',
      },
      {
        type: 'p',
        text: 'Almost nobody can name every subscription they pay for. The ones you remember are the ones you use - the streaming service you opened last night, the music app on your phone. The ones that cost you money are the ones you do not: a trial that converted eleven months ago, an annual plan that renews on a date you have never once thought about, a storage upgrade billed under a company name you would not recognise on a statement.',
      },
      {
        type: 'p',
        text: 'There are four ways to close that gap. One of them is automatic and takes minutes. The other three are manual and take between twenty minutes and a couple of hours, with different blind spots each. This guide covers all four, starting with the automatic one, and is honest about where each falls short.',
      },
      {
        type: 'h2',
        text: 'The four methods, compared',
      },
      {
        type: 'table',
        table: {
          headers: ['Method', 'Time', 'What it catches', 'Cost', 'Needs bank access'],
          rows: [
            [
              'Automatic email scanning',
              '2-5 min',
              'Anything that ever emailed you a receipt, including converted trials and annual plans',
              'Free tools exist',
              'No',
            ],
            [
              'Manual email search',
              '30-90 min',
              'The same emails, if you guess every keyword and check every folder',
              'Free',
              'No',
            ],
            [
              'Bank statement review',
              '30-60 min',
              'Charges hitting that one card - misses app-store and PayPal billing',
              'Free',
              'Yes',
            ],
            [
              'App store and PayPal audit',
              '10-15 min',
              'Only subscriptions billed through those platforms',
              'Free',
              'No',
            ],
          ],
        },
      },
      {
        type: 'p',
        text: 'The two email-based methods are the only ones that see everything, because email is the one channel every subscription uses regardless of how it bills you. The difference between them is purely how long you spend. Everything below explains the automatic route first, then the three manual ones as fallbacks or as a way to double-check.',
      },
      {
        type: 'h2',
        text: 'Method 1: Automatic email scanning (the fastest route)',
      },
      {
        type: 'p',
        text: 'Automatic discovery means connecting your inbox to a tool that reads the billing emails for you and extracts the service name, amount, and renewal date into a list. Suprascribe does this for Gmail, Outlook, and iCloud, and for any other provider over IMAP. Here is the whole process:',
        links: [{ text: 'Suprascribe does this for Gmail', href: '/gmail-subscription-tracker' }],
      },
      {
        type: 'ol',
        items: [
          'Create a free account - no credit card, no bank details.',
          "Connect your inbox. Gmail and Outlook use OAuth, so you click through your provider's own consent screen and never hand over a password. iCloud and other providers use IMAP with an app-specific password you generate and can revoke.",
          'Start the scan. It runs against your billing and receipt history rather than your whole mailbox, and finishes in a few minutes.',
          'Review the results. You get a list of detected services with amounts and billing cycles - confirm the ones that are right, delete anything misread, and add anything you know about that never sent an email.',
          'Cancel what you do not want, and set renewal reminders on what you keep.',
        ],
      },
      {
        type: 'image',
        image: {
          src: '/blog/autodiscovery-inbox-providers.png',
          alt: 'Provider picker offering Gmail, Outlook and iCloud, above a note stating that only email subject lines are read and no credentials are stored',
          caption:
            'Step 2: pick the inbox to scan. Gmail and Outlook go through OAuth; iCloud and anything else connect over IMAP with an app-specific password.',
          width: 712,
          height: 801,
        },
      },
      {
        type: 'p',
        text: 'The part people find surprising is step 4. A scan typically surfaces two or three services the person had genuinely forgotten - not services they were unsure about, services they had no memory of at all. Those are the ones that have been quietly billing for the longest.',
      },
      {
        type: 'image',
        image: {
          src: '/blog/autodiscovery-results.png',
          alt: 'Review screen listing subscriptions found by the scan - Notion, Adobe Creative Cloud, Netflix, GitHub Pro, Spotify and a past Disney Plus - each with its billing period, price, an edit button and a reject button',
          caption:
            'Step 4: the review screen. Everything the scan found is listed with its dates and price, so you can correct a misread amount or reject a false positive before any of it is imported.',
          width: 636,
          height: 1160,
        },
      },
      {
        type: 'image',
        image: {
          src: '/blog/subscription-dashboard-auto-discovery.png',
          alt: 'Subscription dashboard listing services found automatically by scanning an inbox, with the monthly and yearly totals and each renewal date',
          caption:
            'The result of a scan: every subscription found in the inbox, with its cost, billing cycle, and next renewal date.',
          width: 707,
          height: 1174,
        },
      },
      {
        type: 'h2',
        text: 'How automatic subscription discovery actually works',
      },
      {
        type: 'p',
        text: 'It is worth understanding the mechanism, because "connect your email" sounds more invasive than what actually happens. The scan runs in four stages:',
      },
      {
        type: 'ol',
        items: [
          'Scoped access. OAuth grants read-only access to mail. No send permission, no access to contacts, calendar, or files, and you can revoke it from your Google or Microsoft account settings at any time without involving the tool.',
          'Pattern matching. The scanner queries for messages that look like billing - senders like billing@ and noreply@, subjects containing receipt, invoice, renewal, payment confirmation, and your subscription. Messages that do not match are never opened.',
          'Extraction. For messages that do match, the subject, sender, and body are read once so the service name, amount, currency, and billing cycle can be pulled out.',
          'Discard. The extracted fields are saved to your account. The email content itself is not stored - the scan is ephemeral, and once it finishes there is no copy of your mail anywhere.',
        ],
      },
      {
        type: 'p',
        text: 'That last point is the one to check before you trust any tool with an inbox. "We scan your email" and "we store your email" are very different products. Suprascribe is open source, so the scanning code is public and you can read exactly what it does rather than taking a privacy policy at its word.',
        links: [{ text: 'open source', href: '/open-source-subscription-tracker' }],
      },
      {
        type: 'h2',
        text: 'What automatic scanning catches that a bank statement misses',
      },
      {
        type: 'p',
        text: 'Bank statements feel like the authoritative source, but they have a structural blind spot: a large share of consumer subscriptions are billed by an intermediary, so the line item on your statement says "APPLE.COM/BILL" or "PAYPAL" and tells you nothing about which service it was. Email has no such problem, because the service itself sends the receipt. Specifically, scanning finds:',
      },
      {
        type: 'ul',
        items: [
          'Free trials that converted to paid - the conversion notice is an email, and often the only warning you ever got',
          'Annual plans, which appear on a statement once every twelve months and are trivially missed in a three-month review',
          'App Store and Google Play billing, where the merchant name is Apple or Google rather than the actual service',
          'Anything charged to a card you no longer check, or to a second account',
          'Services billed under an unfamiliar parent-company or payment-processor name',
          'Subscriptions that changed price - the increase notice is in your inbox even if the old amount is what you remember',
        ],
      },
      {
        type: 'p',
        text: 'The reverse blind spot exists too, and it is worth being straight about: a subscription that has never emailed you - a legacy plan, or something set up as a direct debit years ago - will not show up in an email scan. That is what the statement review below is for.',
        links: [
          {
            text: 'statement review below',
            href: '/blog/how-to-find-hidden-subscriptions-bank-statement',
          },
        ],
      },
      {
        type: 'h2',
        text: 'Why email scanning beats bank linking',
      },
      {
        type: 'p',
        text: 'Most automatic subscription finders - Rocket Money, PocketGuard, and similar - work by connecting your bank account through Plaid. To find a €9.99 charge, they take a copy of your entire transaction history: your salary, your rent, your medical payments, every purchase you have made.',
      },
      {
        type: 'p',
        text: 'Scanning receipts reaches the same answer from a much narrower slice of data. The scanner sees billing emails and nothing else, and the sensitive material - your actual financial accounts - is never touched. If a tool that scans email is breached, the exposure is a list of service names and prices. If a tool holding a Plaid connection is breached, the exposure is your complete financial life.',
      },
      {
        type: 'diagram',
        diagram: {
          kind: 'compare-columns',
          alt: 'Bank linking finds charges automatically but reads your entire transaction history and only sees the accounts you connect. Email scanning finds the same charges from billing receipts alone, across any card, but misses anything that never sent you an email.',
          data: {
            left: {
              title: 'Bank linking',
              points: [
                { text: 'Finds charges automatically', good: true },
                { text: 'Reads your entire transaction history', good: false },
                { text: 'Only sees the accounts you connect', good: false },
                { text: 'Shows "APPLE.COM/BILL", not the service name', good: false },
              ],
            },
            right: {
              title: 'Email scanning',
              points: [
                { text: 'Finds charges automatically', good: true },
                { text: 'Reads billing receipts and nothing else', good: true },
                { text: 'Catches charges on any card or account', good: true },
                { text: 'Misses anything that never emailed you', good: false },
              ],
            },
          },
        },
      },
      {
        type: 'p',
        text: "There is a practical benefit as well as a privacy one. Bank linking only sees the accounts you connect, so subscriptions on a partner's card, a work card, or an old account are invisible. An inbox tends to collect receipts across all of them.",
        links: [
          {
            text: 'Bank linking only sees the accounts you connect',
            href: '/subscription-tracker-without-bank-account',
          },
        ],
      },
      {
        type: 'h2',
        text: 'Method 2: Manual email search',
      },
      {
        type: 'p',
        text: 'This is the same data source as automatic scanning, worked by hand. It costs nothing and works with any provider, and it is the right choice if you would prefer not to connect an inbox to anything.',
      },
      {
        type: 'ol',
        items: [
          'Search your mail for each of these separately: "receipt", "invoice", "your subscription", "renewal", "billing", "payment confirmation", "thank you for subscribing", and "your trial ends".',
          'Repeat each search in Spam and Promotions. Gmail in particular files a lot of billing mail under Promotions, and it is the folder people never look in.',
          'Search for "subscription" restricted to senders containing "noreply" and "billing" - this catches receipts whose wording you did not guess.',
          'Widen the date range to at least eighteen months so annual renewals fall inside it.',
          'Write each service into a list as you find it, with the amount and the billing date. Do not trust yourself to remember one you saw two searches ago.',
        ],
      },
      {
        type: 'p',
        text: 'Budget thirty to ninety minutes depending on how old the mailbox is. The weakness is coverage rather than effort: you find the receipts whose phrasing you thought to search for, and a service that words its emails unusually stays hidden no matter how long you spend.',
      },
      {
        type: 'h2',
        text: 'Method 3: Bank and card statement review',
      },
      {
        type: 'p',
        text: 'Use this to catch anything that does not email you, and to confirm that what you found is actually still being charged.',
      },
      {
        type: 'ol',
        items: [
          'Download six to twelve months of statements for every card and account, not three - a three-month window cannot see an annual renewal.',
          'Sort by merchant name rather than date. Recurring charges group together and become obvious; sorted by date they are scattered among ordinary spending.',
          'Look for amounts that repeat exactly, month after month. Subscription pricing clusters at round numbers - 4.99, 9.99, 14.99, 19.99.',
          'Search any merchant name you do not recognise. Billing entities frequently differ from the brand name you signed up with.',
          'Check your PayPal and any stored-card accounts separately, since those charges appear on your statement as a single opaque merchant.',
        ],
      },
      {
        type: 'callout',
        text: 'Watch for charges that changed amount. A price increase makes the same subscription look like two different ones when you scan a statement quickly, and makes it easy to conclude you already accounted for it.',
      },
      {
        type: 'h2',
        text: 'Method 4: App store and PayPal audits',
      },
      {
        type: 'p',
        text: 'A meaningful share of subscriptions never appear under their own name anywhere except inside the platform that bills them. These take ten minutes total and are worth doing even if you used one of the methods above:',
      },
      {
        type: 'ul',
        items: [
          'Apple: Settings → your name → Subscriptions (or App Store → your profile → Subscriptions)',
          'Google Play: Play Store → profile icon → Payments & subscriptions → Subscriptions',
          'PayPal: Settings → Payments → Manage automatic payments',
          'Amazon: Account → Memberships & Subscriptions',
          "Your browser's saved payment methods, which sometimes reveal a signup you have no other record of",
        ],
        links: [
          { text: 'Apple', href: '/blog/cancel-subscriptions-iphone' },
          { text: 'Google Play', href: '/blog/cancel-subscriptions-android' },
        ],
      },
      {
        type: 'p',
        text: 'Note that these screens only show subscriptions still active on that account. Something you were billed for last month and that has since lapsed will not appear, which is why they complement rather than replace an email or statement review.',
      },
      {
        type: 'h2',
        text: 'Keeping the list current without redoing this',
      },
      {
        type: 'p',
        text: 'Finding your subscriptions once solves this month. It does not solve next year, because the list grows again the moment you start a trial and forget it - which is exactly how the current list got built. Whatever method you used, the output needs to live somewhere that stays up to date rather than in a note you never open.',
      },
      {
        type: 'p',
        text: 'A tracker handles this in two ways: it holds the list with costs, billing cycles, and renewal dates so you can see the monthly total at a glance, and it re-scans your inbox periodically so anything new gets added without you doing another audit. Renewal reminders then arrive before a charge rather than after it, which is the difference between deciding to keep a subscription and simply being billed for one.',
        links: [{ text: 'A tracker', href: '/free-subscription-tracker' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for manual subscription tracking, with no bank access at any tier. Automatic email discovery - the part that finds the subscriptions you have forgotten - is a one-time Pro purchase rather than another monthly subscription.',
      },
    ],
  },
  {
    slug: 'cancel-subscriptions-iphone',
    topics: ['cancel', 'mobile'],
    title: 'Cancel Subscriptions on iPhone: Every App Store Subscription in One Place',
    description:
      'How to cancel subscriptions on iPhone - every App Store subscription in Settings, plus the ones Apple never shows you because they are billed outside the App Store entirely.',
    publishedAt: '2026-07-29',
    updatedAt: '2026-09-02',
    readingTimeMin: 6,
    intro:
      'Your iPhone has a single screen listing every subscription Apple bills you for. It is genuinely good - and it is also only half the picture, because anything charged directly to your card never appears there at all.',
    faqQuestions: [
      'How do I cancel a subscription on my iPhone?',
      'How do I find all my subscriptions?',
    ],
    faq: [
      {
        question: 'There is no Cancel button on the subscription - what does that mean?',
        answer:
          'It is already cancelled. An expiry date shown in red means the same thing: the subscription runs to the end of the paid period and then stops. Nothing further is needed.',
      },
      {
        question: 'Why is a subscription missing from my iPhone Subscriptions list?',
        answer:
          'Either it is on a different Apple Account, or Apple never billed it. Search your email for "receipt from Apple" to see which account was charged and sign in with that one. If the receipt is not from Apple at all, the subscription is billed directly by the company and has to be cancelled in that service\'s own account settings.',
      },
      {
        question: 'When should I cancel a free trial on iPhone?',
        answer:
          'At least 24 hours before it ends. Cancelling inside the final day is unreliable because the renewal may already be in flight. You keep access for the rest of the trial either way, so cancelling early costs you nothing.',
      },
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
        type: 'table',
        table: {
          caption: 'What Apple does not show you, and where it is billed instead',
          rowHeaders: true,
          headers: ['What Apple does not show', 'Where it is billed instead'],
          rows: [
            ['Signups made in a browser', "The service's own account settings"],
            ['Software on Stripe, Paddle, or a company checkout', "The company's own billing page"],
            ['Gyms, insurance, storage units', 'Direct debit with the provider'],
            ['Subscriptions started on a computer', 'Wherever you signed up'],
            ['PayPal automatic payments', 'PayPal → Settings → Payments'],
          ],
        },
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
        text: 'Suprascribe is free for manual tracking on iPhone and everywhere else - no bank access required, and it installs as an app straight from the browser. Pro adds inbox auto-discovery, quick unsubscribe, renewal reminders and more as a one-time payment, not another monthly charge.',
      },
    ],
  },
  {
    slug: 'cancel-subscriptions-android',
    topics: ['cancel', 'mobile'],
    title: 'Cancel Subscriptions on Android: Google Play and Everything It Misses',
    description:
      'How to cancel subscriptions on Android - cancel, pause, or restore any Google Play subscription from the app or the web, and find the recurring charges Google Play never lists.',
    publishedAt: '2026-07-29',
    updatedAt: '2026-09-02',
    readingTimeMin: 6,
    intro:
      'Google Play gives Android users something iPhone does not: the option to pause a subscription instead of killing it. It also shares the same blind spot - it only knows about the subscriptions Google itself bills.',
    faqQuestions: [
      'How do I cancel a subscription on Android?',
      'How do I find all my subscriptions?',
    ],
    faq: [
      {
        question: 'Does deleting an app cancel its subscription on Android?',
        answer:
          'No. Google states it directly: uninstalling the app does not cancel the subscription. The subscription lives in your Google account, not on the phone, and it keeps billing until you cancel it in the Play Store. This is the most common reason people keep paying for something they thought they had dealt with.',
      },
      {
        question: 'Can I pause a Google Play subscription instead of cancelling it?',
        answer:
          'Yes, and it is a genuine Android advantage over iPhone. In Google Play, open the subscription, tap Manage, then Pause payments, and set a period from one week to three months depending on the app. Your account, history and settings stay intact, and you can tap Resume to come back early.',
      },
      {
        question: 'What happens to my access after I cancel on Google Play?',
        answer:
          "You keep it until the period you paid for runs out. Google's own example: buy a one-year subscription on 1 January for $10 and cancel on 1 July, and you keep access to 31 December with no charge the following January. Past periods are generally not refundable, though an unused prepaid plan can be an exception.",
      },
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
        type: 'table',
        table: {
          caption: 'What Google Play does not show you, and where it is billed instead',
          rowHeaders: true,
          headers: ['What Google Play does not show', 'Where it is billed instead'],
          rows: [
            ['Signups made in a browser', "The service's own account settings"],
            ['Software on Stripe, Paddle, or a company checkout', "The company's own billing page"],
            ['PayPal automatic payments', 'PayPal → Settings → Payments'],
            ['Gyms, insurance, other direct debits', 'Direct debit with the provider'],
            ['Subscriptions started on iPhone or a work laptop', 'Wherever you signed up'],
          ],
        },
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
        text: 'Suprascribe is free for manual tracking with no bank access required, and installs as an app on Android straight from the browser. Pro adds inbox auto-discovery, quick unsubscribe, renewal reminders and more as a one-time payment - not another subscription to manage alongside the rest.',
      },
    ],
  },
  {
    slug: 'how-to-track-subscriptions-on-iphone-and-android',
    topics: ['mobile', 'discovery', 'tools'],
    title: 'How to Track Subscriptions on iPhone and Android in 2026',
    description:
      'Track subscriptions on your phone without app store limits or bank linking - the best cross-platform tools and built-in options for iPhone and Android.',
    publishedAt: '2026-08-18',
    updatedAt: '2026-09-02',
    readingTimeMin: 7,
    intro:
      'Your phone already has a subscription list buried in Settings or the Play Store, but it only shows a fraction of what you pay for. Here is how to track every subscription on iPhone and Android, not just the ones Apple or Google bill.',
    faqQuestions: [
      'How do I cancel a subscription on my iPhone?',
      'How do I cancel a subscription on Android?',
      'How do I find all my subscriptions?',
    ],
    faq: [
      {
        question: "Why don't my phone's subscription settings show everything I pay for?",
        answer:
          'Because each store only lists what it bills. Settings on iPhone shows App Store purchases; Play Store shows Google Play purchases. Browser signups, Stripe and Paddle checkouts, streaming billed straight to your card, PayPal automatic payments and direct debits appear in neither - and for most people that second group is the larger one.',
      },
      {
        question: 'Can I track subscriptions on my phone without installing an app?',
        answer:
          'Yes. A web-based tracker installs as a PWA straight from the browser - on iPhone tap Share then Add to Home Screen, on Android use the Chrome install prompt. It gets an app icon and its own window, updates automatically, and is not tied to a store account, so the same list works if you switch between iPhone and Android.',
      },
    ],
    relatedSlugs: [
      'cancel-subscriptions-iphone',
      'cancel-subscriptions-android',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      {
        href: '/subscription-tracker-without-bank-account',
        label: 'Tracker With No Bank Linking',
      },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: iPhone users can check Settings → [your name] → Subscriptions. Android users can check Play Store → Profile → Payments & subscriptions → Subscriptions. Both lists are incomplete - they only show App Store or Google Play billing. To track everything, including direct merchant charges and PayPal, use a cross-platform tracker like Suprascribe that scans your inbox.',
      },
      {
        type: 'p',
        text: 'Tracking subscriptions on a phone should be easy. The platforms make it half-easy: they give you a clean list of the subscriptions they bill themselves, and they hide everything else. If you want a complete picture, you need to look beyond the built-in screens.',
      },
      {
        type: 'h2',
        text: 'What Your Phone Already Shows You',
      },
      {
        type: 'h3',
        text: 'iPhone: Settings → Subscriptions',
      },
      {
        type: 'p',
        text: 'On iPhone, open Settings, tap your name at the top, then tap Subscriptions. This lists every subscription billed through your Apple Account. You can cancel, change plans, or see renewal dates here. It is the best place to start - but it only covers App Store purchases.',
      },
      {
        type: 'h3',
        text: 'Android: Play Store → Subscriptions',
      },
      {
        type: 'p',
        text: 'On Android, open the Play Store, tap your profile, then Payments & subscriptions → Subscriptions. Google Play also lets you pause payments for one to three months instead of cancelling. Again, this only covers subscriptions billed through Google Play.',
      },
      {
        type: 'callout',
        text: 'Deleting an app does not cancel its subscription. This is the most common and expensive misconception on both platforms. The subscription lives in your Apple or Google account, not on your phone.',
      },
      {
        type: 'h2',
        text: 'What Your Phone Hides',
      },
      {
        type: 'p',
        text: 'Most people have more subscriptions billed outside the app stores than inside them. The following will never appear in Settings or the Play Store:',
      },
      {
        type: 'table',
        table: {
          caption: 'What neither store shows you, and where it is billed instead',
          rowHeaders: true,
          headers: ['What your phone hides', 'Where it is billed instead'],
          rows: [
            ['Signups made in a browser', "The service's own account settings"],
            ['Software on Stripe, Paddle, or a company checkout', "The company's own billing page"],
            ['Streaming billed straight to your card', "The service's own account settings"],
            ['PayPal automatic payments', 'PayPal → Settings → Payments'],
            ['Gyms, insurance, other direct debits', 'Direct debit with the provider'],
          ],
        },
      },
      {
        type: 'p',
        text: 'That is why a phone-only audit usually misses the subscriptions that cost the most - the ones you signed up for and forgot.',
      },
      {
        type: 'h2',
        text: 'The Best Cross-Platform Trackers',
      },
      {
        type: 'p',
        text: 'If you use both iPhone and Android, or you want one list that works everywhere, a web-based tracker is the better choice. The best options for phone users are:',
      },
      {
        type: 'ul',
        items: [
          'Suprascribe: web-based, works as a PWA on iPhone and Android, email-based discovery, no bank linking',
          'Bobby: iOS-only, manual entry, polished interface',
          'Subby: mobile-only, manual entry, ad-supported unlimited free tier',
          'Rocket Money: cross-platform, but bank-linked and monthly fee',
        ],
      },
      {
        type: 'p',
        text: 'Suprascribe is the only one that gives you automatic discovery on both platforms without asking for your bank login. It installs from the browser like a native app and works whether your next phone is an iPhone or Android.',
        links: [{ text: 'Suprascribe', href: '/free-subscription-tracker' }],
      },
      {
        type: 'h2',
        text: 'How to Set Up a Universal Tracker',
      },
      {
        type: 'ol',
        items: [
          'Open the tracker in your phone browser',
          'Add it to your home screen - on iPhone, tap Share then Add to Home Screen; on Android, use the install prompt in Chrome',
          'Connect the email account where your receipts arrive, or add subscriptions manually',
          'Review the list, set renewal reminders, and cancel anything unused',
        ],
      },
      {
        type: 'p',
        text: 'Once installed as a PWA, the tracker opens in its own window with an app icon and updates automatically. You get the convenience of an app without the store restrictions or commission fees.',
      },
      {
        type: 'h2',
        text: 'Why Web-Based Beats Store-Locked',
      },
      {
        type: 'p',
        text: 'A tracker tied to the App Store or Google Play only knows what that store knows. A web-based tracker works from your inbox, which is the one place every subscription leaves a trace regardless of platform. It also moves with you when you switch phones.',
      },
      {
        type: 'p',
        text: 'Store-locked apps also tend to push subscriptions through the store, which adds a commission that gets passed on to you. Staying web-first is part of why Suprascribe can keep Pro as a one-time payment instead of a recurring subscription.',
      },
      {
        type: 'h2',
        text: 'Keep the Phone Lists as a Backup',
      },
      {
        type: 'p',
        text: 'The built-in iPhone and Android subscription screens are still useful. Check them quarterly, especially after a free trial. But treat them as one source among several, not the full picture. Pair them with a universal tracker and an occasional bank-statement scan and you will catch almost everything.',
      },
      {
        type: 'callout',
        text: 'Suprascribe works on iPhone, Android, and desktop from the same account. The free tier is unlimited for manual tracking, and Pro scans your inbox to find forgotten subscriptions as a one-time payment - no monthly fee, no bank access.',
        links: [{ text: 'free tier', href: '/login?tab=signup' }],
      },
    ],
  },
]
