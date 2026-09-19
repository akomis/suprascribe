import type { MetadataRoute } from 'next'

/**
 * Only `/api/` and the two throwaway app screens are disallowed here.
 *
 * `/login` and `/reset-password` used to be in this list while also carrying a
 * `noindex` in their own metadata - a contradiction. A
 * disallowed URL is never fetched, so the noindex on it is never read, and Google is free
 * to index the URL itself from anchor text alone ("Indexed, though blocked by robots.txt").
 * `/login?tab=signup` is the target of ~86 internal links from indexable marketing pages,
 * so that was the single most-linked dead end on the site. Letting crawlers fetch it lets
 * the noindex do its job.
 *
 * `/dashboard` came out for the same reason: robots.txt was never what kept it private -
 * middleware bounces anonymous visitors to /login, and the layout now carries a noindex.
 * Public pages no longer link to it either (/limits and /imap navigate there with
 * buttons), since every such link was an internal link to a 307 for crawlers.
 */
const DISALLOW = ['/api/', '/confirmation', '/demo-discovery']

const AI_USER_AGENTS = [
  'GPTBot',
  'OAI-SearchBot',
  'PerplexityBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'CCBot',
  'Google-Extended',
]

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: DISALLOW,
      })),
    ],
    sitemap: 'https://www.suprascribe.com/sitemap.xml',
  }
}
