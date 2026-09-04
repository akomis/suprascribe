import type { BlogPost, BlogTopic } from './types'
import { cancelGuides } from './posts/cancel-guides'
import { platformGuides } from './posts/platform-guides'
import { comparisonGuides } from './posts/comparisons'
import { newsAndData } from './posts/news-and-data'
import { moneyGuides } from './posts/money'
import { homepageBlogSlugs, seoPageBlogLinks } from '../seoPages'

export * from './types'

/**
 * Every post, grouped by archetype. Group order is the canonical order; helpers that
 * depend on ordering declare their own tiebreaker rather than relying on it.
 */
export const blogPosts: BlogPost[] = [
  ...cancelGuides,
  ...platformGuides,
  ...comparisonGuides,
  ...newsAndData,
  ...moneyGuides,
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug)
}

export function getSubscriptionEraPosts(): BlogPost[] {
  return blogPosts.filter((post) => post.subscriptionEra)
}

/**
 * Newest first, by publish date. Fourteen posts share 2026-09-01, so slug is an explicit
 * secondary key - relying on array order would make the listing depend on which archetype
 * file a post happens to live in.
 */
export function getBlogPostsNewestFirst(): BlogPost[] {
  return [...blogPosts].sort(
    (a, b) => b.publishedAt.localeCompare(a.publishedAt) || a.slug.localeCompare(b.slug),
  )
}

/**
 * How many places link to each post, counted once at module scope. Everything here is
 * build-time: every article is prerendered by generateStaticParams, so this costs nothing
 * at runtime.
 *
 * seoPages.ts holds only plain data and imports nothing, so it can be read from here without
 * a cycle - which matters, because the count has to be identical on every page of the build.
 */
const inboundLinks = new Map<string, number>(blogPosts.map((post) => [post.slug, 0]))

function countInbound(slug: string, by = 1) {
  inboundLinks.set(slug, (inboundLinks.get(slug) ?? 0) + by)
}

for (const post of blogPosts) {
  for (const slug of post.relatedSlugs) countInbound(slug)
  for (const section of post.sections) {
    for (const link of section.links ?? []) {
      if (link.href.startsWith('/blog/')) countInbound(link.href.slice('/blog/'.length))
    }
  }
  // The homepage renders these as cards, which is a stronger link than any of the above.
  if (post.subscriptionEra) countInbound(post.slug, 2)
  // A pillar links to everything in its cluster.
  if (post.pillar) {
    for (const member of blogPosts) {
      if (member.slug !== post.slug && member.topics.includes(post.pillar))
        countInbound(member.slug)
    }
  }
}

// A link from a landing page carries more weight than a blog-to-blog link, and a link from
// the homepage more still.
for (const slugs of Object.values(seoPageBlogLinks)) {
  for (const slug of slugs) countInbound(slug, 2)
}
for (const slug of homepageBlogSlugs) countInbound(slug, 3)

function getInboundLinkCount(slug: string): number {
  return inboundLinks.get(slug) ?? 0
}

/**
 * Pinned `relatedSlugs` first, then the best topic matches to fill the remaining slots.
 *
 * The auto-fill breaks ties toward the *least* linked post rather than the most relevant
 * runner-up. Without that, every cluster converges on the same two or three hubs and the
 * tail of the blog is reachable only from the index.
 */
export function getRelatedPosts(post: BlogPost, limit = 4): BlogPost[] {
  const chosen = post.relatedSlugs
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p) && p!.slug !== post.slug)

  if (chosen.length >= limit) return chosen.slice(0, limit)

  const taken = new Set([post.slug, ...chosen.map((p) => p.slug)])
  const candidates = blogPosts
    .filter((candidate) => !taken.has(candidate.slug))
    .map((candidate) => ({
      candidate,
      overlap: candidate.topics.filter((topic) => post.topics.includes(topic)).length,
    }))
    .filter(({ overlap }) => overlap > 0)
    .sort(
      (a, b) =>
        b.overlap - a.overlap ||
        getInboundLinkCount(a.candidate.slug) - getInboundLinkCount(b.candidate.slug) ||
        a.candidate.slug.localeCompare(b.candidate.slug),
    )

  return [...chosen, ...candidates.slice(0, limit - chosen.length).map((c) => c.candidate)]
}

/** The hub post for a topic, if one is declared. */
function getPillarPost(topic: BlogTopic): BlogPost | undefined {
  return blogPosts.find((post) => post.pillar === topic)
}

/**
 * The cluster this post presents itself as part of - the hub for its most specific topic
 * that actually has one. Returns undefined for the hub itself.
 */
export function getPillarForPost(post: BlogPost): BlogPost | undefined {
  if (post.pillar) return undefined
  for (const topic of post.topics) {
    const pillar = getPillarPost(topic)
    if (pillar) return pillar
  }
  return undefined
}

/** Every post in a pillar's cluster, newest first, excluding the pillar itself. */
export function getClusterPosts(pillar: BlogPost): BlogPost[] {
  if (!pillar.pillar) return []
  const topic = pillar.pillar
  return getBlogPostsNewestFirst().filter(
    (post) => post.slug !== pillar.slug && post.topics.includes(topic),
  )
}

/** The homepage's fixed entry-point trio, in the order they are meant to be read. */
export function getHomepageBlogPosts(): BlogPost[] {
  return homepageBlogSlugs.map(getBlogPost).filter((post): post is BlogPost => post !== undefined)
}

/** Body length, counted from the text the reader actually sees. */
export function getWordCount(post: BlogPost): number {
  const strings = [post.intro]
  for (const section of post.sections) {
    if (section.text) strings.push(section.text)
    if (section.items) strings.push(...section.items)
    if (section.table) strings.push(...section.table.headers, ...section.table.rows.flat())
    if (section.diagram) strings.push(section.diagram.alt)
  }
  return strings.join(' ').split(/\s+/).filter(Boolean).length
}
