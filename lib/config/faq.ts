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
]

export const featuredFaqItems = faqItems.slice(0, 5)
