import { ConfigureApiKeyButton } from '@/components/ConfigureApiKeyButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MAX_TOTAL_DISCOVERIES } from '@/lib/utils/discovery-rate-limit'
import { ArrowLeft, HelpCircle, Infinity, Key, Shield, Timer, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Email Discovery Limits & Bring Your Own Key (BYOK)',
  description:
    'Suprascribe gives you 20 free email discoveries on the PRO plan. Learn how limits work, what counts as a discovery, and how to get unlimited scans using your own AI API key.',
  alternates: {
    canonical: 'https://www.suprascribe.com/limits',
  },
}
import Link from 'next/link'

export default function LimitsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft /> Back to Dashboard
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Timer className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Discovery Limits</h1>
          </div>
          <p className="mt-2 text-muted-foreground text-lg">
            Understanding how email discovery limits work
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <HelpCircle className="h-6 w-6" />
                Why Do We Have Limits?
              </CardTitle>
              <p className="text-muted-foreground">
                Email discovery uses AI to analyze your emails and find subscriptions. To ensure
                fair usage and maintain service quality for all users, we have reasonable limits in
                place.
              </p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Total Discovery Limit
                </h3>
                <p className="text-muted-foreground">
                  You can run up to <strong>{MAX_TOTAL_DISCOVERIES} discoveries total</strong>. Each
                  time you scan an email account (Gmail, Outlook, or iCloud) counts as one
                  discovery.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>You get {MAX_TOTAL_DISCOVERIES} discoveries for your account lifetime</li>
                  <li>You can use any combination of email providers</li>
                  <li>
                    After reaching the limit, you&apos;ll need to use BYOK for unlimited discoveries
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Example Usage
                </h3>
                <div className="text-muted-foreground space-y-3">
                  <p>Here&apos;s how you might use your {MAX_TOTAL_DISCOVERIES} discoveries:</p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>
                      <strong>Discovery 1-5:</strong> Scan your personal Gmail, Outlook, iCloud, and
                      two work accounts (5 used)
                    </li>
                    <li>
                      <strong>Discovery 6-10:</strong> Re-scan accounts after a few months to catch
                      new subscriptions (10 used)
                    </li>
                    <li>
                      <strong>Discovery 11-30:</strong> Continue scanning other accounts or
                      re-scanning as needed (30 used)
                    </li>
                  </ul>
                  <p className="mt-4">
                    Once you&apos;ve used all {MAX_TOTAL_DISCOVERIES} discoveries, you&apos;ll need
                    to configure your own API key (BYOK) to continue using email discovery.
                  </p>
                </div>
              </section>
            </CardContent>
          </Card>

          <Card id="byok" className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Key className="h-6 w-6" />
                Unlimited Discovery with BYOK
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-4">
              <p className="text-muted-foreground">
                Users can bypass discovery limits entirely by providing their own API key from a
                variety of providers (OpenAI, Anthropic, Google and more). This is called
                &quot;Bring Your Own Key&quot; (BYOK).
              </p>

              <div className="grid gap-4 sm:grid-cols-2 mt-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <Infinity className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Unlimited Discoveries</h4>
                    <p className="text-sm text-muted-foreground">
                      No monthly limits when using your own API key
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-lg border">
                  <Shield className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h4 className="font-medium">Secure Storage</h4>
                    <p className="text-sm text-muted-foreground">
                      Keys are encrypted with AES-256-GCM
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Results, speed and costs vary based on the model and provider.
              </p>

              <ConfigureApiKeyButton size="default" className="mt-4" />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                The {MAX_TOTAL_DISCOVERIES} discovery limit is designed to be generous for typical
                use. Most users only need to discover once or twice per email account. If
                you&apos;ve found subscriptions you missed, you can always add them manually at any
                time. For unlimited discoveries, configure your own API key (BYOK). Still have
                questions?
              </p>

              <div className="flex flex-wrap gap-4 mt-6">
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
