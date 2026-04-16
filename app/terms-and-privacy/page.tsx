import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service & Privacy Policy',
  description:
    'Read the Suprascribe Terms of Service and Privacy Policy. We do not sell your data, do not store email content, and give you full control over your data at all times.',
  alternates: {
    canonical: 'https://www.suprascribe.com/terms-and-privacy',
  },
}

export default function TermsAndPrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-12 px-8">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft /> Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Terms of Service & Privacy Policy</h1>
          <p className="mt-2 text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Terms of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h3 className="text-lg font-semibold">1. Acceptance of Terms</h3>
                <p className="text-muted-foreground">
                  By accessing and using Suprascribe, you accept and agree to be bound by the terms
                  and provision of this agreement. If you do not agree to these terms, please do not
                  use our service.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">2. Description of Service</h3>
                <p className="text-muted-foreground">
                  Suprascribe is a platform designed to help you discover and manage your
                  subscriptions across various services. We provide both free (Basic) and paid (Pro)
                  features to help you track recurring billing services.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">3. User Accounts</h3>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account and
                  password. You agree to accept responsibility for all activities that occur under
                  your account. You must notify us immediately of any unauthorized use of your
                  account.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">4. Pricing and Payment</h3>
                <p className="text-muted-foreground">
                  The Basic plan is free forever. The Pro plan is available as a one-time purchase
                  of €10. All payments are processed securely through our payment processor. The
                  one-time payment grants you lifetime access to Pro features.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">5. User Data and Content</h3>
                <p className="text-muted-foreground">
                  You retain all rights to the data you enter into Suprascribe. We do not claim
                  ownership of your subscription information or any data you provide. You grant us
                  the right to store and process this data solely for the purpose of providing our
                  service to you.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">6. Service Availability</h3>
                <p className="text-muted-foreground">
                  While we strive to provide continuous service, we do not guarantee that the
                  service will be uninterrupted or error-free. We reserve the right to modify,
                  suspend, or discontinue any part of the service with or without notice.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">7. Limitation of Liability</h3>
                <p className="text-muted-foreground">
                  Suprascribe is provided &quot;as is&quot; without any warranties. We are not
                  liable for any damages arising from the use or inability to use our service. We do
                  not guarantee the accuracy of subscription detection or cost calculations.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">8. Modifications to Terms</h3>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. We will notify users of
                  any material changes via email or through the service. Your continued use of
                  Suprascribe after such modifications constitutes acceptance of the updated terms.
                </p>
              </section>
            </CardContent>
          </Card>

          <Separator />

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none space-y-6">
              <section>
                <h3 className="text-lg font-semibold">1. Information We Collect</h3>
                <p className="text-muted-foreground">
                  We collect information you provide directly to us, including:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Account information (email address, password)</li>
                  <li>
                    Subscription data you manually enter or we discover through email analysis
                  </li>
                  <li>Payment information (processed securely by our payment provider)</li>
                  <li>Usage data and preferences</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold">2. How We Use Your Information</h3>
                <p className="text-muted-foreground">We use the information we collect to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Provide, maintain, and improve our service</li>
                  <li>Process transactions and send related information</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Analyze usage patterns to improve user experience</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold">3. Email Access and Analysis</h3>
                <p className="text-muted-foreground">
                  If you choose to use our email discovery feature, we will access your email to
                  detect subscription-related messages. This analysis is performed securely, and we
                  only extract subscription-related information. We do not read, store, or process
                  any other email content. You can revoke email access at any time.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">4. Data Sharing and Disclosure</h3>
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. We may
                  share your information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>With your explicit consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and prevent fraud</li>
                  <li>
                    With service providers who assist in operating our platform (under strict
                    confidentiality agreements)
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold">5. Data Security</h3>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your
                  personal data against unauthorized access, alteration, disclosure, or destruction.
                  However, no method of transmission over the internet is 100% secure, and we cannot
                  guarantee absolute security.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">6. Data Retention</h3>
                <p className="text-muted-foreground">
                  We retain your personal information for as long as your account is active or as
                  needed to provide you services. You can request deletion of your account and
                  associated data at any time through your account settings.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">7. Your Rights</h3>
                <p className="text-muted-foreground">You have the right to:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Export your data</li>
                  <li>Opt-out of certain data collection practices</li>
                </ul>
              </section>

              <section>
                <h3 className="text-lg font-semibold">8. Cookies and Tracking</h3>
                <p className="text-muted-foreground">
                  We use cookies and similar tracking technologies to track activity on our service
                  and hold certain information. You can instruct your browser to refuse all cookies
                  or to indicate when a cookie is being sent.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">9. Children&apos;s Privacy</h3>
                <p className="text-muted-foreground">
                  Our service is not intended for users under the age of 13. We do not knowingly
                  collect personal information from children under 13. If you become aware that a
                  child has provided us with personal data, please contact us.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">10. International Data Transfers</h3>
                <p className="text-muted-foreground">
                  Your information may be transferred to and maintained on servers located outside
                  of your jurisdiction where data protection laws may differ. By using our service,
                  you consent to this transfer.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">11. Changes to Privacy Policy</h3>
                <p className="text-muted-foreground">
                  We may update our Privacy Policy from time to time. We will notify you of any
                  changes by posting the new Privacy Policy on this page and updating the &quot;last
                  updated&quot; date.
                </p>
              </section>

              <section>
                <h3 className="text-lg font-semibold">12. Contact Us</h3>
                <p className="text-muted-foreground">
                  If you have any questions about these Terms or Privacy Policy, please contact us
                  at:
                </p>
                <p className="text-muted-foreground ml-4">
                  Email:{' '}
                  <a href="mailto:privacy@suprascribe.com" className="text-primary hover:underline">
                    privacy@suprascribe.com
                  </a>
                </p>
              </section>
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
