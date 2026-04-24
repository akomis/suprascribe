import { BackgroundRippleEffect } from '@/components/landing/BackgroundRippleEffect'
import { DiscoveryLearnMoreButton } from '@/components/landing/DiscoveryLearnMoreButton'
import { FeatureCard } from '@/components/landing/FeatureCard'
import { LandingCTA } from '@/components/landing/LandingCTA'
import { Reveal } from '@/components/landing/Reveal'
import { ScreenshotsShowcase } from '@/components/landing/ScreenshotsShowcase'
import { ScrollToBottomButton } from '@/components/landing/ScrollToBottomButton'
import { ShinyText } from '@/components/landing/ShinyText'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { TierCard } from '@/components/landing/TierCard'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getEnabledFeaturesByTier } from '@/lib/config/features'
import { Github, Lock, ShieldCheck, User } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Suprascribe - Free Subscription Tracker That Finds Your Subscriptions Automatically',
  description:
    'Stop losing money on forgotten subscriptions. Suprascribe auto-scans Gmail, Outlook & iCloud to find every recurring payment. Free forever.',
  alternates: {
    canonical: 'https://www.suprascribe.com',
  },
}

export default function Home() {
  const basicFeatures = getEnabledFeaturesByTier('basic')
  const proFeatures = getEnabledFeaturesByTier('pro')

  return (
    <div className="flex flex-col px-4 md:px-8">
      <section className="relative container mx-auto flex h-screen min-h-fit flex-col items-center justify-center gap-3 sm:gap-4 md:gap-8 text-center">
        <BackgroundRippleEffect />

        <Reveal delayMs={2000} animation="fadeIn" className="z-10 -mt-20">
          <SuprascribeLogo size={42} layout="column" />
        </Reveal>

        <Reveal delayMs={300} animation="fadeIn" className="z-10 -mt-4">
          <span className="inline-flex items-center rounded-full border border-border bg-background/60 px-4 py-1 text-xs font-medium backdrop-blur-sm">
            <ShinyText
              text="Release v1.0 - April 2026"
              speed={3}
              color="#888888"
              shineColor="#ffffff"
            />
          </span>
        </Reveal>

        <Reveal delayMs={200} className="z-10">
          <h1 className="max-w-4xl font-bold">
            <span className="block tracking-tight text-xl md:text-4xl lg:text-5xl font-light">
              Discover and Take Control of Your
            </span>
            <span className="block tracking-tighter text-5xl md:text-7xl lg:text-8xl text-muted-foreground z-20">
              Subscriptions
            </span>
          </h1>
        </Reveal>

        <Reveal delayMs={1000} className="flex flex-col gap-4 z-10">
          <p className="max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            Suprascribe helps you automatically discover and manage your subscriptions across
            services that result in recurring billing
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <LandingCTA />
          </div>
        </Reveal>

        <ScrollToBottomButton />
      </section>

      <ScreenshotsShowcase />

      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
        <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center tracking-tight">
            Everything You Need to Track Your Subscriptions
          </h2>
          <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-1 lg:grid-cols-3">
            <Reveal delayMs={100}>
              <FeatureCard
                icon={<Lock className="h-8 w-8" />}
                title="Safe & Private"
                description="Your data stays yours. We never read unrelated emails or store them in any way. Your inbox, your privacy."
                actionComponent={<DiscoveryLearnMoreButton />}
              />
            </Reveal>
            <Reveal delayMs={200}>
              <FeatureCard
                icon={<User className="h-8 w-8" />}
                title="User Centric"
                description="Our goal is to help you clear up your subscriptions with ease and peace of mind-not keep you in the app. A few times a year is all you need."
              />
            </Reveal>
            <Reveal delayMs={300}>
              <FeatureCard
                icon={<ShieldCheck className="h-8 w-8" />}
                title="No Subscriptions"
                description="Suprascribe will never be a subscription-based tool. Core features always free, Pro features available as a one-time purchase. Pay once, own forever."
              />
            </Reveal>
          </div>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[50vw] mx-auto" />

      <section id="pricing" className="container mx-auto py-10 sm:py-20 px-2 sm:px-4">
        <div className="mx-auto max-w-5xl space-y-8 sm:space-y-12">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Simple, Honest Pricing - Not another subscription
            </h2>
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              We believe in keeping things simple. No hidden fees, no surprises.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 md:gap-8 md:grid-cols-2">
            <Reveal delayMs={100}>
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
            </Reveal>
            <Reveal delayMs={400}>
              <TierCard
                name="Pro"
                description="For power users who want more"
                price="€5"
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
            </Reveal>
          </div>
        </div>
      </section>

      <Separator className="data-[orientation=horizontal]:w-[60vw] mx-auto" />

      <Reveal>
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
                handled, and contribute on{' '}
                <Link
                  href="https://github.com/akomis/suprascribe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-foreground transition-colors"
                >
                  GitHub
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-8">
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact">Send us a message</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link
                  href="https://github.com/akomis/suprascribe"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-4 w-4" /> View on GitHub
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>

      <Separator />

      <footer className="border-t py-4 sm:py-6">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex flex-col items-center justify-between gap-2 sm:gap-3 md:flex-row">
            <SuprascribeLogo />

            <div className="flex gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <Link href="/terms-and-privacy" className="hover:text-foreground transition-colors">
                Terms & Privacy
              </Link>
              <Link href="/safety" className="hover:text-foreground transition-colors">
                Safety
              </Link>
              <Link href="/limits" className="hover:text-foreground transition-colors">
                Limits
              </Link>
              <Link
                href="https://github.com/akomis/suprascribe"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                GitHub
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
