import { SiteFooter } from '@/components/shared/SiteFooter'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { competitors } from '@/lib/config/comparisons'
import { ArrowLeft, Check, X } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export function generateStaticParams() {
  return competitors.map((c) => ({ competitor: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ competitor: string }>
}): Promise<Metadata> {
  const { competitor: slug } = await params
  const competitor = competitors.find((c) => c.slug === slug)
  if (!competitor) return {}

  return {
    title: `Suprascribe vs ${competitor.name} - Free Subscription Tracker Comparison`,
    description: competitor.metaDescription,
    alternates: {
      canonical: `https://www.suprascribe.com/compare/${slug}`,
    },
  }
}

export default async function CompetitorPage({
  params,
}: {
  params: Promise<{ competitor: string }>
}) {
  const { competitor: slug } = await params
  const competitor = competitors.find((c) => c.slug === slug)
  if (!competitor) notFound()

  const otherCompetitors = competitors.filter((c) => c.slug !== slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: `Suprascribe vs ${competitor.name}`,
        url: `https://www.suprascribe.com/compare/${slug}`,
        description: `Feature and pricing comparison between Suprascribe and ${competitor.name} for subscription management.`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is ${competitor.name} free?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: competitor.pricing,
            },
          },
          {
            '@type': 'Question',
            name: `Does ${competitor.name} require bank account access?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: competitor.requiresBankLinking
                ? `Yes. ${competitor.name} requires linking your bank account to detect subscriptions. Suprascribe uses email scanning instead - no bank access required at any tier.`
                : `No. ${competitor.name} does not require bank account access. Suprascribe also requires no bank linking - subscriptions are discovered by scanning Gmail, Outlook, or iCloud.`,
            },
          },
          {
            '@type': 'Question',
            name: `What is the best alternative to ${competitor.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Suprascribe is the top alternative to ${competitor.name}. It offers unlimited free subscription tracking, automatic discovery via email scanning (no bank access), and a one-time Pro upgrade with no recurring fees. ${competitor.verdict}`,
            },
          },
        ],
      },
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
          {
            '@type': 'ListItem',
            position: 3,
            name: `vs. ${competitor.name}`,
            item: `https://www.suprascribe.com/compare/${slug}`,
          },
        ],
      },
    ],
  }

  const featureRows = [
    {
      feature: 'Email auto-discovery',
      suprascribe: true,
      them: competitor.suprascribeWins.some((w) => w.label === 'Email auto-discovery')
        ? false
        : null,
      suprascribeDetail: 'Scans Gmail, Outlook, iCloud, and IMAP automatically',
    },
    {
      feature: 'No bank account required',
      suprascribe: true,
      them: !competitor.suprascribeWins.some((w) => w.label.toLowerCase().includes('bank')),
    },
    {
      feature: 'Web-based (any browser/device)',
      suprascribe: true,
      them: !competitor.suprascribeWins.some(
        (w) => w.label.toLowerCase().includes('web') || w.label.toLowerCase().includes('platform'),
      ),
    },
    {
      feature: 'Free unlimited tier',
      suprascribe: true,
      them: !competitor.suprascribeWins.some(
        (w) =>
          w.label.toLowerCase().includes('free') || w.label.toLowerCase().includes('unlimited'),
      ),
    },
    {
      feature: 'One-time purchase option',
      suprascribe: true,
      them:
        !competitor.isSubscription &&
        !competitor.suprascribeWins.some((w) => w.label.toLowerCase().includes('one-time')),
    },
    {
      feature: 'Open source',
      suprascribe: true,
      them: !competitor.suprascribeWins.some((w) => w.label.toLowerCase().includes('open source')),
    },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '<') }}
      />
      <div className="flex flex-col px-4 md:px-8">
        <div className="container mx-auto px-4 pt-8">
          <Link href="/compare">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft /> All Comparisons
            </Button>
          </Link>
        </div>

        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <SuprascribeLogo size={28} />
              <span className="text-muted-foreground font-medium">vs.</span>
              <span className="font-bold text-xl">{competitor.name}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Suprascribe vs. {competitor.name}
            </h1>
            <p className="text-muted-foreground text-lg">{competitor.tagline}</p>
            <p className="text-muted-foreground leading-relaxed">{competitor.intro}</p>
            <div className="flex flex-wrap gap-3">
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

        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Pricing</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border rounded-lg p-5 space-y-3">
                <p className="font-semibold">Suprascribe</p>
                <p className="text-muted-foreground text-sm">
                  Basic free forever. Pro is a one-time purchase - no recurring fees.
                </p>
              </div>
              <div className="border rounded-lg p-5 space-y-3">
                <p className="font-semibold">{competitor.name}</p>
                <p
                  className={`text-sm ${competitor.isSubscription ? 'text-destructive' : 'text-muted-foreground'}`}
                >
                  {competitor.pricing}
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Feature Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 pr-4 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 font-medium">Suprascribe</th>
                    <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                      {competitor.name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {featureRows.map((row) => (
                    <tr key={row.feature} className="border-b last:border-0">
                      <td className="py-3 pr-4">{row.feature}</td>
                      <td className="text-center py-3 px-4">
                        {row.suprascribe ? (
                          <Check className="h-4 w-4 mx-auto text-primary" />
                        ) : (
                          <X className="h-4 w-4 mx-auto text-muted-foreground/50" />
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {row.them === true ? (
                          <Check className="h-4 w-4 mx-auto text-muted-foreground/60" />
                        ) : row.them === false ? (
                          <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">
                  What {competitor.name} Does Well
                </h2>
                <ul className="space-y-2">
                  {competitor.strengths.map((strength) => (
                    <li key={strength} className="text-muted-foreground text-sm flex gap-2">
                      <span className="mt-0.5 shrink-0">•</span>
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h2 className="text-xl font-bold tracking-tight">Where Suprascribe Wins</h2>
                <ul className="space-y-3">
                  {competitor.suprascribeWins.map((win) => (
                    <li key={win.label} className="text-sm flex items-start gap-2">
                      <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                      <span>
                        <span className="font-medium">{win.label}</span>
                        {win.detail && (
                          <span className="text-muted-foreground"> - {win.detail}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <blockquote className="border-l-2 border-border pl-4 italic text-muted-foreground">
              {competitor.verdict}
            </blockquote>
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

        <section className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-6">
            <h2 className="text-xl font-bold tracking-tight">Also Compare</h2>
            <div className="flex flex-wrap gap-2">
              {otherCompetitors.map((c) => (
                <Link key={c.slug} href={`/compare/${c.slug}`}>
                  <Button variant="outline" size="sm">
                    vs. {c.name}
                  </Button>
                </Link>
              ))}
            </div>
            {competitor.openAlternativeUrl && (
              <p className="text-sm text-muted-foreground">
                Looking for more{' '}
                <Link
                  href={competitor.openAlternativeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  {competitor.name} alternatives on OpenAlternative
                </Link>
                ?
              </p>
            )}
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

        <section className="container mx-auto px-4 py-8 max-w-3xl text-center">
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Ready to Switch?</h2>
            <p className="text-muted-foreground">
              Suprascribe is free to start. No credit card, no recurring fees.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/login?tab=signup">
                <Button size="lg">Start Free</Button>
              </Link>
              <Link href="/demo">
                <Button size="lg" variant="outline">
                  Try the Demo
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Separator />

        <SiteFooter />
      </div>
    </>
  )
}
