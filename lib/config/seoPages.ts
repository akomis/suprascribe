/**
 * Which blog posts each marketing page links to.
 *
 * This lives in data rather than in each page's JSX so lib/config/blog can count these
 * toward a post's inbound links. A link from a landing page is worth more than a
 * blog-to-blog link, so the slots go to the least-linked posts first, not to whatever
 * is newest.
 *
 * Keep this file free of imports - lib/config/blog reads it at module scope, and an
 * import here would make that a cycle.
 */

/**
 * The three guides surfaced on the homepage. Deliberately fixed rather than "newest first":
 * this row is an entry point into the blog, so it holds the two pillar posts plus the one
 * that explains what a reader is actually entitled to. Order is the reading order.
 */
export const homepageBlogSlugs: string[] = [
  'how-to-find-all-your-subscriptions',
  'how-to-cancel-subscriptions',
  'ftc-click-to-cancel-rule-2026',
]
export const seoPageBlogLinks: Record<string, string[]> = {
  '/free-subscription-tracker': [
    'what-is-a-subscription-tracker',
    'best-subscription-tracker-app',
    'how-to-find-all-your-subscriptions',
  ],
  '/free-subscription-manager': [
    'ftc-click-to-cancel-rule-2026',
    'how-to-cancel-subscriptions',
    'best-free-subscription-manager',
  ],
  '/gmail-subscription-tracker': [
    'how-to-find-hidden-subscriptions-bank-statement',
    'how-to-find-all-your-subscriptions',
    'what-is-a-subscription-tracker',
  ],
  '/open-source-subscription-tracker': [
    'open-source-personal-finance-tools',
    'best-free-subscription-tracker-no-bank-account',
    'subscription-tracker-spreadsheet-template',
  ],
  '/rocket-money-alternative': [
    'best-free-subscription-tracker-no-bank-account',
    'best-subscription-tracker-app',
    'how-to-find-hidden-subscriptions-bank-statement',
  ],
  '/subscription-cost-calculator': [
    'how-much-americans-spend-on-subscriptions',
    'subscription-fatigue',
    'how-to-save-money-fast',
  ],
  '/subscription-management-app': [
    'how-to-track-subscriptions-on-iphone-and-android',
    'cancel-subscriptions-iphone',
    'cancel-subscriptions-android',
  ],
  '/subscription-tracker-without-bank-account': [
    'best-free-subscription-tracker-no-bank-account',
    'how-to-find-hidden-subscriptions-bank-statement',
    'open-source-personal-finance-tools',
  ],
  '/subscription-tracking-for-business': [
    'how-to-track-company-software-subscriptions',
    'how-to-cancel-microsoft-365',
    'how-to-cancel-linkedin-premium',
  ],
  '/subscription-tracking-for-startups': [
    'how-to-track-company-software-subscriptions',
    'how-to-cancel-adobe',
    'how-to-cancel-canva',
  ],
  '/subscription-tracking-for-freelancers': [
    'how-to-cancel-adobe',
    'how-to-cancel-canva',
    'how-to-cancel-dropbox',
  ],
  '/subscription-tracking-for-families': [
    'how-to-cancel-apple-tv-plus',
    'how-to-cancel-peacock',
    'netflix-price-increase-2026',
    'how-to-cancel-disney-plus',
  ],
  '/subscription-tracking-for-students': [
    'how-to-cancel-spotify',
    'how-to-cancel-youtube-premium',
    'how-to-cancel-xbox-game-pass',
  ],
}
