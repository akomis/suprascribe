'use client'

import { BlogPostCard } from '@/components/blog/BlogPostCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { BLOG_CATEGORIES, getPostCategories } from '@/lib/config/blog/types'
import type { BlogCategory, BlogPostSummary } from '@/lib/config/blog/types'
import { X } from 'lucide-react'
import * as React from 'react'

interface BlogCategoryFilterProps {
  posts: BlogPostSummary[]
}

/**
 * The category chips (directly under the page subheader) and the post grid below the separator.
 * Both live in one component because they share the selection state. Nothing selected shows everything;
 * selecting several is a union, not an intersection, because a post sits in more than one category.
 *
 * Filtering is client-side on purpose: the server still renders every card into the static HTML, so
 * the index stays fully prerendered and crawlers see the whole list.
 *
 * Imports from `@/lib/config/blog/types` rather than the barrel - the barrel pulls in every post
 * body, which would land in the client bundle.
 */
export function BlogCategoryFilter({ posts }: BlogCategoryFilterProps) {
  const [selected, setSelected] = React.useState<BlogCategory[]>([])

  const categorised = React.useMemo(
    () => posts.map((post) => ({ post, categories: getPostCategories(post.topics) })),
    [posts],
  )

  const visible = React.useMemo(
    () =>
      selected.length === 0
        ? posts
        : categorised
            .filter(({ categories }) => categories.some((c) => selected.includes(c)))
            .map(({ post }) => post),
    [posts, categorised, selected],
  )

  function toggle(category: BlogCategory) {
    setSelected((current) =>
      current.includes(category) ? current.filter((c) => c !== category) : [...current, category],
    )
  }

  return (
    <>
      {/* Wider than the header's max-w-3xl so the five chips stay on one row. */}
      <section className="container mx-auto px-4 pb-6 sm:pb-8 max-w-4xl space-y-2">
        <div
          role="group"
          // Labelled by the visible text rather than a duplicate aria-label, so the group's
          // accessible name is the same string sighted users read.
          aria-labelledby="blog-filter-label"
          className="flex flex-wrap items-center justify-center gap-2"
        >
          <span id="blog-filter-label" className="mr-1 text-sm text-muted-foreground">
            Filter by
          </span>

          {BLOG_CATEGORIES.map((category) => {
            const active = selected.includes(category.id)
            return (
              <Badge
                key={category.id}
                asChild
                variant={active ? 'default' : 'outline'}
                // Overrides go on Badge, not on the child: `asChild` hands them to Radix Slot, which
                // concatenates classNames instead of running them through tailwind-merge.
                className={cn(
                  'cursor-pointer px-3 py-1 text-sm',
                  // Badge's own hover styles are scoped to anchors, so a button needs its own.
                  !active && 'hover:bg-accent hover:text-accent-foreground',
                )}
              >
                <button type="button" aria-pressed={active} onClick={() => toggle(category.id)}>
                  {category.label}
                </button>
              </Badge>
            )
          })}
        </div>

        {/* Height is reserved so selecting a category doesn't push the grid down a line. */}
        <div className="flex min-h-8 items-center justify-center gap-2">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {selected.length > 0 ? `Showing ${visible.length} of ${posts.length} posts` : ''}
          </p>
          {selected.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelected([])}
              className="h-7 gap-1 px-2 text-sm text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  )
}
