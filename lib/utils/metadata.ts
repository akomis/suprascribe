import type { Metadata } from 'next'

export const SITE_URL = 'https://www.suprascribe.com'

interface PageMetadataInput {
  /** Title without the brand suffix - the root layout template appends "| Suprascribe". */
  title: string
  description: string
  /** Path with leading slash, or '' for the homepage. */
  path: string
  /** Set for blog posts so the OG card is typed as an article. */
  article?: {
    publishedTime: string
    modifiedTime?: string
  }
  /** Bypass the root title template (used where the title already carries its own suffix). */
  absoluteTitle?: string
}

/**
 * Builds page metadata with canonical, Open Graph and Twitter tags derived from the same
 * title/description.
 *
 * Next.js does not deep-merge nested `openGraph`/`twitter` objects across segments: a
 * parent layout's static object silently wins unless the child re-declares every field.
 * Without this, every page inherits the root layout's homepage OG tags.
 */
export function buildMetadata({
  title,
  description,
  path,
  article,
  absoluteTitle,
}: PageMetadataInput): Metadata {
  const url = `${SITE_URL}${path}`
  const ogTitle = absoluteTitle ?? `${title} | Suprascribe`

  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: ogTitle,
      description,
      url,
      ...(article
        ? {
            type: 'article' as const,
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime ?? article.publishedTime,
          }
        : { type: 'website' as const }),
    },
    twitter: {
      title: ogTitle,
      description,
    },
  }
}
