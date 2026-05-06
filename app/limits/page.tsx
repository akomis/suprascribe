import { ConfigureApiKeyButton } from '@/components/ConfigureApiKeyButton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MAX_TOTAL_DISCOVERIES } from '@/lib/utils/discovery-rate-limit'
import { ArrowLeft, HelpCircle, Infinity, Key, Shield, Timer, Zap } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Auto Discovery - How It Works & BYOK',
  description:
    'Learn how Auto Discovery finds your subscriptions from Gmail, Outlook and iCloud. Pro includes a discovery allowance, and BYOK lets you use your own AI API key for unlimited scans.',
  alternates: {
    canonical: 'https://www.suprascribe.com/limits',
  },
}

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
            <h1 className="text-4xl font-bold tracking-tight">Auto Discovery</h1>
          </div>
          <p className="mt-2 text-muted-foreground text-lg">
            How email discovery works - and how BYOK gives you unlimited scans
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
                  Pro users can run up to <strong>{MAX_TOTAL_DISCOVERIES} discoveries total</strong>{' '}
                  using our AI infrastructure. Each time you scan an email account (Gmail, Outlook,
                  or iCloud) counts as one discovery.
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Pro includes {MAX_TOTAL_DISCOVERIES} discoveries using our infrastructure</li>
                  <li>You can use any combination of email providers</li>
                  <li>After reaching the limit, configure BYOK for unlimited discoveries</li>
                </ul>
              </section>
            </CardContent>
          </Card>

          <Card id="byok" className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Key className="h-6 w-6" />
                Unlimited Discoveries with BYOK
              </CardTitle>
              <p className="text-muted-foreground">
                Auto Discovery includes a generous allowance of discoveries. Once exhausted, you can
                extend it by bringing your own AI API key - this is called BYOK (Bring Your Own
                Key).
              </p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-4">
              <p className="text-muted-foreground">
                Configure an API key from any supported provider (OpenAI, Anthropic, Google and
                more) and Auto Discovery will use it instead of our infrastructure - no limits, no
                extra cost beyond what you pay your AI provider.
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

              <ConfigureApiKeyButton />
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <p className="text-muted-foreground">
                The {MAX_TOTAL_DISCOVERIES} discovery limit is designed to be generous for typical
                use. Most users only need to discover once or twice per email account. If
                you&apos;ve found subscriptions you missed, you can always add them manually at any
                time. Pro users can configure BYOK for unlimited discoveries beyond the included
                allowance. Still have questions?
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
