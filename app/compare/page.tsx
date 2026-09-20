import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { PageShell } from '@/components/shared/SEOPage'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { competitors } from '@/lib/config/comparisons'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'
import Link from 'next/link'

export const metadata: Metadata = buildMetadata({
  title: 'Subscription Tracker Comparison',
  description:
    'Compare Suprascribe to popular subscription trackers. How it stacks up against ReSubs, Bobby, Rocket Money, YNAB and more on price, features, privacy.',
  path: '/compare',
})

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
            Suprascribe vs. other Trackers
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

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              What actually separates these tools
            </h2>
            <p className="text-muted-foreground">
              Subscription trackers look alike on a feature list and behave very differently in
              practice. Four differences decide which one suits you, and every comparison page here
              is written against them.
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">
                How the subscriptions get found
              </h3>
              <p className="text-muted-foreground">
                Manual trackers wait for you to type each one in, which works right up until you
                forget the charge you were trying to catch. Automatic ones either read your bank
                feed through Plaid or read your inbox for receipts. Suprascribe reads the inbox: the
                receipt names the service, and no account number is involved.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">What the free tier really is</h3>
              <p className="text-muted-foreground">
                A free tier capped at five subscriptions is a trial with a longer expiry date - the
                cap bites at roughly the point the tool starts being useful. Suprascribe&apos;s free
                tier has no subscription limit; PRO adds automatic discovery and the convenience
                features, once.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">Recurring fee or one payment</h3>
              <p className="text-muted-foreground">
                Paying a monthly fee to a tool whose job is to cut your monthly fees is a strange
                arrangement, and it is the norm in this category. Suprascribe&apos;s PRO upgrade is
                a single payment.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold tracking-tight">Where it runs</h3>
              <p className="text-muted-foreground">
                Several of the trackers here are iOS-only or Android-only, so a household on mixed
                devices cannot share a list. Suprascribe runs in any browser, and the source is on
                GitHub if you would rather audit it or host it yourself.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <SiteFooter />
    </PageShell>
  )
}
