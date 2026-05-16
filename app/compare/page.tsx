import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { competitors } from '@/lib/config/comparisons'
import { ArrowLeft, ArrowRight } from 'lucide-react'
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
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '<') }}
      />
      <div className="flex flex-col px-4 md:px-8">
        <div className="container mx-auto px-4 pt-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft /> Back to Home
            </Button>
          </Link>
        </div>

        <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl text-center">
          <div className="space-y-6">
            <SuprascribeLogo size={36} layout="column" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Suprascribe vs. The Alternatives
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Most subscription trackers either charge a monthly fee, cap the free tier, require
              bank access, or lock you to a single platform. Suprascribe does none of those things.
              See how we compare to the most popular alternatives.
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

        <footer className="border-t py-4 sm:py-6">
          <div className="container mx-auto px-2 sm:px-4">
            <div className="flex flex-col items-center justify-between gap-2 sm:gap-3 md:flex-row">
              <SuprascribeLogo />
              <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Home
                </Link>
                <Link
                  href="/free-subscription-tracker"
                  className="hover:text-foreground transition-colors"
                >
                  Free Tracker
                </Link>
                <Link
                  href="/subscription-management-app"
                  className="hover:text-foreground transition-colors"
                >
                  App
                </Link>
                <Link href="/faq" className="hover:text-foreground transition-colors">
                  FAQ
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
