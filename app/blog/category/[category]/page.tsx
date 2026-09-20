import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { PageShell } from '@/components/shared/SEOPage'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getBlogPostsNewestFirst } from '@/lib/config/blog'
import { BLOG_CATEGORIES, getPostCategories } from '@/lib/config/blog/types'
import type { BlogCategory } from '@/lib/config/blog/types'
import { buildMetadata } from '@/lib/utils/metadata'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

/**
 * A crawlable page per blog category.
 *
 * The chips on /blog filter client-side, which keeps the index snappy but leaves the four
 * categories with no URL of their own: nothing to link to, nothing to put in the sitemap, and
 * nothing for a search engine to rank for the category term. These routes are the addressable
 * version of the same grouping, built from the existing `getPostCategories` rollup so the two
 * cannot disagree.
 */

interface Props {
  params: Promise<{ category: string }>
}

const COPY: Record<
  BlogCategory,
  { title: string; description: string; intro: string; listingHeading: string }
> = {
  cancelling: {
    title: 'Cancelling Guides',
    description:
      'Step-by-step guides to cancelling subscriptions - what each service actually requires, where the cancel button hides, and what you are entitled to.',
    intro:
      'Service-by-service walkthroughs for actually getting a subscription cancelled, including the ones that make you call or chat to do it.',
    listingHeading: 'Every cancellation guide',
  },
  discovery: {
    title: 'Finding subscriptions',
    description:
      'How to find every subscription you are paying for - across inboxes, app stores, and bank statements - and what the spending data says.',
    intro:
      'The subscriptions that cost the most are the ones you forgot about. These guides cover how to surface the full list.',
    listingHeading: 'Every guide to finding what you pay for',
  },
  trackers: {
    title: 'Trackers',
    description:
      'Reviews and comparisons of subscription tracking tools - what they cost, what access they demand, and which one fits how you want to work.',
    intro:
      'Comparisons and honest reviews of the tools for tracking recurring spend, including the trade-off between bank linking and email scanning.',
    listingHeading: 'Every tracker review and comparison',
  },
  money: {
    title: 'Money & rights',
    description:
      'Consumer rights, financial privacy, and the money side of recurring payments - refunds, price rises, and the rules that protect you.',
    intro:
      'What you are owed when a price goes up or a cancellation is blocked, and what a tracker should never ask for.',
    listingHeading: 'Every guide to your money and your rights',
  },
}

const posts = getBlogPostsNewestFirst()

export function generateStaticParams() {
  return BLOG_CATEGORIES.map((category) => ({ category: category.id }))
}

function isCategory(value: string): value is BlogCategory {
  return BLOG_CATEGORIES.some((category) => category.id === value)
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params
  if (!isCategory(category)) return {}
  return buildMetadata({
    title: `${COPY[category].title} - Suprascribe Blog`,
    description: COPY[category].description,
    path: `/blog/category/${category}`,
  })
}

export default async function BlogCategoryPage({ params }: Props) {
  const { category } = await params
  if (!isCategory(category)) notFound()

  const copy = COPY[category]
  const url = `https://www.suprascribe.com/blog/category/${category}`
  const categoryPosts = posts.filter((post) => getPostCategories(post.topics).includes(category))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${url}#collection`,
        name: copy.title,
        description: copy.description,
        url,
        // The category is a slice of the blog, not a publication of its own.
        isPartOf: { '@type': 'Blog', '@id': 'https://www.suprascribe.com/blog#blog' },
        mainEntity: { '@id': `${url}#post-list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${url}#post-list`,
        itemListElement: categoryPosts.map((post, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `https://www.suprascribe.com/blog/${post.slug}`,
          name: post.title,
        })),
      },
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
          { '@type': 'ListItem', position: 3, name: copy.title, item: url },
        ],
      },
    ],
  }

  return (
    <PageShell jsonLd={jsonLd}>
      <section className="container mx-auto px-4 pt-6 pb-3 max-w-3xl text-center">
        <div className="space-y-4">
          <SuprascribeLogo size={36} layout="column" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            {copy.title}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {copy.intro}
          </p>
          <p className="text-sm text-muted-foreground">
            {categoryPosts.length} {categoryPosts.length === 1 ? 'guide' : 'guides'}
          </p>
        </div>
      </section>

      {/* The sibling categories, so each of these pages is reachable from every other one. */}
      <section className="container mx-auto px-4 pb-6 max-w-4xl">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="mr-1 text-sm text-muted-foreground">More</span>
          {BLOG_CATEGORIES.filter((c) => c.id !== category).map((c) => (
            <Badge key={c.id} asChild variant="outline" className="px-3 py-1 text-sm">
              <Link href={`/blog/category/${c.id}`}>{COPY[c.id].title}</Link>
            </Badge>
          ))}
          <Badge asChild variant="outline" className="px-3 py-1 text-sm">
            <Link href="/blog">All posts</Link>
          </Badge>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl space-y-8">
        {/*
         * A heading of this page's own, above cards that are h3s rather than h2s. Left as h2s,
         * the newest post in the category became this page's first h2 - the same string as the
         * first h2 on /blog and on any sibling category holding that post.
         */}
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
          {copy.listingHeading}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} as="h3" />
          ))}
        </div>

        <div className="pt-12 text-center">
          <Link href="/blog">
            <Button variant="ghost">
              <ArrowLeft /> All blog posts
            </Button>
          </Link>
        </div>
      </section>

      <Separator />

      <SiteFooter />
    </PageShell>
  )
}
