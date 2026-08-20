import { IntroOnly, OnceStepProvider } from '@/components/discovery-once/OnceStepContext'
import { PayCta } from '@/components/discovery-once/PayCta'
import { TryFunnel } from '@/components/discovery-once/TryFunnel'
import { StaticGridBackground } from '@/components/landing/StaticGridBackground'
import { Spinner } from '@/components/ui/spinner'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

const CANONICAL = 'https://www.suprascribe.com/one-time-scan'
const TITLE = 'One-Time Subscription Audit for €1'
const DESCRIPTION =
  'Scan one inbox once for €1 and reveal your subscriptions with unsubscribe links. No account, no sign-up, nothing saved.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
  },
  twitter: {
    title: TITLE,
    description: DESCRIPTION,
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      '@id': `${CANONICAL}#webpage`,
      url: CANONICAL,
      name: TITLE,
      description: DESCRIPTION,
      isPartOf: { '@id': 'https://www.suprascribe.com/#website' },
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://www.suprascribe.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'One-Time Subscription Audit',
          item: CANONICAL,
        },
      ],
    },
  ],
}

export default function TryPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16">
        <StaticGridBackground />
        <Link href="/" className="z-10 hover:opacity-80 transition-opacity">
          <Image
            src="/logo.jpg"
            alt="Suprascribe Logo"
            width={42}
            height={42}
            className="rounded-lg"
            priority
          />
        </Link>

        <OnceStepProvider>
          {/* Server-rendered so crawlers and AI agents see the offer without executing JS.
              TryFunnel below calls useSearchParams(), which bails its Suspense boundary out
              to client-side rendering - nothing indexable may live inside it. */}
          <IntroOnly>
            <div className="z-10 flex flex-col items-center gap-6 text-center max-w-3xl">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Find your subscriptions for €1
                </h1>
                <p>No account, no sign-up, nothing stored on our servers.</p>
                <p className="text-muted-foreground">
                  A one-time scan of a single Gmail/Outlook inbox. We reveal every subscription we
                  find, each with an unsubscribe link so you can perform a quick and effective
                  subscription audit.
                </p>
              </div>
              <div className="space-y-2 mt-6">
                <PayCta />
              </div>
            </div>
          </IntroOnly>

          <div className="z-10 w-full flex justify-center">
            <Suspense fallback={<Spinner className="size-10 text-primary" />}>
              <TryFunnel />
            </Suspense>
          </div>
        </OnceStepProvider>

        <Link
          href="/"
          className="z-10 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to Suprascribe
        </Link>
      </div>
    </>
  )
}
