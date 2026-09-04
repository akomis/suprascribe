import type { BlogPost } from '../types'

export const moneyGuides: BlogPost[] = [
  {
    slug: 'subscription-fatigue',
    topics: ['money', 'discovery'],
    title: 'Subscription fatigue: how to audit and take back control of your monthly spending',
    description:
      'Subscription fatigue is the slow drain of too many small recurring charges. Here is how to audit your subscriptions and stop paying for things you do not use.',
    publishedAt: '2026-04-14',
    updatedAt: '2026-09-02',
    readingTimeMin: 6,
    intro:
      'A streaming service here, a cloud backup there - individually small, collectively significant. Subscription fatigue is real, and the fix starts with a proper audit.',
    faqQuestions: [
      'Is Suprascribe really free?',
      "What's the difference between Basic and Pro?",
      'How do renewal reminders work?',
    ],
    faq: [
      {
        question: 'How often should I audit my subscriptions?',
        answer:
          'Twice a year is enough for most people. Any less and annual renewals slip through unnoticed for a full billing cycle; any more and you are re-reading the same list. Pick two fixed dates you will remember - the start of the year and the middle of it works well - and do the whole audit in one sitting each time.',
      },
      {
        question: 'Should I pause a subscription instead of cancelling it?',
        answer:
          "Pause is usually the provider's retention tool rather than a favour to you. It keeps your account, your payment method and your habit intact, and most pauses expire automatically back into billing. Pause is worth using when you know the specific month you will come back. If you are pausing because you cannot decide, cancel - re-subscribing later takes about a minute, and you keep the money in the meantime.",
      },
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
        type: 'table',
        table: {
          caption: 'What to do with each answer',
          rowHeaders: true,
          headers: ['Your answer', 'What it means', 'What to do'],
          rows: [
            ['Used in the last 30 days', 'It is earning its cost', 'Keep it'],
            [
              'Not used, but I will in the next 30',
              'Dormant rather than dead',
              'Keep it and set a renewal reminder',
            ],
            ['Neither', 'This is the money leaving for nothing', 'Cancel it'],
          ],
        },
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
    slug: 'how-to-find-hidden-subscriptions-bank-statement',
    topics: ['discovery', 'money'],
    title: 'How to find hidden subscriptions on your bank statement',
    description:
      'How to find hidden subscriptions on your bank statement in a 30-minute audit - reading a statement, decoding cryptic labels like APPLE.COM/BILL and GOOGLE *, and checking every app store.',
    publishedAt: '2026-07-26',
    updatedAt: '2026-09-02',
    readingTimeMin: 6,
    intro:
      'The subscriptions draining the most money are the ones you never see, because they hide behind cryptic statement labels and app-store billing. This is a straightforward audit that surfaces all of them in about half an hour.',
    faqQuestions: [
      'How do I find all my subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
    ],
    faq: [
      {
        question: 'How many months of bank statements should I check?',
        answer:
          'Three months to find the monthly charges, then a full twelve to catch the annual ones. The twelve-month pass matters more than it sounds: annual subscriptions charge once and stay invisible for the other eleven months, and they are usually the largest single amounts on the list.',
      },
      {
        question: 'What does APPLE.COM/BILL mean on my bank statement?',
        answer:
          'It is an App Store or Apple subscription, but the statement does not say which one. Apple bills everything through the same descriptor, so a single APPLE.COM/BILL line could be iCloud storage, an app subscription, or Apple TV+. The only way to identify it is to open Settings, tap your name, and read the Subscriptions list directly.',
      },
      {
        question: 'Why do some subscriptions never show up on my bank statement?',
        answer:
          'Because the charge is settled somewhere else first. Anything paid from a PayPal balance, a stored card you have forgotten, a gift-card balance, or a second account will not appear on the statement you are reading. This is why the statement pass alone is not enough - you also have to open each billing hub (Apple, Google Play, PayPal, Amazon) and read what is actually listed there.',
      },
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
        type: 'table',
        table: {
          caption: 'What cryptic statement labels actually mean',
          rowHeaders: true,
          headers: ['Statement label', 'What it actually is'],
          rows: [
            [
              'APPLE.COM/BILL',
              'An App Store or Apple subscription - the service name is not on the statement',
            ],
            ['GOOGLE *<name>', 'A Google Play charge - "GOOGLE *YouTube" is YouTube Premium'],
            ['PAYPAL *<name>', 'Billed through a PayPal automatic-payment agreement'],
            [
              'An unfamiliar company name',
              'A parent company or payment processor - search the name online',
            ],
          ],
        },
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
        text: 'The manual audit works, but it is slow and easy to abandon halfway. Your email inbox already holds a receipt or renewal notice for almost every subscription, which makes it a more complete record than any single statement. You can automatically find your subscriptions by scanning that inbox instead, assembling the same list in minutes - without ever touching your bank account, which is the part privacy-conscious people care about.',
        links: [
          {
            text: 'automatically find your subscriptions',
            href: '/blog/how-to-find-all-your-subscriptions',
          },
        ],
      },
      {
        type: 'callout',
        text: 'Suprascribe finds subscriptions by scanning your email, not your bank - no Plaid, no financial-account access. It is free for manual tracking; the inbox auto-discovery that surfaces hidden charges is a one-time Pro upgrade.',
      },
    ],
  },
  {
    slug: 'how-to-save-money-fast',
    topics: ['money'],
    title: 'How to Save Money Fast: 5 Things That Actually Work This Month',
    description:
      'How to save money fast: five practical ways to cut spending starting today - beginning with the recurring charges quietly leaving your account every month.',
    publishedAt: '2026-07-29',
    updatedAt: '2026-09-02',
    readingTimeMin: 7,
    intro:
      'Most saving advice asks you to change your habits and wait. These five take effect this month, and the second one is usually the biggest single win available - because it cuts money you are already spending on things you are not using.',
    faqQuestions: [
      'What is the fastest way to cut my monthly spending?',
      'How much does the average person spend on subscriptions?',
    ],
    faq: [
      {
        question: 'How much can I actually save by cancelling unused subscriptions?',
        answer:
          'The 2025 CNET/YouGov survey put average American subscription spending at about $90 a month, with roughly $17 of that on services people barely use - around $205 a year. Your own number is the one that matters, and it is usually higher than you would guess, because the forgotten charges are by definition the ones you are not counting.',
      },
      {
        question: 'What is the fastest single thing I can do this month?',
        answer:
          'Cancel the recurring charges you are not using. Every other tactic asks you to change a future decision and then keep changing it; this one recovers money that is already leaving your account, takes one afternoon, and does not need to be repeated - a cancelled subscription stays cancelled.',
      },
      {
        question: 'Is it worth calling to renegotiate a bill, or should I just switch?',
        answer:
          'Get the competitor quote first, then call. The quote is what gives the call any weight - retention teams match numbers, not complaints. Switching outright usually wins slightly more, but it costs you an afternoon of setup, so matching an offer on your existing phone, broadband or insurance is the better return per hour for most people.',
      },
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
        type: 'table',
        table: {
          caption: 'The four billing hubs to check',
          rowHeaders: true,
          headers: ['Where to check', 'Path'],
          rows: [
            ['iPhone', 'Settings → [your name] → Subscriptions'],
            ['Android', 'Play Store → Subscriptions'],
            ['PayPal', 'Settings → Payments → Automatic payments'],
            ['Amazon', 'Account → Memberships & Subscriptions'],
          ],
        },
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
