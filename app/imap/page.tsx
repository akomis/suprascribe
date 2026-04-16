import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ImapGuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold mt-4 mb-2">IMAP Setup Guide</h1>
          <p className="text-muted-foreground">
            Learn how to generate app-specific passwords and configure IMAP access for your email
            provider.
          </p>
        </div>

        {/* What is IMAP Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What is IMAP?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              IMAP (Internet Message Access Protocol) is a standard way to access your email from
              different devices and applications. It allows us to read your emails to find
              subscription receipts.
            </p>
            <p>
              <strong>Important:</strong> For security, most email providers require you to create
              an &quot;app password&quot; instead of using your regular password. This is a special
              password that only works for specific apps and can be revoked anytime without changing
              your main password.
            </p>
          </CardContent>
        </Card>

        {/* Provider Guides with Tabs */}
        <Tabs defaultValue="other" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="icloud">iCloud</TabsTrigger>
            <TabsTrigger value="gmail">Gmail</TabsTrigger>
            <TabsTrigger value="outlook">Outlook</TabsTrigger>
            <TabsTrigger value="other">Other</TabsTrigger>
          </TabsList>

          {/* iCloud Tab */}
          <TabsContent value="icloud" className="mt-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">IMAP Settings:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      <strong>Server:</strong> imap.mail.me.com
                    </li>
                    <li>
                      <strong>Port:</strong> 993
                    </li>
                  </ul>

                  <p className="font-semibold mt-4">How to Generate App-Specific Password:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      Make sure you have{' '}
                      <Link
                        href="https://support.apple.com/en-us/HT204915"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-primary"
                      >
                        two-factor authentication enabled
                      </Link>{' '}
                      for your Apple ID (required)
                    </li>
                    <li>
                      Go to{' '}
                      <Link
                        href="https://appleid.apple.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-primary"
                      >
                        appleid.apple.com
                      </Link>
                    </li>
                    <li>Sign in with your Apple ID</li>
                    <li>
                      In the &quot;Sign-In and Security&quot; section, select &quot;App-Specific
                      Passwords&quot;
                    </li>
                    <li>Click the + button to create a new password</li>
                    <li>Enter a label (e.g., &quot;Suprascribe&quot;)</li>
                    <li>Click &quot;Create&quot;</li>
                    <li>Copy the password shown (format: xxxx-xxxx-xxxx-xxxx)</li>
                    <li>Use this password in the IMAP form (hyphens are optional)</li>
                  </ol>
                </div>

                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link
                    href="https://support.apple.com/en-us/102654"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official Apple Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Gmail Tab */}
          <TabsContent value="gmail" className="mt-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">IMAP Settings:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      <strong>Server:</strong> imap.gmail.com
                    </li>
                    <li>
                      <strong>Port:</strong> 993
                    </li>
                  </ul>

                  <p className="font-semibold mt-4">How to Generate App Password:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      Make sure you have{' '}
                      <Link
                        href="https://myaccount.google.com/signinoptions/two-step-verification"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-primary"
                      >
                        2-Step Verification enabled
                      </Link>{' '}
                      on your Google account (required)
                    </li>
                    <li>
                      Go to your{' '}
                      <Link
                        href="https://myaccount.google.com/apppasswords"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-primary"
                      >
                        Google App Passwords page
                      </Link>
                    </li>
                    <li>Sign in if prompted</li>
                    <li>Enter a name for the app (e.g., &quot;Suprascribe&quot;)</li>
                    <li>Click &quot;Create&quot;</li>
                    <li>Copy the 16-character password (it will look like: xxxx xxxx xxxx xxxx)</li>
                    <li>Use this password in the IMAP form (remove spaces)</li>
                  </ol>
                </div>

                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link
                    href="https://support.google.com/accounts/answer/185833"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official Google Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Outlook Tab */}
          <TabsContent value="outlook" className="mt-6">
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">IMAP Settings:</p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                    <li>
                      <strong>Server:</strong> outlook.office365.com
                    </li>
                    <li>
                      <strong>Port:</strong> 993
                    </li>
                  </ul>

                  <p className="font-semibold mt-4">How to Generate App Password:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      Go to your{' '}
                      <Link
                        href="https://account.microsoft.com/security"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-foreground underline hover:text-primary"
                      >
                        Microsoft Security page
                      </Link>
                    </li>
                    <li>Sign in if prompted</li>
                    <li>
                      Scroll to &quot;Advanced security options&quot; and click &quot;Add a new way
                      to sign in or verify&quot;
                    </li>
                    <li>Select &quot;Use an app password&quot;</li>
                    <li>Click &quot;Generate&quot;</li>
                    <li>Copy the generated password</li>
                    <li>Use this password in the IMAP form</li>
                  </ol>

                  <p className="text-xs text-muted-foreground mt-4">
                    <strong>Note:</strong> If you don&apos;t see the app password option, you may
                    need to enable it first or your organization might have restrictions.
                  </p>
                </div>

                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link
                    href="https://support.microsoft.com/en-us/account-billing/manage-app-passwords-for-two-step-verification-d6dc8c6d-4bf7-4851-ad95-6d07799387e9"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Official Microsoft Documentation
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Other Providers Tab */}
          <TabsContent value="other" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Other Email Providers</CardTitle>
                <CardDescription>
                  Using a different email provider? Here&apos;s what you need
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <p>Most email providers support IMAP. You&apos;ll need to find:</p>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>
                      Your provider&apos;s <strong>IMAP server address</strong> (usually starts with
                      &quot;imap.&quot;)
                    </li>
                    <li>
                      The <strong>IMAP port</strong> (typically 993 for secure connections)
                    </li>
                    <li>
                      How to generate an <strong>app password</strong> for your account
                    </li>
                  </ol>

                  <div className="mt-6">
                    <p className="font-semibold mb-3">Common IMAP Servers:</p>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left p-3 font-semibold">Provider</th>
                            <th className="text-left p-3 font-semibold">IMAP Server</th>
                            <th className="text-left p-3 font-semibold">Port</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          <tr className="hover:bg-muted/30">
                            <td className="p-3">
                              <Link
                                href="https://help.yahoo.com/kb/SLN4075.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-primary inline-flex items-center gap-1"
                              >
                                Yahoo Mail
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                            <td className="p-3 font-mono text-xs">imap.mail.yahoo.com</td>
                            <td className="p-3">993</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="p-3">
                              <Link
                                href="https://help.aol.com/articles/how-do-i-use-other-email-applications-to-send-and-receive-my-aol-mail"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-primary inline-flex items-center gap-1"
                              >
                                AOL Mail
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                            <td className="p-3 font-mono text-xs">imap.aol.com</td>
                            <td className="p-3">993</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="p-3">
                              <Link
                                href="https://www.zoho.com/mail/help/imap-access.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-primary inline-flex items-center gap-1"
                              >
                                Zoho Mail
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                            <td className="p-3 font-mono text-xs">imap.zoho.com</td>
                            <td className="p-3">993</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="p-3">
                              <Link
                                href="https://www.fastmail.help/hc/en-us/articles/1500000278382-Server-names-and-ports"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-primary inline-flex items-center gap-1"
                              >
                                FastMail
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                            <td className="p-3 font-mono text-xs">imap.fastmail.com</td>
                            <td className="p-3">993</td>
                          </tr>
                          <tr className="hover:bg-muted/30">
                            <td className="p-3">
                              <Link
                                href="https://support.gmx.com/pop-imap/toggle.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:text-primary inline-flex items-center gap-1"
                              >
                                GMX Mail
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </td>
                            <td className="p-3 font-mono text-xs">imap.gmx.com</td>
                            <td className="p-3">993</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      <strong>Note:</strong> ProtonMail requires{' '}
                      <Link
                        href="https://proton.me/support/protonmail-bridge-install"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-foreground"
                      >
                        ProtonMail Bridge
                      </Link>{' '}
                      for IMAP access.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Troubleshooting */}
        <Card className="mt-6 border-orange-500/20">
          <CardHeader>
            <CardTitle className="text-base">Troubleshooting Connection Issues</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>Having trouble connecting? Here are common solutions:</p>

            <div className="space-y-2">
              <p className="font-semibold">SSL/TLS Connection Errors:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                <li>Double-check your IMAP server address (no typos)</li>
                <li>Verify you&apos;re using port 993 (most common for IMAP with SSL)</li>
                <li>Make sure IMAP is enabled in your email provider&apos;s settings</li>
                <li>Try generating a new app password</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Authentication Errors:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                <li>
                  Confirm you&apos;re using an app-specific password, not your regular password
                </li>
                <li>
                  Check that two-factor authentication is enabled (required for app passwords)
                </li>
                <li>Verify your email address is correct</li>
                <li>Some providers require you to enable &quot;less secure app access&quot;</li>
              </ul>
            </div>

            <div className="space-y-2">
              <p className="font-semibold">Timeout Errors:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2 text-xs">
                <li>Check your internet connection</li>
                <li>Verify your firewall isn&apos;t blocking IMAP connections</li>
                <li>Try again in a few minutes (server might be temporarily busy)</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              <strong>Still having issues?</strong> Some email providers have specific requirements
              or restrictions. Check your provider&apos;s documentation for IMAP-specific setup
              instructions.
            </p>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="mt-6 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base">Security & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>
              We take your privacy seriously. When you use IMAP discovery, your credentials are:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
              <li>Used only once to connect to your email</li>
              <li>Never stored on our servers</li>
              <li>Transmitted securely over encrypted connections</li>
            </ul>
            <p className="mt-4">
              We only read email subject lines and sender information to identify subscription
              receipts. No email content is stored or saved.
            </p>
            <p className="mt-4 text-xs">
              You can revoke app passwords anytime from your email provider&apos;s security
              settings.
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Button asChild>
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
