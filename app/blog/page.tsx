import { Button } from '@/components/ui/button'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { PageShell } from '@/components/shared/SEOPage'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { Separator } from '@/components/ui/separator'
import { blogPosts } from '@/lib/config/blog'
import { ArrowRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Blog - Subscription Tips, Privacy Guides & More',
  description:
    'Practical guides on managing subscriptions, cancelling services you forgot about, and choosing a subscription tracker that respects your privacy.',
  alternates: {
    canonical: 'https://www.suprascribe.com/blog',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Blog',
      name: 'Suprascribe Blog',
      url: 'https://www.suprascribe.com/blog',
      description: metadata.description,
      publisher: {
        '@type': 'Organization',
        name: 'Suprascribe',
        url: 'https://www.suprascribe.com',
      },
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function BlogIndexPage() {
  return (
    <PageShell jsonLd={jsonLd}>
      <section className="container mx-auto px-4 py-12 sm:py-16 max-w-3xl text-center">
        <div className="space-y-4">
          <SuprascribeLogo size={36} layout="column" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">Blog</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Practical guides on managing subscriptions, protecting your privacy, and stopping
            recurring charges you forgot about.
          </p>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-6">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="border rounded-lg p-6 space-y-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span>{formatDate(post.publishedAt)}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readingTimeMin} min read
                </span>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">{post.title}</h2>
              <p className="text-sm text-muted-foreground">{post.intro}</p>
              <Link href={`/blog/${post.slug}`}>
                <Button variant="ghost" size="sm" className="px-0 gap-1 hover:gap-2 transition-all">
                  Read article <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <Separator />

      <SiteFooter />
    </PageShell>
  )
}
