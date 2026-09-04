import type { BlogPost } from '../types'

export const comparisonGuides: BlogPost[] = [
  {
    slug: 'best-free-subscription-manager',
    topics: ['tools', 'money'],
    title: 'The best free subscription manager in 2026',
    description:
      'What the best free subscription manager in 2026 looks like - and why the strongest options do not require a bank connection or a recurring fee.',
    publishedAt: '2026-05-01',
    updatedAt: '2026-09-02',
    readingTimeMin: 5,
    intro:
      'Not all free subscription managers are equal. Some cap features, some require bank access, some charge a monthly fee to manage your monthly fees. Here is how to pick the right one.',
    faqQuestions: [
      'What is the best free app to track subscriptions?',
      'Is Suprascribe really free?',
      'Is Pro really a one-time payment?',
    ],
    faq: [
      {
        question: 'What are the limits on most "free" subscription managers?',
        answer:
          "Usually a cap on how many subscriptions you can add - Bobby and ReSubs stop at five - or a paywall on the features that make the tool useful, like renewal reminders, automatic discovery, and sorting. Subby is unlimited but ad-supported, and YNAB's free tier is only a 34-day trial. A genuinely free tier should handle an unlimited number of subscriptions with the core features intact.",
      },
      {
        question: 'Why does a subscription manager charge a monthly fee at all?',
        answer:
          'Because it is the standard SaaS model, not because the product costs that much to run. It is also the obvious contradiction in the category: paying EUR 5-15 a month to manage the other things you pay EUR 5-15 a month for. A one-time upgrade does the same job without adding a line to the renewal calendar you are trying to shrink.',
      },
    ],
    relatedSlugs: [
      'best-subscription-tracker-app',
      'how-to-cancel-subscriptions',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [
      { href: '/compare', label: 'Suprascribe vs other Trackers' },
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
        type: 'table',
        table: {
          caption: 'What each free tier actually gives you',
          rowHeaders: true,
          headers: ['Tool', 'Free-tier cap', 'Discovery on the free tier', 'Bank access'],
          rows: [
            ['Suprascribe', 'Unlimited', 'Manual; email scanning is a one-time Pro upgrade', 'No'],
            ['Subby', 'Unlimited, ad-supported', 'Manual only', 'No'],
            ['Bobby', 'Up to 5', 'Manual only', 'No'],
            ['ReSubs', 'Up to 5', 'Manual only', 'No'],
            ['Rocket Money', 'Limited', 'Automatic, from your transactions', 'Yes, via Plaid'],
            ['YNAB', '34-day trial only', 'Automatic, from your transactions', 'Yes'],
          ],
        },
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
    slug: 'best-subscription-tracker-app',
    topics: ['tools', 'discovery'],
    pillar: 'tools',
    title: 'The best subscription tracker apps in 2026 (honestly compared)',
    description:
      'A straight comparison of the best subscription tracker apps in 2026 - which need bank access, which charge monthly, and which are actually free. Picks for privacy, automation, and budgeting.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-09-02',
    readingTimeMin: 8,
    intro:
      'Every "best subscription tracker" list is written by one of the apps on it. Here is the honest version: what each tool is genuinely good at, what it costs, and the trade-off nobody mentions - whether it demands access to your bank account.',
    faqQuestions: [
      'What is the best free app to track subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    faq: [
      {
        question: 'What is the difference between bank-linked and email-based trackers?',
        answer:
          'Bank-linked apps such as Rocket Money, PocketGuard and Unsubby connect through Plaid and read your full transaction history to spot recurring charges. Email-based trackers read billing receipts instead, which name the service, amount and cycle directly. The results are broadly the same; the access required is not - and a bank feed shows "APPLE.COM/BILL" where a receipt names the actual service.',
      },
      {
        question: 'Which subscription tracker works without linking a bank account?',
        answer:
          'Suprascribe (email scanning, unlimited free tier, one-time Pro), Bobby (iOS, manual, free up to five) and Subby (mobile, manual, unlimited but ad-supported). Of those, only Suprascribe finds subscriptions automatically - Bobby and Subby require you to type in every one, which means they only ever contain the subscriptions you already remembered.',
      },
      {
        question: 'Is a lifetime or one-time purchase better than a monthly plan?',
        answer:
          "For a tracker, yes. PocketGuard's lifetime option is around $150 and YNAB is roughly $109 a year with no lifetime tier, so a recurring plan overtakes a one-time purchase quickly. The stronger argument is structural: a tracker billed monthly is itself a subscription you now have to justify at every renewal.",
      },
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
        text: 'Subscription trackers split into three camps, and which camp you want decides everything. Bank-linked apps connect to your accounts via Plaid and detect charges automatically - powerful, but they read your entire transaction history and usually charge monthly. Email-based tools automatically find your subscriptions from your inbox without touching your bank. Manual trackers make you type each one in, trading effort for total privacy.',
        links: [
          {
            text: 'automatically find your subscriptions',
            href: '/blog/how-to-find-all-your-subscriptions',
          },
        ],
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
        type: 'table',
        table: {
          caption: 'The seven trackers at a glance',
          rowHeaders: true,
          headers: ['Tool', 'How it finds subscriptions', 'Free tier', 'Pricing', 'Bank access'],
          rows: [
            ['Suprascribe', 'Email scanning', 'Unlimited', 'One-time Pro upgrade', 'No'],
            [
              'Rocket Money',
              'Bank transactions',
              'Limited',
              'Monthly subscription',
              'Yes, via Plaid',
            ],
            [
              'PocketGuard',
              'Bank transactions',
              'Limited',
              '$12.99/mo, $74.99/yr, $149.99 lifetime',
              'Yes',
            ],
            ['YNAB', 'Bank import', '34-day trial only', '$14.99/mo or $109/yr', 'Yes'],
            ['Bobby', 'Manual entry', 'Up to 5', '~$1.99 one-time, iOS only', 'No'],
            [
              'Subby',
              'Manual entry',
              'Unlimited, ad-supported',
              '$2.99 one-time removes ads',
              'No',
            ],
            ['Unsubby', 'Bank transactions', 'Up to 4', '~$12.95/month', 'Yes, via Plaid'],
          ],
        },
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
        type: 'image',
        image: {
          src: '/blog/subscription-dashboard-dark.png',
          alt: 'Suprascribe dashboard showing a monthly spend total of 105.75 euros in a donut chart, above a list of active subscriptions with their price and renewal date',
          caption:
            'Suprascribe after a scan: one total, and every active subscription with the date it renews.',
          width: 819,
          height: 828,
        },
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
    topics: ['tools', 'money'],
    title: 'A free subscription tracker spreadsheet template (and when to ditch it)',
    description:
      'A ready-to-copy subscription tracker spreadsheet template for Google Sheets or Excel - the exact columns to use, how to total annual cost, and the point where an app saves you the upkeep.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-09-02',
    readingTimeMin: 6,
    intro:
      'A spreadsheet is the most private way to track subscriptions - nothing is linked, nothing is shared. Here is a template you can rebuild in two minutes, the columns that actually matter, and an honest look at where a spreadsheet stops being enough.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    faq: [
      {
        question: 'What columns should a subscription tracker spreadsheet have?',
        answer:
          'Seven: Service, Cost, Billing Cycle, Renewal Date, Category, Payment Method, and a calculated Annual Cost. Category makes overlapping services visible, Payment Method tells you where to go to cancel, and Annual Cost is what turns the list into a number you can act on. Add more fields and you stop maintaining the sheet.',
      },
      {
        question: 'How do I calculate my total annual subscription cost in a spreadsheet?',
        answer:
          'Normalise every row to a yearly figure first, then sum it. With Cost in column B and Billing Cycle in column C: =IF(C2="Monthly", B2*12, IF(C2="Annual", B2, IF(C2="Quarterly", B2*4, IF(C2="Weekly", B2*52, B2)))) and then =SUM() over that column. The total is almost always higher than people expect, because monthly amounts hide what they add up to.',
      },
      {
        question: 'When is a spreadsheet no longer enough?',
        answer:
          'When the cost of the subscriptions you have forgotten exceeds the effort of switching. A sheet holds data well but cannot do the three things that actually stop wasted money: remind you before a renewal, discover charges you never knew to type in, and stay current without a manual edit for every signup and price rise. The discovery gap is the expensive one - by definition a spreadsheet never contains the subscriptions you forgot.',
      },
    ],
    relatedSlugs: [
      'how-to-find-all-your-subscriptions',
      'best-free-subscription-manager',
      'how-to-find-hidden-subscriptions-bank-statement',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
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
        type: 'table',
        table: {
          caption: 'The seven columns a subscription sheet needs',
          rowHeaders: true,
          headers: ['Column', 'What it holds'],
          rows: [
            ['Service', 'The name of the subscription (Netflix, Spotify, iCloud+)'],
            ['Cost', 'The amount charged each cycle'],
            ['Billing Cycle', 'Monthly, annual, quarterly, or weekly'],
            ['Renewal Date', 'The next date it charges'],
            ['Category', 'Streaming, software, fitness, news - so you can spot overlap'],
            ['Payment Method', 'Card, PayPal, App Store - so you know where to cancel'],
            ['Annual Cost', 'A calculated column normalising everything to a yearly figure'],
          ],
        },
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
        text: 'Then total the Annual Cost column with =SUM(...) at the bottom. That single number - your true yearly subscription spend - is almost always higher than people expect, because monthly charges hide how much they add up to over a year. If you want the total before you build the sheet, our free subscription cost calculator does the same normalisation in the browser - no signup, nothing stored.',
        links: [
          {
            text: 'free subscription cost calculator',
            href: '/subscription-cost-calculator',
          },
        ],
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
        type: 'image',
        image: {
          src: '/blog/subscription-dashboard-dark.png',
          alt: 'Subscription dashboard with a donut chart of monthly spend and a list of active subscriptions, each showing its monthly and yearly cost and the number of days until it renews',
          caption:
            'The same columns a sheet holds, except the monthly total, the annualised cost and the days-until-renewal are computed rather than typed.',
          width: 819,
          height: 828,
        },
      },
      {
        type: 'callout',
        text: 'Suprascribe is free for unlimited manual tracking - a spreadsheet with reminders and a real dashboard, no bank access required. Pro adds inbox auto-discovery, quick unsubscribe, renewal reminders and more as a one-time payment.',
      },
    ],
  },
  {
    slug: 'how-to-track-company-software-subscriptions',
    topics: ['tools', 'software'],
    title: "How to track your company's software subscriptions in 2026",
    description:
      "A practical way to track your company's software subscriptions - surface shadow IT, kill duplicate tools, and catch renewals, using an open source tool with no bank access and a one-time cost instead of a per-seat SaaS bill.",
    publishedAt: '2026-07-26',
    updatedAt: '2026-09-02',
    readingTimeMin: 7,
    intro:
      'Every growing company ends up paying for software nobody remembers signing up for - duplicate tools, seats for people who left, annual renewals that sail through unnoticed. Here is how to get a complete picture of your company’s subscriptions without buying yet another per-seat SaaS platform to do it.',
    faqQuestions: ['Is Suprascribe open source?', 'Is Pro really a one-time payment?'],
    faq: [
      {
        question: 'Where do I find every software subscription my company pays for?',
        answer:
          'Five sources, and you need all of them: accounting or ERP exports filtered for recurring software vendors, corporate card and expense-tool statements including personal-card reimbursements, shared billing inboxes, app-store and cloud-marketplace billing, and the department leads themselves. The billing inbox is the highest-signal one, because almost every SaaS tool emails a receipt even when the card statement is unhelpful.',
      },
      {
        question: 'What counts as SaaS waste?',
        answer:
          'Four things. Duplicate tools - two products doing the same job in different teams. Empty seats - licences for people who left or never onboarded. Zombie subscriptions - tools from a finished project that still renew. And annual-vs-monthly: tools you are certain to keep, billed monthly at the higher rate. All four become obvious the moment everything is in one view.',
      },
      {
        question: 'Why not use a SaaS spend-management platform?',
        answer:
          'Most of them charge per seat or per tracked subscription, monthly, so you take on a recurring bill to control your recurring bills - and the tool holding your vendor and spend map is a closed-source black box. An open source tracker with a one-time cost lets your own security team audit or self-host it, and never becomes another line on the renewal calendar.',
      },
    ],
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
        type: 'table',
        table: {
          caption: 'The four kinds of SaaS waste, and what each looks like',
          rowHeaders: true,
          headers: ['Type of waste', 'What it looks like'],
          rows: [
            ['Duplicate tools', 'Two products doing the same job in different teams'],
            ['Empty seats', 'Licences for people who left or never onboarded'],
            ['Zombie subscriptions', 'Tools from a project that ended but still renew'],
            ['Annual vs monthly', 'Tools you will keep, billed monthly at the higher rate'],
          ],
        },
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
        text: 'Suprascribe is open source and free for unlimited manual tracking - no bank access, no per-seat pricing. Pro adds inbox auto-discovery, quick unsubscribe, renewal reminders and more as a one-time payment, and you can self-host the whole thing if you want full control of the data.',
      },
    ],
  },
  {
    slug: 'open-source-personal-finance-tools',
    topics: ['tools', 'privacy', 'money'],
    title: '5 Open Source Tools to Help You Tidy Up Your Finances and Save Money',
    description:
      'Five open source personal finance tools you can audit or self-host - budgeting, a full ledger, subscription tracking, investments, and desktop accounting - and what each one is actually good at.',
    publishedAt: '2026-08-20',
    updatedAt: '2026-09-02',
    readingTimeMin: 8,
    intro:
      'Open source finance apps give you two things the mainstream ones do not: you can read the code that touches your money data, and you can run it yourself. These five cover the jobs an individual actually needs - budgeting, a ledger, recurring charges, investments, and long-term records.',
    faqQuestions: [
      'What is the best open source personal finance app?',
      'Can I self-host my own subscription tracker?',
      'Is Suprascribe open source?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    faq: [
      {
        question: 'How many finance tools should I actually run?',
        answer:
          'Two, for most individuals: one that answers "where is my money going" and one that answers "what is still charging me". Add a third only if you have a real portfolio to track. Running five is a hobby rather than a system, and a setup you abandon in week three saves nothing however well designed it is.',
      },
    ],
    relatedSlugs: [
      'best-free-subscription-manager',
      'best-subscription-tracker-app',
      'how-to-save-money-fast',
      'subscription-tracker-spreadsheet-template',
    ],
    relatedPageLinks: [
      { href: '/open-source-subscription-tracker', label: 'Open Source Subscription Tracker' },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: Actual Budget for envelope budgeting, Firefly III for a full self-hosted ledger, Suprascribe for the recurring charges nothing else catches, Ghostfolio for investments, and GnuCash if you want a desktop app with no server at all. Every one of them is free, and every one of them lets you read the source before you hand over your financial data.',
      },
      {
        type: 'p',
        text: 'Personal finance software has a trust problem. The popular apps want a connection to your bank, charge a monthly fee for the privilege, and give you no way to check what happens to the data once it arrives. Open source alternatives fix the second half of that by default and, in most cases, the first half too - you can host them yourself and the data never leaves a machine you control.',
      },
      {
        type: 'p',
        text: 'This list is for individuals rather than businesses. Each tool below does one job properly instead of half a dozen badly, which is why running two or three of them together works better than looking for a single app that claims to do everything.',
      },
      {
        type: 'table',
        table: {
          caption: 'Five open source finance tools, by licence and deployment',
          rowHeaders: true,
          headers: ['Tool', 'What it does', 'Licence', 'Runs as'],
          rows: [
            [
              'Actual Budget',
              'Envelope budgeting, works offline',
              'MIT',
              'Web, desktop, or offline PWA',
            ],
            ['Firefly III', 'A full personal ledger', 'AGPL-3.0', 'Self-hosted web app only'],
            [
              'Suprascribe',
              'Automatic subscription tracking',
              'AGPL-3.0',
              'Hosted web app and PWA, or self-hosted',
            ],
            [
              'Ghostfolio',
              'Portfolio and net worth',
              'AGPL-3.0',
              'Self-hosted Docker, or a paid hosted plan',
            ],
            [
              'GnuCash',
              'Desktop double-entry accounting',
              'GNU GPL',
              'Desktop app on Windows, macOS, Linux',
            ],
          ],
        },
      },
      {
        type: 'h2',
        text: 'Why Open Source Matters More for Money Than for Anything Else',
      },
      {
        type: 'p',
        text: 'Financial data is the most sensitive category most people hold. It shows where you live, what you buy, who you pay, and how much is left at the end of the month. When the code is published, that claim on the marketing page about privacy becomes something anyone can verify rather than something you have to believe.',
      },
      {
        type: 'p',
        text: 'The second advantage is durability. Closed finance apps get acquired and shut down - Mint is the obvious example, and it took its users’ histories with it. An open source project can be forked, self-hosted, and kept running by anyone who cares enough, and your data sits in a database or a plain text file you can export at any time.',
      },
      {
        type: 'h2',
        text: '1. Actual Budget - Envelope Budgeting That Works Offline',
      },
      {
        type: 'p',
        text: 'Actual Budget is a zero-based, envelope-style budgeting app in the tradition of YNAB: every unit of income gets assigned a job before you spend it. It is local-first, so the app works offline and syncs through a server you run, with optional end-to-end encryption.',
        links: [{ text: 'Actual Budget', href: 'https://actualbudget.org' }],
      },
      {
        type: 'p',
        text: 'It is released under the MIT licence and the sync server ships as a single Docker container small enough for the cheapest VPS or a Raspberry Pi. Bank syncing is optional and handled through third-party providers - GoCardless covers EU and UK banks at no cost, while SimpleFIN handles US and Canadian banks for a small monthly fee. Importing statements manually costs nothing and keeps the bank out of it entirely.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want to plan spending forward rather than review it afterwards',
          'Licence: MIT - permissive, no copyleft obligations if you fork it',
          'Runs as: web app, desktop app, or offline PWA, with a self-hosted sync server',
          'Weak spot: it is a budgeting tool, not a record-keeping one - it will not track investments',
        ],
      },
      {
        type: 'h2',
        text: '2. Firefly III - The Full Personal Ledger',
      },
      {
        type: 'p',
        text: 'Firefly III is the serious option: a self-hosted personal finance manager built on double-entry bookkeeping, with budgets, categories, tags, rule-based auto-categorisation, recurring transactions, savings goals, and reports. It is AGPL-3.0 licensed and written in PHP, deployable by Docker on a NAS, a VPS, or a Raspberry Pi.',
        links: [{ text: 'Firefly III', href: 'https://www.firefly-iii.org' }],
      },
      {
        type: 'p',
        text: 'The strength and the cost are the same thing. Double-entry means the numbers always reconcile and the reports are trustworthy, but it also means a real setup session and a habit of importing transactions. If you have tried a budgeting app and found it too shallow, this is the step up. If you have never kept accounts before, start with Actual Budget instead.',
      },
      {
        type: 'ul',
        items: [
          'Best for: people who want one authoritative record of every account and transaction',
          'Licence: AGPL-3.0 - self-host freely, network-served modifications must be published',
          'Runs as: self-hosted web app, no official cloud version',
          'Weak spot: the steepest learning curve on this list, and there is no hosted option to fall back on',
        ],
      },
      {
        type: 'h2',
        text: '3. Suprascribe - Automatic Subscription Tracker',
      },
      {
        type: 'p',
        text: 'Budgeting apps and ledgers both assume you already know what you are paying for. Subscriptions are the category where that assumption fails: they bill under merchant names that match nothing, through app stores and PayPal, on dates nobody remembers, and they keep working after you stop using the service. That is a separate job from budgeting, which is why it needs a separate tool.',
      },
      {
        type: 'p',
        text: 'Suprascribe is an open source subscription tracker under the AGPL-3.0 licence, with the full source on GitHub for you to audit or self-host. It works from your inbox rather than your bank - receipts and renewal notices name the service, the amount, and the billing period, which is exactly the information a bank feed strips out. Manual tracking is free and unlimited, and Pro, which adds inbox discovery and renewal reminders, is a one-time payment rather than another monthly charge.',
        links: [
          { text: 'open source subscription tracker', href: '/open-source-subscription-tracker' },
          { text: 'GitHub', href: 'https://github.com/akomis/suprascribe' },
        ],
      },
      {
        type: 'ul',
        items: [
          'Best for: finding recurring charges you have forgotten and stopping them before the next renewal',
          'Licence: AGPL-3.0 - readable, auditable, self-hostable',
          'Runs as: hosted web app and PWA, or self-hosted from source',
          'Weak spot: it tracks subscriptions, not your whole financial picture - pair it with a budgeting tool',
        ],
      },
      {
        type: 'p',
        text: 'If you would rather run everything on your own hardware, Wallos is a GPL-3.0 self-hosted subscription tracker where you enter each subscription by hand. The trade-off is the one that matters here: manual entry only finds the subscriptions you already remember, and forgotten charges are the expensive ones.',
        links: [{ text: 'Wallos', href: 'https://github.com/ellite/Wallos' }],
      },
      {
        type: 'h2',
        text: '4. Ghostfolio - Investments and Net Worth in One Dashboard',
      },
      {
        type: 'p',
        text: 'Ghostfolio tracks investments across accounts and asset classes - stocks, ETFs, crypto, cash - and turns them into a single view of allocation, performance, and net worth. It is AGPL-3.0 licensed, self-hostable with Docker, and there is a paid hosted plan if you would rather not run a server.',
        links: [{ text: 'Ghostfolio', href: 'https://ghostfol.io' }],
      },
      {
        type: 'p',
        text: 'This is the tidiest fit for anyone whose money is spread across a broker, a pension, and an exchange. Self-hosting keeps your holdings and net worth off a third-party service, which is the part most portfolio trackers cannot offer at any price.',
      },
      {
        type: 'ul',
        items: [
          'Best for: tracking a portfolio spread across several brokers or exchanges',
          'Licence: AGPL-3.0',
          'Runs as: self-hosted Docker deployment, or a paid hosted plan',
          'Weak spot: it does not do budgeting or day-to-day spending at all',
        ],
      },
      {
        type: 'h2',
        text: '5. GnuCash - Desktop Double-Entry With No Server At All',
      },
      {
        type: 'p',
        text: 'GnuCash has been in development for over two decades and remains the most credible option for people who want proper accounting without hosting anything. It is a free desktop application for Windows, macOS, and Linux under the GNU GPL, with double-entry bookkeeping, bank reconciliation, multi-currency support, stock tracking, invoicing, and a large set of reports.',
        links: [{ text: 'GnuCash', href: 'https://www.gnucash.org' }],
      },
      {
        type: 'p',
        text: 'Your file lives on your own disk, which makes backups your responsibility and syncing between devices awkward. In exchange there is no server to maintain, no container to update, and no account anywhere. For long-term records that need to outlive any particular web app, that is a reasonable trade.',
      },
      {
        type: 'ul',
        items: [
          'Best for: long-term personal records, and anyone who does not want to run a server',
          'Licence: GNU GPL',
          'Runs as: desktop application on Windows, macOS, and Linux',
          'Weak spot: dated interface, no real mobile story, and syncing across devices is on you',
        ],
      },
      {
        type: 'h2',
        text: 'How to Combine Them Without Creating a Second Job',
      },
      {
        type: 'p',
        text: 'Running five finance apps is a hobby, not a system. Two is usually the right number for an individual: one tool that answers "where is my money going" and one that answers "what is still charging me". Add a third only when you have a real portfolio to track.',
      },
      {
        type: 'ul',
        items: [
          'Light setup: Actual Budget for the monthly plan, Suprascribe for recurring charges',
          'Full setup: Firefly III as the ledger, Suprascribe for subscriptions, Ghostfolio for investments',
          'No-server setup: GnuCash on your desktop, Suprascribe in the browser for the subscription side',
        ],
      },
      {
        type: 'p',
        text: 'The order matters more than the stack. Start with the tool that recovers money in the first session, then add the one that requires a habit - a system you abandon in week three saves nothing, however well designed it is.',
        links: [
          { text: 'recovers money in the first session', href: '/blog/how-to-save-money-fast' },
        ],
      },
      {
        type: 'h2',
        text: 'Start With the Money Already Leaving Your Account',
      },
      {
        type: 'p',
        text: 'Budgeting, ledgers, and portfolio tracking all pay off gradually, and all of them ask you to keep doing something. Cancelling a subscription you had forgotten pays off immediately and then keeps paying every month without further effort, because a cancelled subscription stays cancelled.',
      },
      {
        type: 'p',
        text: 'So do the audit first. Add up every recurring charge, cancel what you are not using, and only then decide which budgeting tool you are going to live with. The list you produce is also the input the other tools need - fixed monthly outgoings are the part of a budget everyone underestimates.',
        links: [{ text: 'Add up every recurring charge', href: '/subscription-cost-calculator' }],
      },
      {
        type: 'callout',
        text: 'Suprascribe is open source and free for manual subscription tracking - no bank access required. Pro scans your inbox for the recurring charges you have forgotten and emails you before each renewal, as a one-time payment rather than a subscription of its own.',
      },
    ],
  },
  {
    slug: 'what-is-a-subscription-tracker',
    topics: ['tools', 'discovery'],
    title: 'What Is a Subscription Tracker? A Practical Guide for 2026',
    description:
      'A subscription tracker helps you see every recurring charge in one place. Learn how they work, what types exist, and how to pick one that actually protects your privacy.',
    publishedAt: '2026-08-28',
    updatedAt: '2026-09-02',
    readingTimeMin: 8,
    intro:
      'A subscription tracker is a tool that lists every service you pay for regularly - streaming, software, fitness apps, cloud storage, news - with the amount, billing cycle, and renewal date. The point is simple: stop paying for things you forgot you signed up for.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
      'What is the best free app to track subscriptions?',
    ],
    faq: [
      {
        question: 'What does a subscription tracker actually do?',
        answer:
          'Four jobs. Discovery: finding every active subscription you are paying for. Organisation: showing costs, billing cycles and renewal dates in one view. Reminders: telling you before a charge or a price increase lands. And cancellation support: making it easier to leave a service. The difference between a useful tracker and an abandoned spreadsheet is how much of that happens without you.',
      },
      {
        question: 'What types of subscription tracker are there?',
        answer:
          'Three. Manual-entry trackers, where you type in everything you already remember. Bank-linked trackers, which read your full transaction history to detect recurring charges. And email-based trackers, which read billing receipts. The email-based ones give you the same automatic discovery as bank-linked apps without exposing your financial accounts.',
      },
    ],
    relatedSlugs: [
      'best-subscription-tracker-app',
      'best-free-subscription-manager',
      'how-to-find-all-your-subscriptions',
    ],
    relatedPageLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      { href: '/compare', label: 'Compare All Trackers' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: A subscription tracker is a dashboard for your recurring payments. The best ones find your subscriptions automatically, do not require bank access, and remind you before renewals. They come in three types: manual entry, bank-linked, and email-based. Email-based trackers like Suprascribe give you the same automatic discovery as bank-linked apps without exposing your financial accounts.',
      },
      {
        type: 'p',
        text: 'Most people do not know how many subscriptions they have. Not because they are careless, but because the subscriptions are scattered across app stores, PayPal, credit cards, and direct debits. A subscription tracker collects them into one place so you can see the total, spot what you no longer use, and cancel before the next charge.',
      },
      {
        type: 'h2',
        text: 'What a Subscription Tracker Actually Does',
      },
      {
        type: 'p',
        text: 'At minimum, a subscription tracker stores a list of services with their cost and renewal date. At best, it discovers them for you, keeps the list current, and alerts you before a payment goes through. The core jobs are:',
      },
      {
        type: 'ul',
        items: [
          'Discovery: automatically finding every active subscription you are paying for',
          'Organisation: showing costs, cycles, and renewal dates in one view',
          'Reminders: notifying you before a charge or price increase',
          'Cancellation support: making it easier to leave services you no longer want',
        ],
        links: [
          {
            text: 'automatically finding every active subscription',
            href: '/blog/how-to-find-all-your-subscriptions',
          },
        ],
      },
      {
        type: 'image',
        image: {
          src: '/blog/subscription-dashboard-dark.png',
          alt: 'Subscription tracker dashboard: a donut chart breaking the monthly total down by service, and below it each subscription with its cost, billing cycle and renewal date',
          caption:
            'What the organisation job looks like in practice - one total, one list, and the next renewal date on every row.',
          width: 819,
          height: 828,
        },
      },
      {
        type: 'p',
        text: 'The difference between a useful tracker and a forgotten spreadsheet is automation. If you have to update it by hand every time a trial converts or a price changes, it will drift out of date and stop saving you money.',
      },
      {
        type: 'h2',
        text: 'The Three Types of Subscription Tracker',
      },
      {
        type: 'table',
        table: {
          caption: 'The three kinds of subscription tracker',
          rowHeaders: true,
          headers: ['Type', 'How it finds your subscriptions', 'The trade-off'],
          rows: [
            [
              'Manual',
              'You type each one in',
              'Total privacy, but anything you forgot stays invisible',
            ],
            [
              'Bank-linked',
              'Reads your transaction history',
              'Automatic, but it sees every purchase you make',
            ],
            [
              'Email-based',
              'Reads billing receipts in your inbox',
              'Automatic without bank access, but misses anything that never emailed you',
            ],
          ],
        },
      },
      {
        type: 'h3',
        text: '1. Manual trackers',
      },
      {
        type: 'p',
        text: 'You enter every subscription yourself. Apps like Bobby and Subby fall here, as does any spreadsheet. The upside is total privacy and control. The downside is that forgotten subscriptions stay forgotten - the very problem you are trying to solve.',
      },
      {
        type: 'h3',
        text: '2. Bank-linked trackers',
      },
      {
        type: 'p',
        text: 'Apps like Rocket Money, PocketGuard, and Truebill connect to your bank through Plaid and detect recurring charges from your transaction history. They are powerful, but they need read access to your full financial life to find a handful of subscriptions. They also tend to charge a monthly fee.',
      },
      {
        type: 'h3',
        text: '3. Email-based trackers',
      },
      {
        type: 'p',
        text: 'These tools scan your inbox for receipts, renewal notices, and billing confirmations. Because every subscription sends email, the result is usually the same as a bank-linked app - but the app only sees subscription-related messages, not your entire transaction history. Suprascribe is in this category.',
      },
      {
        type: 'callout',
        text: 'Bank-linked apps read everything you buy. Email-based trackers read only the emails that prove you are paying for a subscription. For most users, the second option is the better privacy trade-off.',
      },
      {
        type: 'h2',
        text: 'What to Look For in a Subscription Tracker',
      },
      {
        type: 'ul',
        items: [
          'Automatic discovery on the free or affordable tier',
          'No requirement to link your bank account',
          'Unlimited subscriptions, or a generous free cap',
          'Renewal reminders before charges hit',
          'Multi-currency support if you pay in more than one currency',
          'A cancellation path that does not require hunting through support pages',
        ],
      },
      {
        type: 'p',
        text: 'Be suspicious of any subscription manager that charges a monthly subscription. Paying a recurring fee to manage your recurring fees is the problem dressed up as the solution.',
      },
      {
        type: 'h2',
        text: 'Honest Comparison: The Main Options',
      },
      {
        type: 'p',
        text: 'Here is how the biggest names compare on the questions that actually matter:',
      },
      {
        type: 'ul',
        items: [
          'Rocket Money: strong auto-discovery and bill negotiation, but requires full bank access via Plaid and charges a monthly premium',
          'PocketGuard: full budgeting plus subscription detection, also bank-linked, also monthly or annual',
          'Bobby: polished iOS manual tracker, one-time unlock, but Apple-only and capped on the free tier',
          'Subby: unlimited free manual tracker, ad-supported, mobile-only',
          'YNAB: excellent budgeting methodology, significant overkill if you only want subscriptions, ~$109/year',
          'Suprascribe: email-based auto-discovery, unlimited free tier, no bank access, one-time Pro upgrade',
        ],
        links: [{ text: 'Bobby', href: '/compare/bobby' }],
      },
      {
        type: 'p',
        text: 'If you want budgeting alongside tracking, Rocket Money or PocketGuard are the strongest bank-linked choices. If you want automatic discovery without handing over your bank login, an email-based tracker is the better fit.',
        links: [
          { text: 'Rocket Money', href: '/compare/rocket-money' },
          { text: 'PocketGuard', href: '/compare/pocketguard' },
        ],
      },
      {
        type: 'h2',
        text: 'How to Choose',
      },
      {
        type: 'p',
        text: 'Start by deciding whether you are comfortable linking your bank. If not, you have already eliminated most of the market leaders. Then decide whether you want to enter subscriptions manually or have them found for you. Most people who are serious about cutting waste choose automatic discovery - the forgotten subscriptions are where the money is.',
      },
      {
        type: 'p',
        text: 'A subscription tracker should make the total visible, turn renewals into conscious decisions, and get out of the way. The tool itself should not become another subscription.',
      },
      {
        type: 'h2',
        text: 'Why Suprascribe Fits',
      },
      {
        type: 'p',
        text: 'Suprascribe scans Gmail, Outlook, iCloud, or any IMAP inbox to find subscriptions automatically. It does not store email content, it never touches your bank, and the free tier lets you track unlimited subscriptions manually. The Pro upgrade - auto-discovery, renewal reminders, calendar view, quick unsubscribe - is a one-time payment, not a recurring fee.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free to use for manual tracking, with no bank access required. See how it compares to the rest on the compare page.',
        links: [{ text: 'compare page', href: '/compare' }],
      },
    ],
  },
  {
    slug: 'best-free-subscription-tracker-no-bank-account',
    topics: ['tools', 'privacy'],
    title: 'Best Free Subscription Tracker Without Bank Linking: 2026 Picks',
    description:
      'The best free subscription trackers that do not require a bank account - honestly compared on discovery, privacy, limits, and recurring fees.',
    publishedAt: '2026-08-23',
    updatedAt: '2026-09-02',
    readingTimeMin: 7,
    intro:
      'Most free subscription trackers are not really free. They cap your list, show ads, or demand a bank login before they will find anything. Here are the honest picks for 2026.',
    faqQuestions: [
      'Is there a subscription tracker that does not require bank access?',
      'What is the best free app to track subscriptions?',
      'Is Suprascribe really free?',
    ],
    faq: [
      {
        question: 'Why avoid a tracker that requires bank linking?',
        answer:
          'Because the access is wildly out of proportion to the job. Plaid or Finicity hands over your entire transaction history - every coffee, every transfer, every medical payment - to find a handful of recurring charges. If an email-based tracker is breached, the exposure is a list of service names and prices; if a bank-linked one is breached, it is your financial life. Bank linking is also blind to any card you did not connect.',
      },
      {
        question: 'Is a spreadsheet better than a free tracker app?',
        answer:
          'It is more private and less likely to stay current. A sheet links to nothing and you control every field, but every new signup, price change and cancellation is a manual edit, and it cannot warn you before a renewal. It is the right choice if you are disciplined about upkeep and want zero third-party access - and the wrong one if the problem you are solving is subscriptions you have forgotten.',
      },
    ],
    relatedSlugs: [
      'best-free-subscription-manager',
      'best-subscription-tracker-app',
      'subscription-tracker-spreadsheet-template',
    ],
    relatedPageLinks: [
      {
        href: '/subscription-tracker-without-bank-account',
        label: 'Tracker With No Bank Linking',
      },
      { href: '/compare', label: 'Compare All Trackers' },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
    ],
    sections: [
      {
        type: 'callout',
        text: 'TL;DR: The best free subscription tracker without bank linking is one that discovers subscriptions automatically without touching your financial accounts. Suprascribe leads for email-based auto-discovery with an unlimited free tier. Bobby is the best iOS-only manual tracker. Subby is the best ad-supported manual tracker. A spreadsheet is the most private option of all, but it cannot remind you before renewals.',
      },
      {
        type: 'p',
        text: 'The phrase "free subscription tracker" is used loosely. Some apps are free for five subscriptions. Some are free if you manually type everything. Some are free only after you hand over your bank login so they can upsell you later. This guide focuses on trackers that are genuinely free and genuinely private - no bank access required.',
      },
      {
        type: 'h2',
        text: 'Why "No Bank Linking" Matters',
      },
      {
        type: 'diagram',
        diagram: {
          kind: 'compare-columns',
          alt: 'A bank-linked tracker needs your full transaction history through Plaid or Finicity. A tracker that scans your inbox reads billing receipts only and never touches a financial account.',
          data: {
            left: {
              title: 'Needs your bank',
              points: [
                { text: 'Sees every transaction, not just subscriptions', good: false },
                { text: 'A breach exposes your financial history', good: false },
                { text: 'Blind to cards you did not connect', good: false },
                { text: 'Finds charges automatically', good: true },
              ],
            },
            right: {
              title: 'Reads your inbox',
              points: [
                { text: 'Sees billing receipts and nothing else', good: true },
                { text: 'A breach exposes service names and prices', good: true },
                { text: 'Catches charges on any card', good: true },
                { text: 'Finds charges automatically', good: true },
              ],
            },
          },
        },
      },
      {
        type: 'p',
        text: 'Bank-linked apps like Rocket Money and PocketGuard need access to your full transaction history through Plaid or Finicity. They see every coffee, every grocery shop, every transfer - just to find a few recurring charges. That is a lot of exposure for a narrow job.',
      },
      {
        type: 'p',
        text: 'A tracker that works without bank linking relies on your inbox instead. Every subscription sends receipts and renewal notices, so an inbox scan finds the same charges with far less access. The only data involved is the list of services you pay for.',
      },
      {
        type: 'image',
        image: {
          src: '/blog/autodiscovery-inbox-providers.png',
          alt: 'Connection screen offering Gmail, Outlook and iCloud and no bank or card option, with a note that only subscription-related email data is read and no credentials are stored',
          caption:
            'What a no-bank-linking tracker asks for: an inbox, not a financial account. Nothing on this screen connects to a bank.',
          width: 712,
          height: 801,
        },
      },
      {
        type: 'h2',
        text: 'The Honest Shortlist',
      },
      {
        type: 'table',
        table: {
          caption: 'Four ways to track subscriptions without linking a bank',
          rowHeaders: true,
          headers: ['Tool', 'Free tier', 'Discovery', 'Platform', 'Paid upgrade'],
          rows: [
            [
              'Suprascribe',
              'Unlimited, no credit card',
              'Email-based, no bank login',
              'Any browser, works as a PWA',
              'One-time, not monthly',
            ],
            [
              'Bobby',
              'Up to 5 subscriptions',
              'Manual only',
              'iOS only',
              'Small one-time purchase',
            ],
            [
              'Subby',
              'Unlimited, ad-supported',
              'Manual only',
              'Mobile only',
              'Small one-time purchase removes ads',
            ],
            ['A spreadsheet', 'Unlimited', 'Manual only', 'Anywhere you can open a sheet', 'None'],
          ],
        },
      },
      {
        type: 'h3',
        text: '1. Suprascribe - Best free tracker with automatic discovery',
      },
      {
        type: 'p',
        text: 'Suprascribe is web-based, open source, and free for unlimited manual tracking. Connect Gmail, Outlook, or iCloud via OAuth and it scans your inbox for subscription-related emails automatically. No bank access, no stored email content, no subscription cap. Pro adds renewal reminders and a calendar view for a one-time payment.',
        links: [{ text: 'Suprascribe', href: '/free-subscription-tracker' }],
      },
      {
        type: 'h3',
        text: '2. Bobby - Best iOS manual tracker',
      },
      {
        type: 'p',
        text: 'Bobby is a polished, Apple-only tracker with a clean interface and a small one-time unlock. It is fully manual, so you enter every subscription yourself, and the free tier is capped at five subscriptions. Great for iPhone users who want something simple and private.',
      },
      {
        type: 'h3',
        text: '3. Subby - Best no-frills manual tracker',
      },
      {
        type: 'p',
        text: 'Subby is mobile-only and ad-supported, but the free tier is genuinely unlimited and the interface is straightforward. If you do not mind ads and want a simple manual tracker, it is a solid choice.',
      },
      {
        type: 'h3',
        text: '4. A spreadsheet - Best for total control',
      },
      {
        type: 'p',
        text: 'A Google Sheets or Excel tracker costs nothing and links to nothing. The trade-off is upkeep: every new signup, price change, and cancellation is a manual edit, and a spreadsheet cannot ping you before a renewal. It is the most private option and the least likely to stay current.',
      },
      {
        type: 'h2',
        text: 'What "Free" Should Mean',
      },
      {
        type: 'p',
        text: 'A genuinely free subscription tracker should not do any of the following:',
      },
      {
        type: 'ul',
        items: [
          'Cap the free tier at a number most people exceed',
          'Require bank access before showing any value',
          'Lock basic features like reminders or sorting behind a paywall',
          'Charge a recurring fee for the privilege of tracking recurring fees',
        ],
      },
      {
        type: 'h2',
        text: 'Which One Should You Choose?',
      },
      {
        type: 'p',
        text: 'If you want automatic discovery without bank access, Suprascribe is the pick. If you live entirely on an iPhone and do not mind typing, Bobby is the nicer experience. If you want unlimited free tracking and do not mind ads, Subby works. If you want maximum privacy and are disciplined about upkeep, a spreadsheet is fine.',
      },
      {
        type: 'p',
        text: 'The one to avoid is any tracker that makes you link your bank before it will help. You do not need to expose your entire transaction history to find a few subscriptions.',
      },
      {
        type: 'callout',
        text: 'Suprascribe is free forever for manual tracking and finds subscriptions automatically by scanning your email - no bank login, no monthly fee. Start for free or see how it compares to Rocket Money, Bobby, and the rest.',
        links: [
          { text: 'Start for free', href: '/login?tab=signup' },
          { text: 'see how it compares', href: '/compare' },
        ],
      },
    ],
  },
]
