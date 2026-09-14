import { BlogCategoryFilter } from '@/components/blog/BlogCategoryFilter'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { PageShell } from '@/components/shared/SEOPage'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { Separator } from '@/components/ui/separator'
import { getBlogPostsNewestFirst } from '@/lib/config/blog'
import type { BlogPostSummary } from '@/lib/config/blog'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Blog - Subscription Tips, Privacy Guides & More',
  description:
    'Practical guides on managing subscriptions, cancelling services you forgot about, and choosing a subscription tracker that respects your privacy.',
  path: '/blog',
})

const posts = getBlogPostsNewestFirst()

// Only what a card renders. Handing whole posts to a client component would serialise every
// article body into this page's RSC payload.
const cardPosts: BlogPostSummary[] = posts.map(
  ({ slug, title, intro, publishedAt, readingTimeMin, topics }) => ({
    slug,
    title,
    intro,
    publishedAt,
    readingTimeMin,
    topics,
  }),
)

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      // Every article's `isPartOf` points at this @id, so it has to be declared here.
      '@id': 'https://www.suprascribe.com/blog#blog',
      name: 'Suprascribe Blog',
      url: 'https://www.suprascribe.com/blog',
      description: metadata.description,
      publisher: {
        '@type': 'Organization',
        '@id': 'https://www.suprascribe.com/#organization',
      },
      mainEntity: { '@id': 'https://www.suprascribe.com/blog#post-list' },
    },
    {
      // The whole index as one machine-readable list. URL and name only - descriptions
      // belong on the articles themselves.
      '@type': 'ItemList',
      '@id': 'https://www.suprascribe.com/blog#post-list',
      itemListElement: posts.map((post, i) => ({
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
      ],
    },
  ],
}

export default function BlogIndexPage() {
  return (
    <PageShell jsonLd={jsonLd}>
      <section className="container mx-auto px-4 pt-12 pb-3 max-w-3xl text-center">
        <div className="space-y-4">
          <SuprascribeLogo size={36} layout="column" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Blog</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical guides on managing subscriptions, protecting your privacy, and stopping
            recurring charges you forgot about.
          </p>
        </div>
      </section>

      {/* Renders the chip row, the separator under it, and the post grid. */}
      <BlogCategoryFilter posts={cardPosts} />

      <Separator />

      <SiteFooter />
    </PageShell>
  )
}
