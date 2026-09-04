import { Button } from '@/components/ui/button'
import type { BlogPostSummary } from '@/lib/config/blog'
import { formatBlogDate } from '@/lib/utils/date'
import { ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

interface BlogPostCardProps {
  post: BlogPostSummary
  /** `grid` for equal-height cards in a grid, `row` for a stacked list. */
  variant?: 'grid' | 'row'
  /** Heading level, so the card fits the outline of whatever page renders it. */
  as?: 'h2' | 'h3'
}

/**
 * One post as a linked card. Shared by the blog index, the related-posts list on an
 * article, the landing page, and the SEO landing pages, so a change to how a post is
 * summarised lands everywhere at once.
 */
export function BlogPostCard({ post, variant = 'grid', as: Heading = 'h2' }: BlogPostCardProps) {
  const href = `/blog/${post.slug}`

  if (variant === 'row') {
    return (
      <article className="border rounded-lg p-5 space-y-2 hover:bg-muted/30 transition-colors">
        <div className="flex items-baseline justify-between gap-3">
          <Heading className="font-semibold">
            <Link href={href} className="hover:underline underline-offset-4">
              {post.title}
            </Link>
          </Heading>
          <p className="text-xs text-muted-foreground shrink-0">
            {formatBlogDate(post.publishedAt)}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">{post.intro}</p>
        <div className="flex justify-end">
          <Link href={href}>
            <Button variant="ghost" size="sm" className="px-0 text-sm">
              Read →
            </Button>
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article className="flex flex-col border rounded-lg p-6 space-y-3 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>{formatBlogDate(post.publishedAt)}</span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.readingTimeMin} min read
        </span>
      </div>
      <Heading className="text-xl font-semibold tracking-tight">
        <Link href={href} className="hover:underline underline-offset-4">
          {post.title}
        </Link>
      </Heading>
      <p className="text-sm text-muted-foreground">{post.intro}</p>
      <div className="mt-auto flex justify-end pt-2">
        <Link href={href}>
          <Button variant="ghost" size="sm" className="px-0 gap-1 hover:gap-2 transition-all">
            Read article <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </article>
  )
}
