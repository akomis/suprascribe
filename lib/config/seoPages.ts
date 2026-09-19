import type { BlogTopic } from './blog/types'

/**
 * The marketing pages under app/(seo), as data.
 *
 * One registry rather than a list per consumer: the page set drives the related-page chips,
 * the "From the Blog" cards, the reverse blog -> page links, the sitemap and llms.txt. Those
 * used to be four hand-maintained lists, and omitting a page from one of them failed silently.
 *
 * `topics` uses the same closed vocabulary as the blog, which is what lets lib/config/linkGraph
 * fill related links by topic overlap the way getRelatedPosts already does for articles.
 *
 * Keep this file free of *runtime* imports - lib/config/blog reads it at module scope, and an
 * import there would be a cycle. The BlogTopic import above is type-only, so it is erased at
 * compile time and creates no runtime edge.
 */

/** The three guides surfaced on the homepage. Deliberately fixed rather than "newest first":
 * this row is an entry point into the blog, so it holds the two pillar posts plus the one
 * that explains what a reader is actually entitled to. Order is the reading order.
 */
export const homepageBlogSlugs: string[] = [
  'how-to-find-all-your-subscriptions',
  'how-to-cancel-subscriptions',
  'ftc-click-to-cancel-rule-2026',
]

export interface SeoPageNode {
  /** Path with a leading slash. Also the key every consumer looks the page up by. */
  path: string
  /** Anchor text used when another page auto-links here. */
  label: string
  /** Full name, used for llms.txt. */
  title: string
  /** One-line summary for llms.txt. */
  summary: string
  /** ISO date for the sitemap's lastModified. */
  lastModified: string
  /**
   * Most specific first. `topics[0]` decides which cluster the page presents itself as part of,
   * and overlap with a post's topics is what fills the auto-generated links.
   */
  topics: BlogTopic[]
  /**
   * Pinned outbound chips, shown first and in this order. Auto-fill takes the remaining slots,
   * so this only needs the links worth guaranteeing - including ones outside this registry.
   */
  relatedLinks?: { href: string; label: string }[]
  /** Pinned blog cards, shown first. The rest of the row auto-fills by topic overlap. */
  blogSlugs?: string[]
}

export const seoPages: SeoPageNode[] = [
  {
    path: '/free-subscription-tracker',
    label: 'Track Subscriptions for Free',
    title: 'Free Subscription Tracker',
    summary:
      'Track subscriptions for free - no bank access needed, works with Gmail, Outlook, iCloud',
    lastModified: '2026-09-01',
    topics: ['tools', 'discovery'],
    relatedLinks: [
      { href: '/subscription-tracker-without-bank-account', label: 'Tracker With No Bank Linking' },
      { href: '/subscription-management-app', label: 'Full Subscription Manager' },
      { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
      { href: '/subscription-tracking-for-families', label: 'Tracking for Families' },
    ],
    blogSlugs: [
      'what-is-a-subscription-tracker',
      'best-subscription-tracker-app',
      'how-to-find-all-your-subscriptions',
    ],
  },
  {
    path: '/free-subscription-manager',
    label: 'Manage Subscriptions for Free',
    title: 'Free Subscription Manager',
    summary: 'Manage, cancel, and set reminders for all subscriptions - free forever',
    lastModified: '2026-09-01',
    topics: ['tools', 'cancel'],
    relatedLinks: [
      { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
      { href: '/subscription-management-app', label: 'Subscription Management App' },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
      { href: '/subscription-tracking-for-freelancers', label: 'Tracking for Freelancers' },
    ],
    blogSlugs: [
      'ftc-click-to-cancel-rule-2026',
      'how-to-cancel-subscriptions',
      'best-free-subscription-manager',
    ],
  },
  {
    path: '/gmail-subscription-tracker',
    label: 'Gmail Subscription Tracker',
    title: 'Gmail Subscription Tracker',
    summary:
      'Automatically find every subscription in a Gmail inbox via OAuth - no bank access, no password shared',
    lastModified: '2026-09-01',
    topics: ['discovery', 'tools'],
    relatedLinks: [
      { href: '/outlook-subscription-tracker', label: 'Outlook Subscription Tracker' },
      { href: '/icloud-subscription-tracker', label: 'iCloud Subscription Tracker' },
      { href: '/free-subscription-manager', label: 'Manage Subscriptions for Free' },
    ],
    blogSlugs: [
      'how-to-find-hidden-subscriptions-bank-statement',
      'how-to-find-all-your-subscriptions',
      'what-is-a-subscription-tracker',
    ],
  },
  {
    path: '/outlook-subscription-tracker',
    label: 'Outlook Subscription Tracker',
    title: 'Outlook Subscription Tracker',
    summary:
      'Automatically find every subscription in an Outlook, Hotmail, or Live inbox via Microsoft OAuth - no bank access, no password shared',
    lastModified: '2026-09-08',
    topics: ['discovery', 'tools'],
    relatedLinks: [
      { href: '/gmail-subscription-tracker', label: 'Gmail Subscription Tracker' },
      { href: '/icloud-subscription-tracker', label: 'iCloud Subscription Tracker' },
      { href: '/free-subscription-manager', label: 'Manage Subscriptions for Free' },
    ],
    blogSlugs: [
      'how-to-cancel-microsoft-365',
      'how-to-cancel-free-trial-before-charged',
      'cancel-chatgpt-subscription',
    ],
  },
  {
    path: '/icloud-subscription-tracker',
    label: 'iCloud Subscription Tracker',
    title: 'iCloud Subscription Tracker',
    summary:
      'Automatically find every subscription in an iCloud Mail inbox over IMAP with a revocable app-specific password - no bank access',
    lastModified: '2026-09-08',
    topics: ['discovery', 'tools'],
    relatedLinks: [
      { href: '/gmail-subscription-tracker', label: 'Gmail Subscription Tracker' },
      { href: '/outlook-subscription-tracker', label: 'Outlook Subscription Tracker' },
      { href: '/free-subscription-manager', label: 'Manage Subscriptions for Free' },
    ],
    blogSlugs: [
      'how-to-cancel-apple-tv-plus',
      'how-to-cancel-audible',
      'how-to-cancel-amazon-prime',
    ],
  },
  {
    path: '/subscription-management-app',
    label: 'Subscription Management App',
    title: 'Subscription Management App',
    summary: 'Web-based app supporting Gmail, Outlook, iCloud, and any IMAP inbox',
    lastModified: '2026-09-01',
    topics: ['tools', 'mobile'],
    relatedLinks: [
      { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
      { href: '/free-subscription-manager', label: 'Manage Subscriptions for Free' },
      { href: '/subscription-cost-calculator', label: 'Subscription Cost Calculator' },
      { href: '/subscription-tracking-for-business', label: 'Tracking for Business' },
    ],
    blogSlugs: [
      'how-to-track-subscriptions-on-iphone-and-android',
      'cancel-subscriptions-iphone',
      'cancel-subscriptions-android',
    ],
  },
  {
    path: '/subscription-tracker-without-bank-account',
    label: 'Tracker With No Bank Linking',
    title: 'Subscription Tracker Without Bank Account',
    summary:
      'Subscription tracking with no Plaid connection and no bank linking at any tier - email scanning only',
    lastModified: '2026-09-01',
    topics: ['privacy', 'tools', 'discovery'],
    relatedLinks: [
      { href: '/open-source-subscription-tracker', label: 'Open Source Subscription Tracker' },
      { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
      { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
    ],
    blogSlugs: [
      'best-free-subscription-tracker-no-bank-account',
      'how-to-find-hidden-subscriptions-bank-statement',
      'open-source-personal-finance-tools',
    ],
  },
  {
    path: '/open-source-subscription-tracker',
    label: 'Open Source Subscription Tracker',
    title: 'Open Source Subscription Tracker',
    summary: 'AGPL v3 source, self-hostable, privacy claims verifiable against the code',
    lastModified: '2026-09-01',
    topics: ['privacy', 'tools'],
    relatedLinks: [
      { href: '/subscription-tracker-without-bank-account', label: 'Tracker With No Bank Linking' },
      { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
      { href: '/compare', label: 'All Comparisons' },
      { href: '/subscription-tracking-for-startups', label: 'Tracking for Startups' },
    ],
    blogSlugs: [
      'open-source-personal-finance-tools',
      'best-free-subscription-tracker-no-bank-account',
      'subscription-tracker-spreadsheet-template',
    ],
  },
  {
    path: '/rocket-money-alternative',
    label: 'Rocket Money Alternative',
    title: 'Rocket Money Alternative',
    summary: 'Alternative to Rocket Money that needs no bank access and charges no monthly fee',
    lastModified: '2026-09-01',
    topics: ['tools', 'privacy'],
    relatedLinks: [
      { href: '/compare/rocket-money', label: 'Suprascribe vs Rocket Money' },
      { href: '/subscription-tracker-without-bank-account', label: 'Tracker With No Bank Linking' },
      { href: '/free-subscription-tracker', label: 'Track Subscriptions for Free' },
    ],
    blogSlugs: [
      'best-free-subscription-tracker-no-bank-account',
      'best-subscription-tracker-app',
      'how-to-find-hidden-subscriptions-bank-statement',
    ],
  },
  {
    path: '/subscription-cost-calculator',
    label: 'Subscription Cost Calculator',
    title: 'Subscription Cost Calculator',
    summary:
      'Free calculator - add subscriptions with monthly, yearly, quarterly, or weekly billing and get monthly and yearly totals. No signup, nothing stored',
    lastModified: '2026-09-01',
    topics: ['money', 'data'],
    relatedLinks: [
      { href: '/free-subscription-tracker', label: 'Free Subscription Tracker' },
      { href: '/subscription-management-app', label: 'Full Subscription Manager' },
      { href: '/rocket-money-alternative', label: 'Rocket Money Alternative' },
    ],
    blogSlugs: [
      'how-much-americans-spend-on-subscriptions',
      'subscription-fatigue',
      'how-to-save-money-fast',
    ],
  },
  {
    path: '/subscription-tracking-for-business',
    label: 'For Business',
    title: 'Subscription Tracking for Business',
    summary:
      'Track recurring software spend for a business by scanning the billing inbox - group by category, payment method, or source inbox, no bank access',
    lastModified: '2026-09-01',
    topics: ['software', 'money', 'tools'],
    relatedLinks: [
      { href: '/subscription-tracking-for-startups', label: 'For Startups' },
      { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
      { href: '/subscription-tracking-for-families', label: 'For Families' },
      { href: '/subscription-tracking-for-students', label: 'For Students' },
    ],
    blogSlugs: [
      'how-to-track-company-software-subscriptions',
      'how-to-cancel-microsoft-365',
      'how-to-cancel-linkedin-premium',
    ],
  },
  {
    path: '/subscription-tracking-for-startups',
    label: 'For Startups',
    title: 'Subscription Tracking for Startups',
    summary:
      'Find converted trials, forgotten annual plans, and unused tools in an early-stage SaaS stack - renewal reminders, multi-currency, no bank linking',
    lastModified: '2026-09-01',
    topics: ['software', 'money', 'tools'],
    relatedLinks: [
      { href: '/subscription-tracking-for-business', label: 'For Business' },
      { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
      { href: '/subscription-tracking-for-families', label: 'For Families' },
      { href: '/subscription-tracking-for-students', label: 'For Students' },
    ],
    blogSlugs: [
      'how-to-track-company-software-subscriptions',
      'how-to-cancel-adobe',
      'how-to-cancel-canva',
    ],
  },
  {
    path: '/subscription-tracking-for-freelancers',
    label: 'For Freelancers',
    title: 'Subscription Tracking for Freelancers',
    summary:
      'Keep business subscriptions separate from personal ones by grouping on source inbox, category, or payment method - complete record for tax time',
    lastModified: '2026-09-01',
    topics: ['software', 'money', 'tools'],
    relatedLinks: [
      { href: '/subscription-tracking-for-business', label: 'For Business' },
      { href: '/subscription-tracking-for-startups', label: 'For Startups' },
      { href: '/subscription-tracking-for-families', label: 'For Families' },
      { href: '/subscription-tracking-for-students', label: 'For Students' },
    ],
    blogSlugs: ['how-to-cancel-adobe', 'how-to-cancel-canva', 'how-to-cancel-dropbox'],
  },
  {
    path: '/subscription-tracking-for-families',
    label: 'For Families',
    title: 'Subscription Tracking for Families',
    summary:
      'One list for household subscriptions across multiple inboxes and app stores - spot duplicate streaming, music, and storage plans',
    lastModified: '2026-09-01',
    topics: ['streaming', 'money', 'tools'],
    relatedLinks: [
      { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
      { href: '/subscription-tracking-for-business', label: 'For Business' },
      { href: '/subscription-tracking-for-startups', label: 'For Startups' },
      { href: '/subscription-tracking-for-students', label: 'For Students' },
    ],
    blogSlugs: [
      'how-to-cancel-apple-tv-plus',
      'how-to-cancel-peacock',
      'netflix-price-increase-2026',
      'how-to-cancel-disney-plus',
    ],
  },
  {
    path: '/subscription-tracking-for-students',
    label: 'For Students',
    title: 'Subscription Tracking for Students',
    summary:
      'Track student subscriptions across personal and university inboxes - catch student discounts and trials before they convert to full price, no bank access',
    lastModified: '2026-09-01',
    topics: ['streaming', 'money', 'tools'],
    relatedLinks: [
      { href: '/subscription-tracking-for-families', label: 'For Families' },
      { href: '/subscription-tracking-for-freelancers', label: 'For Freelancers' },
      { href: '/subscription-tracking-for-startups', label: 'For Startups' },
      { href: '/subscription-tracking-for-business', label: 'For Business' },
    ],
    blogSlugs: [
      'how-to-cancel-spotify',
      'how-to-cancel-youtube-premium',
      'how-to-cancel-xbox-game-pass',
    ],
  },
]

/** Path -> node, for the lookups every consumer does. */
export const seoPagesByPath: Record<string, SeoPageNode> = Object.fromEntries(
  seoPages.map((page) => [page.path, page]),
)

/**
 * Which blog posts each marketing page pins.
 *
 * Derived rather than hand-written, but still only the *pinned* slugs: lib/config/blog weights
 * these at more than a blog-to-blog link, and feeding auto-filled links back into that weighting
 * would make the weights depend on the choices they are used to make.
 */
export const seoPageBlogLinks: Record<string, string[]> = Object.fromEntries(
  seoPages.map((page) => [page.path, page.blogSlugs ?? []]),
)
