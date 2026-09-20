import type { BlogTopic } from './blog/types'

/**
 * The five "subscription tracking for X" pages, as data.
 *
 * They were five near-identical files: same imports, same schema graph bar the audience, same
 * six-card grid, same two sections. Only the words differed. This holds the words; the shape lives
 * once in components/shared/AudiencePage.
 *
 * Each page keeps its own route under app/(seo) rather than collapsing into a dynamic segment.
 * A dynamic segment at the root of the group - app/(seo)/[audience] - would match every unmatched
 * top-level path on the site and break 404s, and Next has no partial-segment form that would match
 * only "subscription-tracking-for-*". So the five files stay, six lines each, and only the bodies
 * moved here.
 */

/**
 * A run of prose. `lead` is the bold sentence opener the pages use to head a paragraph; `emphasis`
 * is for phrases bolded mid-sentence, matched on first occurrence the way the blog's own inline
 * links are. A phrase that no longer appears in `text` after a copy edit is skipped rather than
 * throwing - the text still reads correctly, it just loses the emphasis.
 */
export interface RichText {
  text: string
  lead?: string
  emphasis?: string[]
}

export interface AudiencePageConfig {
  id: AudienceId
  path: string
  topics: BlogTopic[]
  metaTitle: string
  metaDescription: string
  /** schema.org Audience audienceType. */
  audienceType: string
  schemaDescription: string
  breadcrumbName: string
  h1: string
  intro: string
  relatedHeading: string
  relatedDescription: string
  faqQuestions: string[]
  toolsHeading: string
  toolsIntro: string
  tools: { name: string; why: string }[]
  toolsTotal: RichText
  whyTitle: string
  whyParagraphs: RichText[]
  helpsTitle: string
  helpsParagraphs: RichText[]
  cardTitle: string
  cardBullets: RichText[]
  cardFootnote: string
}

export type AudienceId = 'business' | 'startups' | 'freelancers' | 'families' | 'students'

export const audiencePages: Record<AudienceId, AudiencePageConfig> = {
  business: {
    id: 'business',
    path: '/subscription-tracking-for-business',
    topics: ['software', 'money', 'tools'],
    metaTitle: 'Subscription Tracking for Business',
    metaDescription:
      'Track every business subscription in one place. Suprascribe finds recurring software charges in your billing inbox - no bank access, no per-seat fee.',
    audienceType: 'Business owners and small business operators',
    schemaDescription:
      'Subscription tracker for businesses. Finds recurring software charges by scanning the billing inbox instead of linking a bank account - group by category, payment method, or source inbox, with renewal reminders and multi-currency support.',
    breadcrumbName: 'Subscription Tracking for Business',
    h1: 'Subscription Tracking for Business',
    intro:
      'Subscription tracking for business starts with a problem: every company ends up paying for software nobody remembers buying. Suprascribe builds a complete list of your recurring tools by scanning the inbox your invoices already land in - no bank connection, no per-seat pricing, and no monthly fee for the privilege of tracking your monthly fees.',
    relatedHeading: 'Subscription tracking for all',
    relatedDescription: 'The same tracker, different situations',
    faqQuestions: [
      'Can I use Suprascribe to track business subscriptions?',
      'How do I keep track of SaaS renewals so they do not auto-renew?',
      'Is there a subscription tracker that does not require bank access?',
      'How does auto-discovery work? Does it read all my emails?',
      'Is Suprascribe open source?',
      'Is PRO really a one-time payment?',
    ],
    toolsHeading: 'Subscriptions Almost Every Business Is Paying For',
    toolsIntro:
      'None of these are wasteful on their own. The problem is that no single person sees all of them at once.',
    tools: [
      {
        name: 'Slack',
        why: 'Priced per active user, so the bill grows quietly every time someone new is invited and never shrinks when they stop logging in.',
      },
      {
        name: 'Google Workspace',
        why: 'Accounts for people who have left keep billing until someone remembers to remove them. It is treated as infrastructure, so nobody reviews it.',
      },
      {
        name: 'Zoom',
        why: 'Bought for one project, kept forever. Extra host licences added for a busy quarter are almost never removed afterwards.',
      },
      {
        name: 'QuickBooks',
        why: 'Sits on a plan tier chosen years ago. Upgrades happen when a feature is needed; downgrades never happen when it is not.',
      },
      {
        name: 'Adobe Creative Cloud',
        why: 'Annual commitment billed monthly, with an early-termination fee. Cancelling in month three still costs you, so it renews by default.',
      },
      {
        name: 'Dropbox Business',
        why: 'Priced per user with a storage floor, so a three-person team pays a minimum seat count. Old shared folders keep it justified long after the files stopped being opened.',
      },
    ],
    toolsTotal: {
      text: 'For a small team, these together typically run into the low hundreds per month - a few thousand a year, before anything else on the card statement. Most of it is per-user pricing, so the total moves with headcount whether or not anyone is watching.',
      emphasis: ['low hundreds per month'],
    },
    whyTitle: 'Why Businesses Lose Track',
    whyParagraphs: [
      {
        text: 'Software gets bought the way it gets used: one person needs a tool, expenses it, and moves on. There is no moment in the calendar where somebody sits down and reads the full list of what the company pays for every month. The list only exists in fragments - a card statement here, an invoice folder there, a plan somebody chose in 2023.',
      },
      {
        lead: 'Renewals arrive without a decision.',
        text: 'Annual plans are the expensive ones, and they renew eleven months after anyone last thought about the tool. By the time the invoice appears, the money is gone and the refund window has usually closed.',
      },
      {
        lead: 'Bank statements hide the details.',
        text: 'Software billed through Stripe, an app store, or a reseller shows up under a merchant name that has nothing to do with the product. Your accounting export tells you money left; it does not reliably tell you what for.',
      },
      {
        lead: 'Per-seat pricing drifts upward.',
        text: 'Seats get added during a busy month and stay added. The unit price never changes, so nothing looks wrong - the total simply grows a little each quarter.',
      },
    ],
    helpsTitle: 'How Suprascribe Helps',
    helpsParagraphs: [
      {
        text: 'Your invoices already arrive somewhere. Suprascribe reads that inbox instead of your accounts, and turns it into one live list of everything you pay for on a recurring basis.',
      },
    ],
    cardTitle: 'What that looks like in practice',
    cardBullets: [
      {
        lead: 'Scan the inbox invoices land in.',
        text: 'Connect Gmail or Outlook via OAuth - or iCloud and any other provider over IMAP. Run discovery on more than one address if billing and general mail are separated, and group the results by source inbox.',
      },
      {
        lead: 'Group by category or payment method.',
        text: 'See which card or account each tool bills to, and which part of the business it belongs to, without exporting anything to a spreadsheet.',
      },
      {
        lead: 'Get renewal reminders before the charge.',
        text: 'PRO emails you ahead of a renewal date and shows every upcoming one on a calendar, so the keep-or-cancel decision happens while it still saves money.',
      },
      {
        lead: 'Handle multi-currency properly.',
        text: 'Most software bills in USD while the account is in EUR or GBP. Suprascribe tracks each subscription in its own currency rather than flattening everything.',
      },
      {
        lead: 'No bank connection to approve.',
        text: 'There is no Plaid link and no financial-account access, which removes the usual blocker on putting a finance tool in front of an accountant or an IT review.',
      },
    ],
    cardFootnote:
      'Suprascribe is a single-account tool - one person holds the list, rather than a shared workspace with seats. It is also open source, so the way your data is handled can be verified rather than trusted, and PRO is a one-time purchase instead of one more recurring line on the statement you are trying to shrink.',
  },
  startups: {
    id: 'startups',
    path: '/subscription-tracking-for-startups',
    topics: ['software', 'money', 'tools'],
    metaTitle: 'Subscription Tracking for Startups',
    metaDescription:
      'Track every tool your startup pays for. Suprascribe scans your billing inbox for converted trials, forgotten annual plans, and usage-based bills.',
    audienceType: 'Startup founders and early-stage teams',
    schemaDescription:
      'Subscription tracker for startups. Finds converted trials, forgotten annual plans, and recurring developer-tool charges by scanning the billing inbox - no bank linking, renewal reminders, multi-currency, one-time PRO purchase.',
    breadcrumbName: 'Subscription Tracking for Startups',
    h1: 'Subscription Tracking for Startups',
    intro:
      'Subscription tracking for startups matters because at seed stage your tooling bill is a real line in the burn rate, and it is made of thirty small charges nobody has added up. Suprascribe scans the inbox your receipts land in and turns it into one list - converted trials, annual plans, and all the tools the team stopped opening months ago.',
    relatedHeading: 'Subscription tracking for all',
    relatedDescription: 'The same tracker, different situations',
    faqQuestions: [
      'How do I track software spend at an early-stage startup?',
      'How do I stop free trials from turning into paid subscriptions?',
      'How do I keep track of SaaS renewals so they do not auto-renew?',
      'How does auto-discovery work? Does it read all my emails?',
      'Is Suprascribe open source?',
      'Is PRO really a one-time payment?',
    ],
    toolsHeading: 'Tools in Nearly Every Startup Stack',
    toolsIntro:
      'Each one was the right call when it was adopted. The question is whether it still is, at the seat count you are now paying for.',
    tools: [
      {
        name: 'AWS',
        why: 'Billed on usage rather than a flat fee, so it never looks like a subscription - which is exactly why it is the one nobody audits. A test cluster left running for a demo bills every hour until someone notices.',
      },
      {
        name: 'Vercel',
        why: 'The hobby plan is free until one project needs a team feature. After that the seat count tracks headcount, including people who only ever needed to look at a preview URL.',
      },
      {
        name: 'Notion',
        why: 'Invited early to everyone, including contractors and advisors. Guests are cheap or free; members are not, and the difference is easy to get wrong.',
      },
      {
        name: 'Figma',
        why: 'Billed per editor rather than per viewer. One engineer nudging a component once turns a free viewer seat into a paid editor seat for the rest of the year.',
      },
      {
        name: 'Linear',
        why: 'Adopted during a sprint when the team was smaller. It scales with headcount silently, and the annual plan renews long after anyone compared it to alternatives.',
      },
      {
        name: 'GitHub',
        why: 'Free until the first private-repo team feature, then billed per seat - with Copilot as a second per-seat charge on top. Contractor accounts from a finished project keep billing on both.',
      },
    ],
    toolsTotal: {
      text: 'Most of these are per-seat, so a team of three or four is usually looking at a few hundred a month before infra is counted at all - and AWS on top of that has no ceiling, only a bill. Against a seed runway, the tooling line is rarely the number founders expect it to be.',
      emphasis: ['a few hundred a month'],
    },
    whyTitle: 'Why Tooling Spend Escapes Early-Stage Teams',
    whyParagraphs: [
      {
        text: 'Startups adopt tools faster than they review them. A founder signs up during a prototype, an engineer starts a trial to unblock a deploy, and both charges settle into the card statement as small, unremarkable amounts. Individually none of them justify a meeting. Together they are often a meaningful fraction of monthly burn.',
      },
      {
        lead: 'Trials convert in silence.',
        text: 'Almost no product warns you before the first real charge, but every one of them sends a signup confirmation. The evidence of what you are about to start paying for is in your inbox weeks before it reaches your card.',
      },
      {
        lead: 'Annual plans outlive their usefulness.',
        text: 'The discount is real, and so is the twelve-month gap before anyone reconsiders. Tools get replaced in month four and keep billing until month twelve because the renewal date lives nowhere.',
      },
      {
        lead: 'The stack changes faster than the bill.',
        text: 'Pivots, framework swaps, and team churn all leave residue: a monitoring service for a deprecated app, a design seat for someone who left, a database on a plan sized for traffic you no longer have.',
      },
    ],
    helpsTitle: 'How Suprascribe Helps',
    helpsParagraphs: [
      {
        text: 'Developer tools bill through Stripe, app stores, and resellers under names that rarely match the product, so reconstructing the stack from a bank export is guesswork. Your receipts are already accurate - Suprascribe reads them and builds the list for you.',
      },
    ],
    cardTitle: 'What that looks like in practice',
    cardBullets: [
      {
        lead: 'Catch trials at signup, not at conversion.',
        text: 'Discovery picks up the confirmation emails trials send, so a converting plan can be recorded with its date before the first charge lands.',
      },
      {
        lead: 'See every renewal date on a calendar.',
        text: 'PRO emails a reminder ahead of each renewal, which is the only reliable way to catch an annual plan before it rolls for another year.',
      },
      {
        lead: 'Keep past subscriptions on the record.',
        text: 'Cancelled tools stay in your history, so you can see what the stack cost over time rather than only what it costs today.',
      },
      {
        lead: 'Track USD tools on a EUR account.',
        text: 'Multi-currency support keeps each subscription in the currency it actually bills in, which matters when most of your stack is priced in dollars.',
      },
      {
        lead: 'No bank or card linking.',
        text: 'Discovery uses read-only email access over OAuth. Your company accounts are never connected, and no email content is stored after a scan.',
      },
    ],
    cardFootnote:
      'Suprascribe is a single-account tool rather than a shared workspace with seats - the founder or whoever owns the card keeps the list. The free tier tracks unlimited subscriptions manually, and PRO is a one-time purchase, so cutting your SaaS bill does not start by adding another SaaS bill.',
  },
  freelancers: {
    id: 'freelancers',
    path: '/subscription-tracking-for-freelancers',
    topics: ['software', 'money', 'tools'],
    metaTitle: 'Subscription Tracking for Freelancers',
    metaDescription:
      'Track the tools you pay for as a freelancer and keep business subscriptions separate from personal. Suprascribe scans your inbox to build the list.',
    audienceType: 'Freelancers, contractors, and self-employed professionals',
    schemaDescription:
      'Subscription tracker for freelancers. Finds recurring tool charges by scanning your inbox and groups them by category, payment method, or source inbox so business subscriptions stay separate from personal ones.',
    breadcrumbName: 'Subscription Tracking for Freelancers',
    h1: 'Subscription Tracking for Freelancers',
    intro:
      'Subscription tracking for freelancers is messy: when you work for yourself, the line between a business tool and a personal one runs straight through your card statement. Suprascribe finds every recurring charge in your inbox and lets you group them by category, payment method, or the inbox they arrived in - so the split is obvious long before your accountant asks.',
    relatedHeading: 'Subscription tracking for all',
    relatedDescription: 'The same tracker, different situations',
    faqQuestions: [
      'How do I separate business and personal subscriptions?',
      'Can freelancers use Suprascribe to track deductible subscriptions?',
      'Is there a subscription tracker that does not require bank access?',
      'How do I find all my subscriptions?',
      'Is Suprascribe really free?',
      'Is PRO really a one-time payment?',
    ],
    toolsHeading: 'Subscriptions Most Freelancers Are Paying For',
    toolsIntro:
      'Small enough individually to ignore, large enough together to matter on an irregular income.',
    tools: [
      {
        name: 'Adobe Creative Cloud',
        why: 'The annual plan is billed monthly with an early-termination fee, so a quiet quarter still costs full price. Single-app plans are far cheaper if you only ever open one.',
      },
      {
        name: 'Canva PRO',
        why: 'Bought for one client deck and kept because it is cheap. Cheap and recurring is exactly the combination that survives every budget review.',
      },
      {
        name: 'Figma',
        why: 'Client work often arrives through their workspace, so your own paid editor seat can sit unused for months without any prompt to review it.',
      },
      {
        name: 'Notion',
        why: 'Doubles as personal notes and client project tracking, which makes it the classic example of a subscription that is only partly a business expense.',
      },
      {
        name: 'ChatGPT Plus',
        why: 'Charged to whichever card was on file when you signed up, usually the personal one, and then forgotten at the point where it matters most - tax time.',
      },
      {
        name: 'Google Workspace',
        why: 'Paid for the professional address on your own domain, then quietly used for personal mail too. It is small, annual in effect, and almost never revisited once the domain renews itself.',
      },
    ],
    toolsTotal: {
      text: 'Carrying all of them puts you somewhere north of a hundred a month, well over a thousand a year - and that is before the client-specific tools. It is a meaningful share of a slow month, and a meaningful deduction if the list is complete.',
      emphasis: ['somewhere north of a hundred a month, well over a thousand a year'],
    },
    whyTitle: 'Why This Is Harder When You Work for Yourself',
    whyParagraphs: [
      {
        text: 'A company has an expense process. You have a card. Tools get bought mid-project because a client needs something delivered on Thursday, charged to whichever account was convenient, and never sorted afterwards. The result is one undifferentiated stream of recurring payments where roughly half are deductible and nobody knows which half.',
      },
      {
        lead: 'Income is irregular; the subscriptions are not.',
        text: 'A fixed monthly tooling cost is easy to carry in a good month and genuinely painful in a slow one. Knowing the exact number is what lets you decide which tools are worth keeping through a quiet quarter.',
      },
      {
        lead: 'Deductions go unclaimed because the list is incomplete.',
        text: 'Most freelancers can name their three biggest tools and forget the six small ones. Those six are real business expenses, and they are only missing from the tax return because they were missing from the list.',
      },
      {
        lead: 'Client-driven tools accumulate.',
        text: 'One client wants files in a specific format, another uses a particular platform. Those subscriptions outlive the projects that justified them, because cancelling requires remembering they exist.',
      },
    ],
    helpsTitle: 'How Suprascribe Helps',
    helpsParagraphs: [
      {
        text: 'The receipts are already in your inbox, tagged with the amount, the service, and the date. Suprascribe reads them and turns that scattered record into one list you can sort the way your work is actually structured.',
      },
    ],
    cardTitle: 'What that looks like in practice',
    cardBullets: [
      {
        lead: 'Group by source inbox.',
        text: 'If work receipts go to one address and personal ones to another, run discovery on both. Every subscription is tagged with the inbox it came from, so the business and personal split happens on its own.',
      },
      {
        lead: 'Group by category or payment method.',
        text: 'Using one inbox for everything is fine - categorise each subscription once, or group by the card it bills to, and the separation holds from then on.',
      },
      {
        lead: 'Keep a complete record for tax time.',
        text: 'Amount, currency, and billing frequency for every recurring tool, including the ones you cancelled during the year. Suprascribe is a tracker, not accounting software - it makes sure the list you hand over is complete.',
      },
      {
        lead: 'Reminders before renewals.',
        text: 'PRO emails you ahead of a renewal date, which is when a rarely-used tool is worth reconsidering - not the week after it billed for another year.',
      },
      {
        lead: 'No bank account access.',
        text: 'Discovery uses read-only OAuth on your inbox. Nothing connects to your business or personal accounts, and no email content is stored after a scan.',
      },
    ],
    cardFootnote:
      'The free tier tracks unlimited subscriptions manually, and PRO is a one-time purchase - which matters more than usual when your whole reason for tracking is that recurring costs add up.',
  },
  families: {
    id: 'families',
    path: '/subscription-tracking-for-families',
    topics: ['streaming', 'money', 'tools'],
    metaTitle: 'Subscription Tracking for Families',
    metaDescription:
      'Track every household subscription in one place and find the duplicates. Suprascribe scans your inboxes to build the list - no bank access needed.',
    audienceType: 'Families and households',
    schemaDescription:
      'Subscription tracker for households. Finds streaming, music, and cloud storage subscriptions across several inboxes and app store accounts, groups them by source inbox or payment method, and surfaces duplicate plans.',
    breadcrumbName: 'Subscription Tracking for Families',
    h1: 'Subscription Tracking for Families',
    intro:
      'Subscription tracking for families is hard because household subscriptions are spread across several inboxes, two app stores, and whoever happened to sign up first. Suprascribe pulls them into one list so you can finally see the total, spot the plans you are paying for twice, and cancel what nobody has opened in months.',
    relatedHeading: 'Subscription tracking for all',
    relatedDescription: 'The same tracker, different situations',
    faqQuestions: [
      "Can I track my family's subscriptions in one place?",
      'How do I find duplicate subscriptions in my household?',
      'How do I find all my subscriptions?',
      'Is my data safe and private?',
      'Is Suprascribe really free?',
      'How do I cancel a subscription on my iPhone?',
    ],
    toolsHeading: 'Subscriptions in Almost Every Household',
    toolsIntro:
      'The issue is rarely any single one of these. It is that two people in the same house are often paying for the same thing.',
    tools: [
      {
        name: 'Netflix',
        why: 'The household plan everyone assumes is shared. Adult children who moved out often keep watching on it, or quietly started paying for their own.',
      },
      {
        name: 'Spotify Family',
        why: 'Only saves money if everyone actually moves onto it. Individual plans left running alongside the family one are the single most common household duplicate.',
      },
      {
        name: 'Disney+',
        why: 'Signed up for one series, kept through the summer nobody opened it. Annual plans renew at a date that has no relationship to when the kids stopped watching.',
      },
      {
        name: 'iCloud+',
        why: 'Every family member hits their storage limit eventually and upgrades on their own device. Several small storage plans cost more than one shared family tier.',
      },
      {
        name: 'Amazon Prime',
        why: 'Usually billed annually to whoever set it up, so it is invisible eleven months of the year - and its video, music, and delivery benefits overlap with things the household pays for separately.',
      },
      {
        name: 'YouTube Premium',
        why: 'Bought individually by whoever got tired of ads first. The family plan requires everyone to share a home address, so households often end up with two or three separate individual plans instead.',
      },
    ],
    toolsTotal: {
      text: 'These alone put a typical household around seventy a month, roughly eight hundred a year - and that is the tidy version, where nobody is paying twice. Add one duplicated music or streaming plan and the real figure climbs without anyone deciding it should.',
      emphasis: ['around seventy a month, roughly eight hundred a year'],
    },
    whyTitle: 'Why Households Pay for the Same Thing Twice',
    whyParagraphs: [
      {
        text: 'A household is several people signing up independently over several years. Someone started a music subscription in university and never moved onto the family plan. Someone else pays for extra phone storage on their own account. Each decision was sensible on its own, and nobody has ever seen all of them written down together.',
      },
      {
        lead: 'The charges are split across accounts.',
        text: 'Some bill through the App Store, some through Google Play, some directly to a card, some to a PayPal balance. There is no single screen that lists them, which is why the total is almost always higher than anyone guesses.',
      },
      {
        lead: 'Family plans only save money if people move.',
        text: 'Upgrading to a family tier while an individual plan keeps billing means paying more, not less. This is the most common and most expensive household duplicate, and it can run for years.',
      },
      {
        lead: 'Nobody owns the review.',
        text: 'Household bills get checked when something feels wrong. Subscriptions never feel wrong - each charge is small and each one was, at some point, wanted.',
      },
    ],
    helpsTitle: 'How Suprascribe Helps',
    helpsParagraphs: [
      {
        text: 'Every subscription in the house sent a receipt to somebody. Suprascribe reads those inboxes and builds the one list your household has never had.',
      },
    ],
    cardTitle: 'What that looks like in practice',
    cardBullets: [
      {
        lead: 'Scan more than one inbox.',
        text: 'Run discovery on each address that receives receipts - Gmail and Outlook over OAuth, iCloud and any other provider over IMAP. Each subscription is tagged with the inbox it came from, so you can see at a glance who is paying for what.',
      },
      {
        lead: 'Spot the duplicates.',
        text: 'With every household subscription in one view, grouped by service, overlapping streaming, music, and storage plans stop hiding behind separate statements.',
      },
      {
        lead: 'Group by payment method.',
        text: 'See which card or account each charge lands on, which is usually the fastest way to work out which ones were forgotten entirely.',
      },
      {
        lead: 'Reminders before renewal.',
        text: 'PRO emails you ahead of each renewal date and shows them on a calendar, so an annual plan gets a decision instead of an automatic charge.',
      },
      {
        lead: 'Nothing touches your bank.',
        text: 'There is no Plaid link and no card connection - only read-only email access, and no email content is stored after a scan.',
      },
    ],
    cardFootnote:
      'Suprascribe is a single-account tool, so in practice whoever manages the household bills keeps the list. Tracking is free and unlimited, and PRO is a one-time purchase rather than one more monthly charge on a pile you are trying to reduce.',
  },
  students: {
    id: 'students',
    path: '/subscription-tracking-for-students',
    topics: ['streaming', 'money', 'tools'],
    metaTitle: 'Subscription Tracking for Students',
    metaDescription:
      'Track every student subscription and catch discounts before they expire at full price. Suprascribe scans your inbox to build the list - free to use.',
    audienceType: 'Students',
    schemaDescription:
      'Subscription tracker for students. Finds streaming, music, storage, and study-tool charges by scanning the inbox they were signed up with - tracks student plans and the dates their discounts expire, with renewal reminders and no bank access.',
    breadcrumbName: 'Subscription Tracking for Students',
    h1: 'Subscription Tracking for Students',
    intro:
      'Subscription tracking for students is about real money: on a student budget the difference between what you think you spend on subscriptions and what you actually spend adds up fast. Suprascribe scans the inbox you signed up with and builds one list - including the student plans about to renew at full price.',
    relatedHeading: 'Subscription tracking for all',
    relatedDescription: 'The same tracker, different situations',
    faqQuestions: [
      'How can students keep track of subscriptions on a small budget?',
      'What happens to my student discount when I graduate?',
      'How do I stop free trials from turning into paid subscriptions?',
      'How do I cancel a subscription on my iPhone?',
      'Is Suprascribe really free?',
      'Is PRO really a one-time payment?',
    ],
    toolsHeading: 'Subscriptions Almost Every Student Is Paying For',
    toolsIntro:
      'Each one is a few euros. The problem is that most of them are discounted temporarily, and nothing tells you when that stops.',
    tools: [
      {
        name: 'Spotify Premium Student',
        why: 'Cheap enough to forget, and it needs re-verifying every year. When the verification lapses the plan quietly moves to full price without a new decision from you.',
      },
      {
        name: 'Netflix',
        why: 'Started on a flatmate arrangement that nobody tracks. Either you are paying for a household you have moved out of, or you started your own plan and the old share is still coming out of your account.',
      },
      {
        name: 'Adobe Creative Cloud',
        why: 'The student price is heavily discounted for the first year and then jumps sharply on renewal. It is billed annually, so the increase arrives long after the course that justified it ended.',
      },
      {
        name: 'ChatGPT Plus',
        why: 'Signed up during an assessment period and kept through the holidays. There is no student tier to fall back to, so the full monthly price runs through every quiet month.',
      },
      {
        name: 'Amazon Prime Student',
        why: 'Free for the trial period, then half price, then full price - a three-stage escalation with no prompt at any step. The delivery benefit is the reason people miss the video and music charges bundled with it.',
      },
      {
        name: 'iCloud+ or Google One',
        why: 'The smallest storage tier is a couple of euros and gets upgraded the first time a phone backup fails. It bills to an app store account rather than a card, which is why it rarely shows up when you check your bank app.',
      },
    ],
    toolsTotal: {
      text: 'At student pricing these come to roughly forty a month - and closer to double that once the discounts expire, which they all do on dates nobody wrote down. That gap is the part worth catching early.',
      emphasis: ['roughly forty a month'],
    },
    whyTitle: 'Why Student Subscriptions Are Easy to Lose Track Of',
    whyParagraphs: [
      {
        text: 'Student subscriptions get signed up for across several years, on whichever account was open at the time - a personal Gmail, a university address, an app store account tied to a phone bought before you started. Nothing joins those up, so the total only exists as a feeling rather than a number.',
      },
      {
        lead: 'Discounts expire silently.',
        text: 'Student pricing is time-limited and verification-based. When the term ends or re-verification fails, the plan converts to the full adult price automatically, and the first full-price charge is the only notification you get.',
      },
      {
        lead: 'Trials are aimed squarely at you.',
        text: 'Free months for students are a standard acquisition tactic, and they are designed to convert without a reminder. The signup confirmation lands in your inbox weeks before the charge reaches your card.',
      },
      {
        lead: 'App store billing hides the charge.',
        text: 'A lot of student subscriptions bill through the App Store, Google Play, or PayPal rather than directly to a card, so they do not appear under the service name when you scroll your banking app looking for what to cut.',
      },
      {
        lead: 'Shared plans outlive the sharing.',
        text: 'Streaming splits with flatmates, a family plan back home, a friend covering one service while you cover another - these arrangements end when people move, but the payments usually do not.',
      },
    ],
    helpsTitle: 'How Suprascribe Helps',
    helpsParagraphs: [
      {
        text: 'Every subscription you have ever started sent a receipt to an inbox. Suprascribe reads those receipts and turns them into one list with real numbers on it.',
      },
    ],
    cardTitle: 'What that looks like in practice',
    cardBullets: [
      {
        lead: 'Scan the inboxes you signed up with.',
        text: 'Run discovery on your personal address and your university one - Gmail and Outlook over OAuth, iCloud and any other provider over IMAP. Each subscription is tagged with the inbox it came from.',
      },
      {
        lead: 'Catch discounts before they end.',
        text: 'Record a student plan with the date its discount expires, and PRO emails you ahead of it - which is the point where full price is worth a decision rather than a surprise.',
      },
      {
        lead: 'See the real monthly total.',
        text: 'Amounts, currencies, and billing frequencies in one place, so an annual plan is compared on the same footing as a monthly one instead of being ignored eleven months of the year.',
      },
      {
        lead: 'Find the app store charges.',
        text: 'Receipts from the App Store, Google Play, and PayPal name the service even when your bank statement does not, so subscriptions billed through them stop being invisible.',
      },
      {
        lead: 'No bank account needed.',
        text: "Discovery uses read-only email access, so it works the same whether you are on a student account, a prepaid card, or a parent's card - and no email content is stored after a scan.",
      },
    ],
    cardFootnote:
      'Tracking is free and unlimited, and PRO is a one-time purchase rather than a monthly fee - which matters when the whole point is to cut recurring costs, not add one.',
  },
}
