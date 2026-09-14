import type { FAQItem } from '../faq'

export type BlogSectionType =
  'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'callout' | 'table' | 'image' | 'diagram'

export interface BlogSectionLink {
  /** Exact substring of `text` (or of an entry in `items`) to turn into an anchor. */
  text: string
  href: string
}

export interface BlogSectionTable {
  headers: string[]
  /** Each row must have the same length as `headers`. */
  rows: string[][]
  /**
   * Names what the table holds. Rendered as a real `<caption>`, which screen readers
   * announce on entry and which labels the dataset for search and AI extraction.
   */
  caption?: string
  /** Render each row's first cell as a `<th scope="row">` - use when column one is the key. */
  rowHeaders?: boolean
}

export interface BlogSectionImage {
  /** Path under /public, with a leading slash. */
  src: string
  alt: string
  caption?: string
  width: number
  height: number
}

/**
 * Diagrams are declared as data and rendered by a component chosen from `kind`, so the post
 * files stay serialisable and free of JSX. Each kind is deliberately narrow - a diagram that
 * needs a general graph layout is a table instead.
 *
 * Add a kind only when a post actually holds the data to fill it. A diagram built from numbers
 * the post cannot source is worse than no diagram.
 */
export interface CancelPathBranch {
  /** The situation the reader is in, e.g. "You signed up in the app". */
  condition: string
  action: string
  href?: string
}
export interface CancelPathData {
  question: string
  branches: CancelPathBranch[]
}

export interface TimelineEvent {
  date: string
  label: string
  detail?: string
  /** Marks the moment the reader is trying to avoid - the charge, the deadline. */
  emphasis?: boolean
}
export interface TimelineData {
  events: TimelineEvent[]
}

export interface ComparePoint {
  text: string
  good: boolean
}
export interface CompareColumn {
  title: string
  points: ComparePoint[]
}
export interface CompareColumnsData {
  left: CompareColumn
  right: CompareColumn
}

export type BlogDiagram =
  | { kind: 'cancel-path'; alt: string; caption?: string; data: CancelPathData }
  | { kind: 'timeline'; alt: string; caption?: string; data: TimelineData }
  | { kind: 'compare-columns'; alt: string; caption?: string; data: CompareColumnsData }

export interface BlogSection {
  type: BlogSectionType
  text?: string
  items?: string[]
  /**
   * Optional in-body anchors. Each entry's `text` is matched against `text` and `items`,
   * and the first occurrence is replaced with a link to `href`. A phrase that is not found
   * renders unchanged, so check the phrase matches the copy exactly.
   *
   * Not allowed on a `table` section: matching runs per cell, so a phrase that repeats down
   * a column would be anchored in every row.
   */
  links?: BlogSectionLink[]
  /**
   * Short label rendered as a badge after the heading text, for `h2` and `h3` sections.
   * Use this rather than putting "(Recommended)" in `text` - a parenthetical reads as part
   * of the heading in search results, an outline, and a screen reader's heading list.
   */
  badge?: string
  /** Required for `table` sections. */
  table?: BlogSectionTable
  /** Required for `image` sections. */
  image?: BlogSectionImage
  /** Required for `diagram` sections. */
  diagram?: BlogDiagram
}

/**
 * Closed set on purpose: `topics` drives related-post selection, the pillar clusters and the
 * `about` entries in the article schema, so a free-text tag would silently orphan a post.
 */
export type BlogTopic =
  | 'cancel'
  | 'streaming'
  | 'software'
  | 'fitness'
  | 'mobile'
  | 'discovery'
  | 'tools'
  | 'privacy'
  | 'money'
  | 'policy'
  | 'data'

/** Human-readable names for `about` entries in the article schema and for cluster headings. */
export const TOPIC_LABELS: Record<BlogTopic, string> = {
  cancel: 'Cancelling subscriptions',
  streaming: 'Streaming services',
  software: 'Software subscriptions',
  fitness: 'Gym and fitness memberships',
  mobile: 'Mobile app subscriptions',
  discovery: 'Finding your subscriptions',
  tools: 'Subscription trackers',
  privacy: 'Financial privacy',
  money: 'Personal finance',
  policy: 'Consumer protection',
  data: 'Subscription spending data',
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
  /** Questions pulled from the shared pool in `lib/config/faq.ts`, by exact question text. */
  faqQuestions: string[]
  /**
   * Questions written for this post specifically, rendered after the shared ones. The shared pool
   * answers product-level questions that repeat across the site; anything specific to this post's
   * service or topic belongs here, so each article's FAQPage schema stays distinct.
   */
  faq?: FAQItem[]
  /** Most specific first: `topics[0]` decides which cluster the post presents itself as part of. */
  topics: BlogTopic[]
  /** Set on the one post that acts as the hub for a topic. It lists every post in that cluster. */
  pillar?: BlogTopic
  /**
   * Pinned related posts, shown first and in this order. The rest of the slots are filled
   * automatically by topic overlap, so this only needs the links you actually care about.
   */
  relatedSlugs: string[]
  relatedPageLinks: { href: string; label: string }[]
}

export type BlogCategory = 'cancelling' | 'discovery' | 'trackers' | 'money'

/**
 * Reader-facing rollup of `topics`, used by the filter on the blog index. Eleven topics is too many
 * chips, and the topic names are written for schema `about` entries and cluster headings rather than
 * for a filter row. Order here is the order the chips render in.
 */
export const BLOG_CATEGORIES = [
  { id: 'cancelling', label: 'Cancelling Guides', topics: ['cancel'] },
  { id: 'discovery', label: 'Finding subscriptions', topics: ['discovery', 'data'] },
  { id: 'trackers', label: 'Trackers', topics: ['tools'] },
  { id: 'money', label: 'Money & rights', topics: ['money', 'privacy', 'policy'] },
] as const satisfies readonly { id: BlogCategory; label: string; topics: readonly BlogTopic[] }[]

/**
 * Service-vertical topics deliberately have no chip of their own: every post carrying one also
 * carries a topic that a chip does claim, so they stay reachable without a "Services" chip that
 * would duplicate most of the cancel guides.
 */
type UnfilteredTopic = 'streaming' | 'mobile' | 'fitness' | 'software'

/**
 * A new BlogTopic that no category claims and that is not listed above breaks the build here rather
 * than silently making its posts unreachable from every chip.
 */
type UncategorisedTopic = Exclude<
  BlogTopic,
  (typeof BLOG_CATEGORIES)[number]['topics'][number] | UnfilteredTopic
>
const _everyTopicIsCategorised: UncategorisedTopic extends never ? true : UncategorisedTopic = true
void _everyTopicIsCategorised

/** The categories a post belongs to, in `BLOG_CATEGORIES` order. */
export function getPostCategories(topics: readonly BlogTopic[]): BlogCategory[] {
  return BLOG_CATEGORIES.filter((category) =>
    category.topics.some((topic) => topics.includes(topic)),
  ).map((category) => category.id)
}

/**
 * The fields a post card renders. Declared separately so the blog index can hand posts to a client
 * component without serialising every article body into the RSC payload. `BlogPost` satisfies it.
 */
export type BlogPostSummary = Pick<
  BlogPost,
  'slug' | 'title' | 'intro' | 'publishedAt' | 'readingTimeMin' | 'topics'
>
