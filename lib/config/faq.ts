export interface FAQItem {
  question: string
  answer: string
}

export const faqItems: FAQItem[] = [
  {
    question: 'Is Suprascribe really free?',
    answer:
      'Yes. The Basic tier is free forever with no credit card required. It includes core features like subscription management, manual adding, and multi-currency support. We will never change this.',
  },
  {
    question: 'How does auto-discovery work? Does it read all my emails?',
    answer:
      'Auto-discovery scans only for subscription-related emails using specific sender patterns and keywords. We never read unrelated emails, store email content, or retain any email data after scanning is complete. The scan is ephemeral - only the extracted subscription data is saved.',
  },
  {
    question: 'Which email providers are supported?',
    answer:
      'Suprascribe supports Gmail (via OAuth), Outlook/Hotmail (via OAuth), and iCloud Mail (via IMAP with an app-specific password). You can connect any provider through IMAP.',
  },
  {
    question: "What's the difference between Basic and Pro?",
    answer:
      'Basic gives you manual subscription management, complete history, and multi-currency support. Pro adds auto-discovery (scans your inbox to find subscriptions automatically), quick unsubscribe, search/sort/group, renewal reminders, a calendar view, and email support - all for a one-time payment.',
  },
  {
    question: 'Is my data safe and private?',
    answer:
      'Yes. Suprascribe is open source so you can verify exactly how your data is handled. We never sell your data, never read unrelated emails, and never store email content - never will. All subscription data is stored securely in your account only.',
  },
  {
    question: 'Is Pro really a one-time payment?',
    answer:
      'Absolutely. Pay once and own Pro features forever - no recurring charges, no subscription. If you ever need to manage subscriptions, you should not have to pay one yourself.',
  },
  {
    question: 'Can I use Suprascribe without connecting my email?',
    answer:
      'Yes. You can add and manage subscriptions manually without ever connecting an email account. Email integration is only required for auto-discovery.',
  },
  {
    question: 'How do renewal reminders work?',
    answer:
      'Pro users can set renewal reminders for their subscriptions. Suprascribe will notify you through email before a renewal date so you have time to decide whether to keep or cancel the service.',
  },
  {
    question: 'Is Suprascribe open source?',
    answer:
      'Yes. The full source code is available on GitHub. You can inspect how data is processed, contribute improvements, or self-host if you prefer.',
  },
  {
    question: 'How do I delete my account?',
    answer:
      'You can delete your account from the account settings page inside the dashboard. All your data is permanently removed immediately.',
  },
  {
    question: 'How do I find all my subscriptions?',
    answer:
      "The easiest way is to use Suprascribe's email auto-discovery (Pro feature). Connect your Gmail, Outlook, or iCloud account and Suprascribe scans for subscription-related emails automatically, building your list without any manual work. If you prefer not to connect email, you can add subscriptions manually from the dashboard.",
  },
  {
    question: 'What is the best free app to track subscriptions?',
    answer:
      'Suprascribe offers one of the most generous free tiers available - unlimited manual subscriptions, multi-currency support, and a full dashboard at no cost. Unlike most subscription trackers, the free tier has no cap on how many subscriptions you can add and never requires a credit card.',
  },
  {
    question: 'Can Suprascribe detect subscriptions from Gmail?',
    answer:
      'Yes. Suprascribe connects to Gmail via OAuth and scans for subscription-related emails - receipts, billing confirmations, and renewal notices. Only emails matching subscription patterns are analyzed; unrelated emails are never read or stored.',
  },
  {
    question: 'Does Suprascribe work on iPhone and Android?',
    answer:
      'Suprascribe is a web-first app that works in any modern browser on any device - iPhone, Android, desktop, or tablet. There is no app download required. You can also install it as a PWA (Progressive Web App) from your browser for a native-like experience.',
  },
  {
    question: 'Is Suprascribe on the App Store or Google Play?',
    answer:
      'No. Suprascribe is a web app, so there is nothing to download from the App Store or Google Play. Open it in your browser and install it to your home screen or desktop - on iPhone use Share then Add to Home Screen, on Android or desktop Chrome use the install prompt in the address bar. Installed, it runs in its own window with an app icon and gives you exactly the same experience as a store-downloaded app, while updating automatically with no store approval delays. Staying off the stores also avoids their commission on every purchase, which is a cost that would otherwise be passed on to you - it is part of how Pro stays a low one-time payment.',
  },
  {
    question: 'How do I cancel a subscription I forgot about?',
    answer:
      "Once Suprascribe discovers or you add a subscription, you can view the service name and billing details. Pro users get access to quick unsubscribe assistance to help navigate cancellation. For many services, going directly to the provider's account settings is the fastest route - Suprascribe gives you the information you need to do that.",
  },
  {
    question: 'How does Suprascribe compare to Mint for subscription tracking?',
    answer:
      'Mint (now discontinued) required bank account linking to detect subscriptions. Suprascribe uses email scanning instead - no bank access, no financial data exposure. Suprascribe is purpose-built for subscription tracking rather than general budgeting, so the experience is more focused and the free tier is more generous.',
  },
  {
    question: 'Is there a subscription tracker that does not require bank access?',
    answer:
      'Yes - Suprascribe. Most subscription detection tools like Rocket Money or PocketGuard require connecting your bank account via Plaid. Suprascribe finds subscriptions by scanning your email inbox instead, which means your financial accounts are never touched.',
  },
  {
    question: 'How do I calculate my total monthly subscription cost?',
    answer:
      'Normalise every subscription to the same billing period, then add them up. Divide a yearly price by 12, divide a quarterly price by 3, and multiply a weekly price by 52/12 (about 4.33). A €120/year plan is €10/month, a €30/quarter plan is €10/month, and a €5/week plan is €21.67/month. Multiply the monthly total by 12 for the yearly figure.',
  },
  {
    question: 'How much does the average person spend on subscriptions?',
    answer:
      'Most people underestimate their subscription spend by a wide margin, because the small recurring charges are the easiest to forget. The number that matters is your own: total up the ones you remember, then scan your inbox for the ones you do not. Forgotten trials, annual renewals, and app subscriptions are where the surprises usually hide.',
  },
  {
    question: 'Do I need an account to use the subscription calculator?',
    answer:
      'No. The calculator is free and runs entirely in your browser - nothing is sent to a server and nothing is stored. You only need an account if you want to save your subscriptions, get renewal reminders, or have Suprascribe scan your inbox to find the ones you forgot.',
  },
  {
    question: 'How do I cancel a subscription on my iPhone?',
    answer:
      'Open Settings, tap your name at the top, tap Subscriptions, select the subscription, and tap Cancel Subscription. If there is no Cancel button, it is already cancelled. Note that this screen only lists subscriptions billed through Apple - anything charged directly to your card by the company never appears there, which is where most forgotten subscriptions hide.',
  },
  {
    question: 'How do I cancel a subscription on Android?',
    answer:
      'Open the Play Store, go to Subscriptions, select the subscription, and tap Cancel subscription. Uninstalling the app does not cancel anything. Google Play also lets you pause payments for one week to three months instead of cancelling outright. As with Apple, this only covers subscriptions billed through Google Play - direct merchant charges are not listed.',
  },
  {
    question: 'What is the fastest way to cut my monthly spending?',
    answer:
      'Audit your recurring payments first. Unlike cutting discretionary spending, cancelling an unused subscription costs you nothing in quality of life and the saving repeats every month without further effort. Build one list of every recurring charge from your app stores, PayPal, and three months of bank statements, then cancel anything you have not used in the last month.',
  },
  {
    question: 'Can I use Suprascribe to track business subscriptions?',
    answer:
      'Yes. Connect the inbox that receives your vendor invoices - typically the owner or billing address - and Suprascribe builds a list of every recurring tool you pay for. Subscriptions can be grouped by category, payment method, or the inbox they were found in, and multi-currency support handles USD-billed software charged to a EUR account. Suprascribe is a single-account tool: one person holds the list, rather than a shared team workspace.',
  },
  {
    question: 'How do I keep track of SaaS renewals so they do not auto-renew?',
    answer:
      'Annual plans are the ones that catch people out, because the renewal arrives eleven months after anyone last thought about the tool. Put every subscription into one list with its renewal date, then set a renewal reminder a few days ahead so the decision to keep or cancel happens before the charge, not after. Suprascribe Pro sends those reminders by email and shows all renewal dates on a calendar.',
  },
  {
    question: 'How do I track software spend at an early-stage startup?',
    answer:
      'Scan the inbox that receives your billing receipts rather than reconstructing spend from a bank statement, because most developer tools bill through Stripe or an app store under names that do not match the product. Once every tool is in one list you can see the real monthly total, spot trials that converted into paid plans, and cancel what the team stopped using. No bank or card connection is required.',
  },
  {
    question: 'How do I stop free trials from turning into paid subscriptions?',
    answer:
      'Record the trial the day you start it, with the date it converts. Trials rarely send a warning before the first charge, but they almost always send a signup confirmation, which is why an inbox scan catches them. Suprascribe Pro can set a reminder before the conversion date so you decide deliberately instead of discovering the charge a month later.',
  },
  {
    question: 'How do I separate business and personal subscriptions?',
    answer:
      'Group them. Suprascribe lets you group your subscriptions by category, by payment method, or by the inbox each one was discovered in - so if your work receipts go to one address and personal ones to another, the split is automatic. If you use one inbox for everything, categorise each subscription once and the totals stay separated from then on.',
  },
  {
    question: 'Can freelancers use Suprascribe to track deductible subscriptions?',
    answer:
      'Yes. Suprascribe gives you a complete list of your recurring tools with amounts, currencies, and billing frequencies, grouped however you need - which is the record you want when working out which software costs are business expenses. It is a tracker rather than accounting software: it will not file anything for you, but it makes sure nothing is missing from the list you hand to your accountant.',
  },
  {
    question: "Can I track my family's subscriptions in one place?",
    answer:
      'Yes. Household subscriptions are usually spread across several inboxes and app store accounts, so run discovery on each inbox that receives receipts - Suprascribe tags every subscription with the inbox it came from and you can group by that, by payment method, or by category. Everything lives in one account, which in practice means whoever manages the household bills keeps the list.',
  },
  {
    question: 'How do I find duplicate subscriptions in my household?',
    answer:
      'Duplicates happen when two people in the same home pay for the same service separately, or when an individual plan keeps billing after someone joins a family plan. Put every household subscription into one list and sort by service - overlapping streaming, music, and cloud storage plans become obvious immediately, and family tiers are usually cheaper than two individual ones.',
  },
  {
    question: 'How can students keep track of subscriptions on a small budget?',
    answer:
      'Start from your inbox rather than your bank app, because most student subscriptions bill through an app store or PayPal under a merchant name that tells you nothing. Scan the address you signed up with - usually a personal Gmail plus a university address - and you get one list with the real monthly total. Suprascribe tracks unlimited subscriptions for free, and Pro is a one-time payment rather than another recurring charge.',
  },
  {
    question: 'What happens to my student discount when I graduate?',
    answer:
      'Student pricing is time-limited and verification-based. When the discount period ends or re-verification fails, the plan usually converts to the full adult price automatically and the first full-price charge is the only notice you get. Record each student plan with the date its discount expires and set a reminder ahead of it, so you decide whether the full price is worth it before it is charged. Suprascribe Pro sends those reminders by email and shows every renewal on a calendar.',
  },
  {
    question: 'What is the best open source personal finance app?',
    answer:
      'There is no single best one, because the good open source finance apps each do one job. Actual Budget is the strongest envelope-budgeting tool, Firefly III is the most complete self-hosted ledger, Ghostfolio handles investments, GnuCash covers desktop double-entry accounting with no server, and Suprascribe tracks recurring subscriptions from your inbox. Most individuals need two: one for day-to-day spending and one for subscriptions.',
  },
  {
    question: 'Can I self-host my own subscription tracker?',
    answer:
      'Yes. Suprascribe is AGPL-3.0 licensed with the full source on GitHub, so you can run it on your own infrastructure instead of using the hosted version. Wallos is another self-hosted option, though it relies on entering every subscription manually - which only captures the ones you already remember.',
  },
]

export const featuredFaqItems = faqItems.slice(0, 5)
