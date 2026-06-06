import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { PageShell } from '@/components/shared/SEOPage'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { competitors } from '@/lib/config/comparisons'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Suprascribe vs. Alternatives - Subscription Tracker Comparison',
  description:
    'Compare Suprascribe to popular subscription trackers and managers. See how we stack up against ReSubs, Bobby, Rocket Money, YNAB, and more on price, features, and privacy.',
  alternates: {
    canonical: 'https://www.suprascribe.com/compare',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suprascribe.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Compare',
          item: 'https://www.suprascribe.com/compare',
        },
      ],
    },
    {
      '@type': 'ItemList',
      name: 'Subscription Tracker Comparisons',
      itemListElement: competitors.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: `Suprascribe vs. ${c.name}`,
        url: `https://www.suprascribe.com/compare/${c.slug}`,
      })),
    },
  ],
}

export default function ComparePage() {
  return (
    <PageShell jsonLd={jsonLd}>
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl text-center">
        <div className="space-y-6">
          <SuprascribeLogo size={36} layout="column" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            Suprascribe vs. The Alternatives
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Most subscription trackers either charge a monthly fee, cap the free tier, require bank
            access, or lock you to a single platform. Suprascribe does none of those things. See how
            we compare to the most popular alternatives.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/login?tab=signup">
              <Button size="lg">Try Suprascribe Free</Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                See the Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">All Comparisons</h2>
          <p className="text-muted-foreground">
            Each page covers pricing, feature differences, and privacy trade-offs in detail.
          </p>
          <div className="grid gap-3 pt-4">
            {competitors.map((competitor) => (
              <Link key={competitor.slug} href={`/compare/${competitor.slug}`}>
                <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/40 transition-colors group">
                  <div className="space-y-0.5">
                    <p className="font-semibold">Suprascribe vs. {competitor.name}</p>
                    <p className="text-sm text-muted-foreground">{competitor.tagline}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0 ml-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      <SiteFooter />
    </PageShell>
  )
}
