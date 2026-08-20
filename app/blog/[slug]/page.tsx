import { SEOPage } from '@/components/shared/SEOPage'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { faqItems } from '@/lib/config/faq'
import { blogPosts, getBlogPost, type BlogSection, type BlogSectionLink } from '@/lib/config/blog'
import { Clock, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'
import type { ReactElement, ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}
  return buildMetadata({
    title: post.title,
    absoluteTitle: `${post.title} | Suprascribe Blog`,
    description: post.description,
    path: `/blog/${post.slug}`,
    article: {
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
  })
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const INLINE_LINK_CLASS = 'text-primary underline underline-offset-4 hover:no-underline'

function inlineAnchor(link: BlogSectionLink, key: string) {
  if (link.href.startsWith('http')) {
    return (
      <a
        key={key}
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={INLINE_LINK_CLASS}
      >
        {link.text}
      </a>
    )
  }
  return (
    <Link key={key} href={link.href} className={INLINE_LINK_CLASS}>
      {link.text}
    </Link>
  )
}

/**
 * Splices anchors into a plain string. Each link's phrase is replaced at its
 * first occurrence only; phrases that are absent are left alone. Returns the
 * original string untouched when there is nothing to link.
 */
function linkify(text: string, links?: BlogSectionLink[]): ReactNode {
  if (!links?.length) return text

  let nodes: (string | ReactElement)[] = [text]

  links.forEach((link, linkIndex) => {
    let done = false
    nodes = nodes.flatMap((node, nodeIndex) => {
      if (done || typeof node !== 'string') return [node]
      const at = node.indexOf(link.text)
      if (at === -1) return [node]
      done = true
      const before = node.slice(0, at)
      const after = node.slice(at + link.text.length)
      return [
        ...(before ? [before] : []),
        inlineAnchor(link, `link-${linkIndex}-${nodeIndex}`),
        ...(after ? [after] : []),
      ]
    })
  })

  return nodes.length === 1 ? nodes[0] : nodes
}

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={index} className="text-2xl sm:text-3xl font-bold tracking-tight pt-4">
          {linkify(section.text ?? '', section.links)}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={index} className="text-xl font-semibold pt-2">
          {linkify(section.text ?? '', section.links)}
        </h3>
      )
    case 'p':
      return (
        <p key={index} className="text-muted-foreground leading-relaxed">
          {linkify(section.text ?? '', section.links)}
        </p>
      )
    case 'ul':
      return (
        <ul key={index} className="list-disc list-inside space-y-2 text-muted-foreground">
          {section.items?.map((item, i) => (
            <li key={i}>{linkify(item, section.links)}</li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol key={index} className="list-decimal list-inside space-y-2 text-muted-foreground">
          {section.items?.map((item, i) => (
            <li key={i}>{linkify(item, section.links)}</li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <aside
          key={index}
          className="border-l-4 border-primary/40 bg-muted/50 rounded-r-lg px-5 py-4 text-sm text-muted-foreground"
        >
          {linkify(section.text ?? '', section.links)}
        </aside>
      )
    default:
      return null
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  const postFaqItems = faqItems.filter((item) => post.faqQuestions.includes(item.question))

  const relatedPosts = blogPosts.filter((p) => post.relatedSlugs.includes(p.slug))

  const relatedResources = [
    { href: '/login?tab=signup', label: 'Start for Free' },
    { href: '/demo', label: 'See the Demo' },
    ...post.relatedPageLinks,
  ]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BlogPosting',
        '@id': `https://www.suprascribe.com/blog/${post.slug}#article`,
        headline: post.title,
        description: post.description,
        datePublished: post.publishedAt,
        dateModified: post.updatedAt ?? post.publishedAt,
        url: `https://www.suprascribe.com/blog/${post.slug}`,
        author: {
          '@type': 'Organization',
          '@id': 'https://www.suprascribe.com/#organization',
        },
        image: {
          '@type': 'ImageObject',
          url: `https://www.suprascribe.com/blog/${post.slug}/opengraph-image`,
          width: 1200,
          height: 630,
        },
        publisher: {
          '@type': 'Organization',
          '@id': 'https://www.suprascribe.com/#organization',
        },
        isPartOf: {
          '@type': 'Blog',
          '@id': 'https://www.suprascribe.com/blog#blog',
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `https://www.suprascribe.com/blog/${post.slug}`,
        },
      },
      ...(postFaqItems.length > 0
        ? [
            {
              '@type': 'FAQPage',
              mainEntity: postFaqItems.map((item) => ({
                '@type': 'Question',
                name: item.question,
                acceptedAnswer: { '@type': 'Answer', text: item.answer },
              })),
            },
          ]
        : []),
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suprascribe.com' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Blog',
            item: 'https://www.suprascribe.com/blog',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: post.title,
            item: `https://www.suprascribe.com/blog/${post.slug}`,
          },
        ],
      },
    ],
  }

  return (
    <SEOPage
      jsonLd={jsonLd}
      title={post.title}
      description={post.description}
      faqItems={postFaqItems.length > 0 ? postFaqItems : undefined}
      relatedPages={relatedResources}
      relatedHeading={null}
    >
      <section className="container mx-auto px-4 py-10 sm:py-16 max-w-3xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span>{formatDate(post.publishedAt)}</span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTimeMin} min read
              </span>
            </div>
            {post.source &&
              (post.sourceUrl ? (
                <a
                  href={post.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  Read the original report on
                  <Badge
                    variant="secondary"
                    className="rounded-none px-2 py-0.5 text-xs font-medium"
                  >
                    {post.source}
                  </Badge>
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <Badge variant="secondary" className="rounded-none px-2 py-0.5 text-xs font-medium">
                  {post.source}
                </Badge>
              ))}
          </div>

          <div className="space-y-5">
            {post.sections.map((section, i) => renderSection(section, i))}
          </div>
        </div>
      </section>

      {relatedPosts.length > 0 && (
        <>
          <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />
          <section className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
                More from the Blog
              </h2>
              <div className="space-y-4">
                {relatedPosts.map((related) => (
                  <article
                    key={related.slug}
                    className="border rounded-lg p-5 space-y-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold">{related.title}</h3>
                      <p className="text-xs text-muted-foreground shrink-0">
                        {formatDate(related.publishedAt)}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{related.intro}</p>
                    <div className="flex justify-end">
                      <Link href={`/blog/${related.slug}`}>
                        <Button variant="ghost" size="sm" className="px-0 text-sm">
                          Read →
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </SEOPage>
  )
}
