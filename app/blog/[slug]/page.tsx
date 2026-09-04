import { SEOPage } from '@/components/shared/SEOPage'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { author } from '@/lib/config/author'
import { faqItems } from '@/lib/config/faq'
import {
  blogPosts,
  getBlogPost,
  getClusterPosts,
  getPillarForPost,
  getRelatedPosts,
  getWordCount,
  TOPIC_LABELS,
  type BlogSection,
  type BlogSectionLink,
} from '@/lib/config/blog'
import { Clock, ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'
import { formatBlogDate } from '@/lib/utils/date'
import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { BlogDiagram } from '@/components/blog/BlogDiagram'
import type { ReactElement, ReactNode } from 'react'
import Image from 'next/image'
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

/**
 * A qualifier like "Recommended" sitting beside a heading. Inline-flex rather than a flex
 * container on the heading itself, so the heading text still wraps as normal text.
 */
function HeadingBadge({ label }: { label: string }) {
  return (
    <Badge variant="secondary" className="ml-3 align-middle text-xs font-medium tracking-normal">
      {label}
    </Badge>
  )
}

function renderSection(section: BlogSection, index: number) {
  switch (section.type) {
    case 'h2':
      return (
        <h2 key={index} className="text-2xl sm:text-3xl font-bold tracking-tight pt-4">
          {linkify(section.text ?? '', section.links)}
          {section.badge && <HeadingBadge label={section.badge} />}
        </h2>
      )
    case 'h3':
      return (
        <h3 key={index} className="text-xl font-semibold pt-2">
          {linkify(section.text ?? '', section.links)}
          {section.badge && <HeadingBadge label={section.badge} />}
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
    case 'table': {
      if (!section.table) return null
      const { headers, rows, caption, rowHeaders } = section.table
      return (
        // A horizontally scrolling region has to be reachable by keyboard, so it takes focus
        // and carries a label. `links` are not rendered here - see BlogSection.links.
        <div
          key={index}
          tabIndex={0}
          role="region"
          aria-label={caption ?? 'Table'}
          className="overflow-x-auto rounded-lg border focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
        >
          <Table>
            {caption && <TableCaption>{caption}</TableCaption>}
            <TableHeader>
              <TableRow className="border-t-0">
                {headers.map((header, i) => (
                  <TableHead key={i} scope="col">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {row.map((cell, cellIndex) =>
                    rowHeaders && cellIndex === 0 ? (
                      <TableHead key={cellIndex} scope="row" className="text-foreground">
                        {cell}
                      </TableHead>
                    ) : (
                      <TableCell key={cellIndex}>{cell}</TableCell>
                    ),
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )
    }
    case 'diagram': {
      if (!section.diagram) return null
      return <BlogDiagram key={index} diagram={section.diagram} />
    }
    case 'image': {
      if (!section.image) return null
      const { src, alt, caption, width, height } = section.image
      return (
        <figure key={index} className="space-y-2">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="rounded-lg border w-full h-auto"
            sizes="(max-width: 768px) 100vw, 768px"
          />
          {caption && (
            <figcaption className="text-xs text-muted-foreground text-center">{caption}</figcaption>
          )}
        </figure>
      )
    }
    default:
      return null
  }
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) notFound()

  // Shared pool first, then the post's own questions - the general answers set up the specific ones.
  const postFaqItems = [
    ...faqItems.filter((item) => post.faqQuestions.includes(item.question)),
    ...(post.faq ?? []),
  ]

  // Three, so the row below fills a three-column grid exactly at every breakpoint.
  const relatedPosts = getRelatedPosts(post, 3)
  const pillar = getPillarForPost(post)
  const clusterPosts = post.pillar ? getClusterPosts(post) : []

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
          '@type': 'Person',
          name: author.name,
          url: author.url,
          jobTitle: author.role,
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
        inLanguage: 'en',
        isAccessibleForFree: true,
        articleSection: TOPIC_LABELS[post.topics[0]],
        wordCount: getWordCount(post),
        // Capped at three: a long `about` list reads as keyword padding, not as a subject.
        about: post.topics.slice(0, 3).map((topic) => ({
          '@type': 'Thing',
          name: TOPIC_LABELS[topic],
        })),
      },
      ...(postFaqItems.length > 0
        ? [
            {
              '@type': 'FAQPage',
              '@id': `https://www.suprascribe.com/blog/${post.slug}#faq`,
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
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>
                <Link href="/about-author" className="hover:text-foreground transition-colors">
                  Written by {author.name}
                </Link>
                {', '}
                {formatBlogDate(post.updatedAt ?? post.publishedAt)}
              </span>
              <div className="flex flex-wrap items-center gap-3">
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
                    <Badge
                      variant="secondary"
                      className="rounded-none px-2 py-0.5 text-xs font-medium"
                    >
                      {post.source}
                    </Badge>
                  ))}
                <Badge
                  variant="secondary"
                  className="gap-1 rounded-none px-2 py-0.5 text-xs font-medium"
                >
                  <Clock className="h-3 w-3" />
                  {post.readingTimeMin} min read
                </Badge>
              </div>
            </div>
            {pillar && (
              <div>
                Part of{' '}
                <Link
                  href={`/blog/${pillar.slug}`}
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  {pillar.title}
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <p className="text-lg text-foreground leading-relaxed">{post.intro}</p>
            {post.sections.map((section, i) => renderSection(section, i))}
          </div>
        </div>
      </section>

      {clusterPosts.length > 0 && (
        <>
          <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />
          <section className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
                Every guide in this cluster
              </h2>
              <p className="text-sm text-muted-foreground text-center">
                This is the hub for the topic. Each guide below covers one service or platform in
                detail.
              </p>
              <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 pt-2">
                {clusterPosts.map((member) => (
                  <li key={member.slug}>
                    <Link
                      href={`/blog/${member.slug}`}
                      className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
                    >
                      {member.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </>
      )}

      {relatedPosts.length > 0 && (
        <>
          <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />
          <section className="container mx-auto px-4 py-12 sm:py-16 max-w-6xl">
            <div className="space-y-8">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-center">
                More from the Blog
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((related) => (
                  <BlogPostCard key={related.slug} post={related} as="h3" />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </SEOPage>
  )
}
