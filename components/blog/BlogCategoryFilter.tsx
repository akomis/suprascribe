import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { BLOG_CATEGORIES } from '@/lib/config/blog/types'
import type { BlogPostSummary } from '@/lib/config/blog/types'
import Link from 'next/link'

interface BlogCategoryFilterProps {
  posts: BlogPostSummary[]
}

/**
 * The category chips (directly under the page subheader) and the post grid below the separator.
 *
 * The chips were a client-side filter over local state, which meant the four categories had no URL:
 * nothing could link to one, they were absent from the sitemap, and no category term could rank.
 * They are links to /blog/category/[category] now. The trade-off is the old multi-select union,
 * which is little loss - selecting all four was close to the unfiltered index, and the pages it
 * replaces carry their own copy and schema.
 *
 * No longer a client component: nothing here holds state, so the whole index stays server-rendered.
 *
 * Imports from `@/lib/config/blog/types` rather than the barrel - the barrel pulls in every post
 * body, and the type-only rollup is all this needs.
 */
export function BlogCategoryFilter({ posts }: BlogCategoryFilterProps) {
  return (
    <>
      {/* Wider than the header's max-w-3xl so the chips stay on one row. */}
      <section className="container mx-auto px-4 pb-6 sm:pb-8 max-w-4xl space-y-2">
        <div
          aria-labelledby="blog-filter-label"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span id="blog-filter-label" className="mr-1 text-sm text-muted-foreground">
            Browse by
          </span>

          {BLOG_CATEGORIES.map((category) => (
            <Badge
              key={category.id}
              asChild
              variant="outline"
              // Overrides go on Badge, not on the child: `asChild` hands them to Radix Slot, which
              // concatenates classNames instead of running them through tailwind-merge.
              className="px-3 py-1 text-sm"
            >
              <Link href={`/blog/category/${category.id}`}>{category.label}</Link>
            </Badge>
          ))}
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  )
}
