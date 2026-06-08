import { BadgesCarousel } from '@/components/landing/BadgesCarousel'
import { CompetitorTable } from '@/components/landing/CompetitorTable'
import { DiscoveryLearnMoreButton } from '@/components/landing/DiscoveryLearnMoreButton'
import { FAQSection } from '@/components/landing/FAQSection'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { ShinyText } from '@/components/landing/ShinyText'
import { StaticGridBackground } from '@/components/landing/StaticGridBackground'
import { SiteFooter } from '@/components/shared/SiteFooter'
import dynamic from 'next/dynamic'

const FeatureCard = dynamic(() =>
  import('@/components/landing/FeatureCard').then((m) => ({ default: m.FeatureCard })),
)
const ScreenshotsShowcase = dynamic(() =>
  import('@/components/landing/ScreenshotsShowcase').then((m) => ({
    default: m.ScreenshotsShowcase,
  })),
)
const TierCard = dynamic(() =>
  import('@/components/landing/TierCard').then((m) => ({ default: m.TierCard })),
)
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { featuredFaqItems } from '@/lib/config/faq'
import { getEnabledFeaturesByTier } from '@/lib/config/features'
import { GITHUB_URL } from '@/lib/config/urls'
import { Github, Lock, ShieldCheck, User } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Suprascribe - Free Subscription Tracker & Manager',
  description:
    'Stop losing money on forgotten subscriptions. Suprascribe auto-scans Gmail, Outlook & iCloud to find every recurring payment. Free forever.',
  alternates: {
    canonical: 'https://www.suprascribe.com',
  },
}

const homepageFaqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: featuredFaqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function Home() {
  const basicFeatures = getEnabledFeaturesByTier('basic')
  const proFeatures = getEnabledFeaturesByTier('pro')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageFaqJsonLd).replace(/</g, '<') }}
      />
      <div className="flex flex-col px-4 md:px-8">
        {/* Hero Section */}
        <section className="relative container mx-auto flex flex-col items-start justify-start gap-3 sm:gap-4 md:gap-6 text-center py-16 md:py-52">
          <StaticGridBackground />

          <div className="z-10 w-full flex justify-center">
            <Link
              href="/"
              className="flex flex-col items-center hover:opacity-80 transition-opacity"
            >
              <Image
                src="/logo.jpg"
                alt="Suprascribe Logo"
                width={42}
                height={42}
                className="rounded-lg"
                priority
              />
            </Link>
          </div>

          <div className="z-10 w-full flex justify-center -mt-2">
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-border bg-background/60 px-4 py-1 text-xs font-medium backdrop-blur-sm transition-colors hover:border-foreground/30 hover:bg-background/80"
            >
              <ShinyText
                text="Release v1.2 - June 2026"
                speed={3}
                color="#888888"
                shineColor="#ffffff"
              />
            </Link>
          </div>

          <h1 className="max-w-5xl font-bold block tracking-tighter text-5xl md:text-6xl lg:text-7xl text-muted-foreground z-20 mx-auto">
            You Are Losing Money
          </h1>

          <div className="flex flex-col gap-4 z-10 mx-auto">
            <p className="max-w-3xl text-base sm:text-lg md:text-xl text-muted-foreground px-2">
              Suprascribe helps you automatically find all your paying subscriptions through your
              inbox and then manage, cancel, group them in less than a minute
            </p>
            <div className="flex flex-col-reverse sm:flex-row items-center justify-center gap-2 sm:gap-4">
              <LandingCTA />
            </div>
          </div>
        </section>

        <ScreenshotsShowcase />

        {/* Feature Cards */}
        <section className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
          <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-1 lg:grid-cols-3">
              <FeatureCard
                icon={<Lock className="h-8 w-8" />}
                title="Safe & Private"
                description="Your data stays yours. We never read unrelated emails or store them in any way. Your inbox, your privacy."
                actionComponent={<DiscoveryLearnMoreButton />}
              />
              <FeatureCard
                icon={<User className="h-8 w-8" />}
                title="User Centric"
                description="Our goal is to help you clear up your subscriptions with ease and peace of mind-not keep you in the app. A few times a year is all you need."
              />
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8" />}
                title="No Subscriptions"
                description="Suprascribe will never be a subscription-based tool. Core features always free, Pro features available as a one-time purchase. Pay once, own forever."
              />
            </div>
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[50vw] mx-auto" />

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
          <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
            <div className="text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Straight-forward Pricing
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Honest, Enabling and Open - Not another subscription
              </p>
            </div>

            <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
              <TierCard
                name="Basic"
                description="Perfect for getting started"
                price="€0"
                period=""
                features={basicFeatures}
                buttonText="Get Started"
                buttonVariant="outline"
                href="/login?tab=signup"
              />
              <TierCard
                name="PRO"
                description="For power users who want more"
                price="€10"
                originalPrice="€20"
                earlyBirdLabel="50% OFF - Early Adopter"
                period="once, forever"
                features={proFeatures}
                buttonText="Upgrade to Pro"
                buttonVariant="default"
                isUpgradeButton={true}
                badge="One-Time Purchase"
                highlighted={true}
                checkmarkColor="text-primary"
                additionalNote="Everything in Basic, plus:"
              />
            </div>
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[50vw] mx-auto" />

        {/* Competitor Table */}
        <section className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
          <div className="mx-auto max-w-2xl space-y-8 sm:space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Suprascribe vs. The Alternatives
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                See why Suprascribe outperforms every other subscription management app in both
                features and price
              </p>
            </div>
            <CompetitorTable />
            <p className="text-sm text-muted-foreground text-center">
              Spotted something inaccurate?{' '}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Let us know
              </Link>
              .
            </p>
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[50vw] mx-auto" />

        {/* FAQ Section */}
        <section id="faq" className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
          <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
            <div className="text-center space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground">
                Quick answers to common questions.
              </p>
            </div>
            <FAQSection items={featuredFaqItems} showViewAll />
          </div>
        </section>

        <Separator className="data-[orientation=horizontal]:w-[50vw] mx-auto" />

        {/* Final CTA Section */}
        <section className="container mx-auto py-20 px-4">
          <div className="mx-auto max-w-5xl space-y-8 text-center">
            <div className="space-y-4 text-lg text-muted-foreground text-start">
              <p>
                Suprascribe was born from a simple observation: in today&apos;s world, we&apos;re
                all drowning in subscriptions. From streaming services to cloud storage, from gym
                memberships to software tools-it&apos;s easy to lose track of what you&apos;re
                paying for and how much it all costs. We believe that managing your finances
                shouldn&apos;t require spreadsheets, manual tracking, or surprise charges. We are
                commited to never becoming just another subscription you need to manage. The
                platform will always offer a robust free tier and pro features tailored around the
                users.
              </p>
              <p>
                Suprascribe is fully open source. You can inspect the code, verify how your data is
                handled, and contribute.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Send us a message</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  <Github className="h-4 w-4" /> View on GitHub
                </Link>
              </Button>
            </div>
            <BadgesCarousel />
          </div>
        </section>

        <Separator />

        <SiteFooter />
      </div>
    </>
  )
}
