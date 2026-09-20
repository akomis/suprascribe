import { blogPosts, getInboundLinkCount } from './blog'
import type { BlogPost } from './blog'
import { seoPages, seoPagesByPath, type SeoPageNode } from './seoPages'
import { homepageBlogSlugs } from './seoPages'

/**
 * The internal link graph across the marketing pages and the blog.
 *
 * The blog already fills related posts by topic overlap and breaks ties toward the least-linked
 * candidate (see getRelatedPosts). None of that was coupled to /blog/* - it was coupled to
 * `topics` - so the same treatment applies to app/(seo) pages now that they carry topics too.
 * Before this, their related links were hand-typed per page, which left eight of the fifteen
 * with no inbound link from any article.
 *
 * Layering: lib/config/blog counts inbound weight from *pinned* links only, and this module
 * consumes those counts without ever feeding back into them. Auto-filled links must not
 * influence the weights that choose auto-filled links.
 */

export interface RelatedLink {
  href: string
  label: string
}

/**
 * How many places link to each marketing page, counted once at module scope like the blog's
 * equivalent. Everything here is build-time: every page in the group is statically prerendered.
 */
const seoInbound = new Map<string, number>(seoPages.map((page) => [page.path, 0]))

function countSeoInbound(href: string, by = 1) {
  if (seoInbound.has(href)) seoInbound.set(href, (seoInbound.get(href) ?? 0) + by)
}

// Pinned chips between marketing pages.
for (const page of seoPages) {
  for (const link of page.relatedLinks ?? []) countSeoInbound(link.href)
}

// Links out of articles - both the pinned resource chips and anchors inside the body.
for (const post of blogPosts) {
  for (const link of post.relatedPageLinks) countSeoInbound(link.href)
  for (const section of post.sections) {
    for (const link of section.links ?? []) countSeoInbound(link.href)
  }
}

// The homepage and the sitewide footer are stronger than either of the above.
for (const path of [
  '/subscription-tracking-for-students',
  '/subscription-tracking-for-freelancers',
  '/subscription-tracking-for-families',
  '/subscription-tracking-for-business',
  '/subscription-tracking-for-startups',
])
  countSeoInbound(path, 3)
countSeoInbound('/subscription-cost-calculator', 3)

export function getSeoPageInboundCount(path: string): number {
  return seoInbound.get(path) ?? 0
}

/** Shared ranking: most topic overlap first, then the least-linked candidate, then stable by key. */
function byOverlapThenLeastLinked<T>(
  entries: { item: T; overlap: number; key: string; inbound: number }[],
) {
  return entries.sort(
    (a, b) => b.overlap - a.overlap || a.inbound - b.inbound || a.key.localeCompare(b.key),
  )
}

function overlapWith(topics: readonly string[], other: readonly string[]): number {
  return other.filter((topic) => topics.includes(topic)).length
}

/**
 * Pinned chips first, then the best topic matches to fill the remaining slots.
 *
 * Pins may point anywhere - /compare and /compare/rocket-money are not in the registry - so only
 * registry paths are considered for the auto-fill and for de-duplication.
 */
export function getRelatedSeoPages(path: string, limit = 4): RelatedLink[] {
  const node = seoPagesByPath[path]
  if (!node) return []

  // `limit` bounds the auto-fill, never the pins: a page that deliberately lists five related
  // pages keeps all five.
  const pinned = node.relatedLinks ?? []
  if (pinned.length >= limit) return pinned

  const taken = new Set([path, ...pinned.map((link) => link.href)])
  const candidates = byOverlapThenLeastLinked(
    seoPages
      .filter((candidate) => !taken.has(candidate.path))
      .map((candidate) => ({
        item: candidate,
        overlap: overlapWith(node.topics, candidate.topics),
        key: candidate.path,
        inbound: getSeoPageInboundCount(candidate.path),
      }))
      .filter(({ overlap }) => overlap > 0),
  )

  return [
    ...pinned,
    ...candidates
      .slice(0, limit - pinned.length)
      .map(({ item }) => ({ href: item.path, label: item.label })),
  ]
}

/** Pinned blog cards first, then the least-linked posts that share a topic with the page. */
export function getSeoPageBlogSlugs(path: string, limit = 3): string[] {
  const node = seoPagesByPath[path]
  if (!node) return []

  const pinned = node.blogSlugs ?? []
  if (pinned.length >= limit) return pinned

  const taken = new Set(pinned)
  const candidates = byOverlapThenLeastLinked(
    blogPosts
      .filter((post) => !taken.has(post.slug))
      .map((post) => ({
        item: post,
        overlap: overlapWith(node.topics, post.topics),
        key: post.slug,
        inbound: getInboundLinkCount(post.slug),
      }))
      .filter(({ overlap }) => overlap > 0),
  )

  return [...pinned, ...candidates.slice(0, limit - pinned.length).map(({ item }) => item.slug)]
}

/**
 * The reverse edge, which did not exist before: which marketing pages an article should link to.
 *
 * `relatedPageLinks` stays the pin list, and the rest of the slots go to a page that shares a
 * topic with the post. That is what closes the gap for pages like /outlook-subscription-tracker
 * and /subscription-management-app, which no article linked to at all.
 *
 * The assignment is precomputed in one pass rather than resolved per call, because the tiebreak
 * has to see the links it has already handed out. Resolving per call reads a frozen count, so the
 * same lowest-count page wins every tie and the fill dogpiles onto one or two pages - which is the
 * failure the blog's own anti-hub tiebreak exists to avoid. Posts are walked in slug order and the
 * result is a lookup table, so this stays a pure function of the content: static generation renders
 * pages in an arbitrary order and across several workers, and anything order-dependent at call time
 * would produce different HTML from one build to the next.
 */
const POST_PAGE_LINK_LIMIT = 3

const seoPagesForPost = new Map<string, RelatedLink[]>()

{
  const running = new Map(seoPages.map((page) => [page.path, getSeoPageInboundCount(page.path)]))

  for (const post of [...blogPosts].sort((a, b) => a.slug.localeCompare(b.slug))) {
    const pinned = post.relatedPageLinks
    const links = [...pinned]
    const taken = new Set(pinned.map((link) => link.href))

    while (links.length < POST_PAGE_LINK_LIMIT) {
      const [best] = byOverlapThenLeastLinked(
        seoPages
          .filter((page) => !taken.has(page.path))
          .map((page) => ({
            item: page,
            overlap: overlapWith(post.topics, page.topics),
            key: page.path,
            inbound: running.get(page.path) ?? 0,
          }))
          .filter(({ overlap }) => overlap > 0),
      )
      if (!best) break

      links.push({ href: best.item.path, label: best.item.label })
      taken.add(best.item.path)
      running.set(best.item.path, (running.get(best.item.path) ?? 0) + 1)
    }

    seoPagesForPost.set(post.slug, links)
  }
}

/** Precomputed above at POST_PAGE_LINK_LIMIT. Pinned links are always kept, however many there are. */
export function getSeoPagesForPost(post: BlogPost): RelatedLink[] {
  return seoPagesForPost.get(post.slug) ?? post.relatedPageLinks
}

export type { SeoPageNode }
export { homepageBlogSlugs }
