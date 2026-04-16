import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { capitalize } from '@/lib/utils'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy & Safety - How Email Discovery Works',
  description:
    'Learn exactly how Suprascribe accesses your email to find subscriptions. We use read-only OAuth 2.0, never store email content, and ignore everything unrelated to recurring billing.',
  alternates: {
    canonical: 'https://www.suprascribe.com/safety',
  },
}
import { ArrowLeft, Database, Eye, Lock, Mail, Shield } from 'lucide-react'
import Link from 'next/link'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-4 md:px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft /> Back to Home
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Your Safety & Privacy</h1>
          </div>
          <p className="mt-2 text-muted-foreground text-lg">
            Understanding how we keep your data safe and private
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lock className="h-6 w-6" />
                How Subscription Discovery Works
              </CardTitle>
              <p className="text-muted-foreground">
                Suprascribe&apos;s automatic subscription discovery feature is designed with your
                privacy as the top priority. We understand that your inbox contains sensitive and
                personal information, which is why we&apos;ve implemented a secure, privacy-first
                approach to subscription detection.
              </p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Secure Email Access
                </h3>
                <p className="text-muted-foreground">
                  When you choose to connect your email provider, we use industry-standard OAuth 2.0
                  authentication. This means:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>We never see or store your email password</li>
                  <li>
                    You grant us read-only access through your email provider&apos;s secure system
                  </li>
                  <li>
                    You can revoke our access at any time directly from your email provider settings
                  </li>
                  <li>All connections are encrypted end-to-end using TLS/SSL protocols</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  What We Look At
                </h3>
                <p className="text-muted-foreground">
                  Our system is specifically designed to identify and analyze only
                  subscription-related emails. We scan for:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Receipt emails from known subscription services</li>
                  <li>Recurring payment confirmations and invoices</li>
                  <li>Subscription renewal notifications</li>
                  <li>Billing statements from services</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>We completely ignore:</strong> Personal correspondence, work emails,
                  shopping orders that aren&apos;t subscriptions, newsletters, and any other
                  non-subscription-related content. Our algorithms are trained to recognize
                  subscription patterns and skip everything else.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  What We Store
                </h3>
                <p className="text-muted-foreground">
                  We extract and store only the essential information needed to help you manage your
                  subscriptions:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                  <li>Service name (e.g., &quot;Netflix&quot;, &quot;Spotify&quot;)</li>
                  <li>Billing amount</li>
                  <li>Billing frequency (monthly, yearly, etc.)</li>
                  <li>Next payment date</li>
                  <li>Currency</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  <strong>We do NOT store:</strong> email content, email subjects, sender details
                  beyond the service name, attachments, or any other email metadata. Once we&apos;ve
                  extracted the subscription information, we discard the email data immediately.
                </p>
              </section>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Our Security Commitments
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">No Email Storage</h4>
                    <p className="text-muted-foreground text-sm">
                      We never store your actual emails. We only extract subscription data and
                      immediately discard the email content.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Encrypted Communication</h4>
                    <p className="text-muted-foreground text-sm">
                      All data transmission between your device, our servers, and your email
                      provider is encrypted using industry-standard protocols.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Your Data, Your Control</h4>
                    <p className="text-muted-foreground text-sm">
                      You own your data. You can export it, delete it, or revoke our access at any
                      time-no questions asked.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">No Third-Party Sharing</h4>
                    <p className="text-muted-foreground text-sm">
                      We never sell, share, or provide your subscription data to third parties for
                      marketing, advertising, or any other purposes.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Transparent Processing</h4>
                    <p className="text-muted-foreground text-sm">
                      Our subscription detection runs entirely on secure servers. We process data in
                      real-time and don&apos;t retain any information except the time of the run and
                      results for applying limits. Email analysis is powered by{' '}
                      {capitalize(EMAIL_DISCOVERY_CONFIG.analysisModel.provider)}&apos;s AI:{' '}
                      <Badge variant="secondary" className="font-mono text-xs">
                        {EMAIL_DISCOVERY_CONFIG.analysisModel.modelName}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Open Source</h4>
                    <p className="text-muted-foreground text-sm">
                      Suprascribe is fully open source. You can inspect the code, verify our privacy
                      claims, and contribute at{' '}
                      <Link
                        href="https://github.com/akomis/suprascribe"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-4 hover:text-foreground transition-colors"
                      >
                        github.com/akomis/suprascribe
                      </Link>
                      .
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground">Manual Alternative</h4>
                    <p className="text-muted-foreground text-sm">
                      Not comfortable with email access? You can always add subscriptions manually
                      without connecting your email at all.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-xl">Your Privacy Matters</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We built Suprascribe because we wanted a better way to manage our own
                subscriptions-and we wouldn&apos;t want anyone reading our personal emails either.
                That&apos;s why privacy isn&apos;t just a feature for us; it&apos;s{' '}
                <strong>a fundamental principle.</strong>
              </p>
              <p className="text-muted-foreground mt-4">
                If you have any questions about how we handle your data, our security practices, or
                anything else related to your privacy, please don&apos;t hesitate to reach out.
                We&apos;re always happy to provide more details.
              </p>
              <div className="flex flex-wrap gap-4 mt-6">
                <Button variant="outline" asChild>
                  <Link href="/terms-and-privacy">Read Our Full Privacy Policy</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-8">
            <Link href="/">
              <Button variant="outline" size="lg">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
