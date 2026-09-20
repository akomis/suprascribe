import { PublicContactForm } from '@/components/contact/PublicContactForm'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { GITHUB_URL } from '@/lib/config/urls'
import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Contact Suprascribe - Support & Feedback',
  // The brand is already the first word, so the "| Suprascribe" suffix would only repeat it
  // and push the title past the SERP truncation point.
  absoluteTitle: 'Contact Suprascribe - Support & Feedback',
  description:
    'Reach the Suprascribe team about support, feedback, bugs, or a missing cancellation link. A person reads every message and usually replies in two days.',
  path: '/contact',
})

/**
 * Deliberately takes no `searchParams`. Reading them here would make the route dynamic, and
 * Next.js streams a dynamic page's metadata into the body rather than blocking on it - which
 * left this page's title, description and canonical outside `<head>` for crawlers that do not
 * run JS. The form reads `?subject=` and `?message=` itself on the client instead.
 */
export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-100 dark:bg-neutral-900/80">
      <div className="flex flex-1 gap-2 min-w-[350px] max-w-[700px] w-[90vw] sm:w-[600px] md:w-[900px] lg:w-[1000px] flex-col items-center justify-start mx-auto py-4 md:py-10 px-2 md:px-4 fade-on-mount">
        <div className="flex w-full items-center justify-between gap-2 md:gap-4">
          <SuprascribeLogo />
        </div>

        <div className="w-full max-w-[600px] mx-auto mt-8 space-y-10">
          <header className="space-y-3">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Contact Suprascribe</h1>
            <p className="text-muted-foreground">
              Questions about tracking your subscriptions, a bug to report, a cancellation link we
              are missing, or feedback on what should come next - this form reaches the people who
              build Suprascribe. There is no ticket queue and no chatbot in between.
            </p>
          </header>

          <PublicContactForm
            title="Send us a message"
            description="Have a question, feedback, or just want to say hello? We'd love to hear from you!"
          />

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">What happens after you send it</h2>
            <p className="text-muted-foreground">
              Messages go straight to the team&apos;s inbox. Most get a reply within two working
              days, and bug reports that come with the steps to reproduce them get looked at first.
              We only use the email address you give us to answer you - it is never added to a
              mailing list, and we never need your account password, card details, or inbox
              credentials to help with anything.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Faster answers elsewhere</h2>
            <p className="text-muted-foreground">
              Some questions already have a written answer, and reading it beats waiting on a reply:
            </p>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
              <li>
                <Link href="/faq" className="underline underline-offset-4 hover:text-foreground">
                  Frequently asked questions
                </Link>{' '}
                covers pricing, what a scan reads, and how to remove your data.
              </li>
              <li>
                <Link href="/safety" className="underline underline-offset-4 hover:text-foreground">
                  How email discovery keeps your inbox private
                </Link>{' '}
                explains exactly what Suprascribe reads and what it stores.
              </li>
              <li>
                <Link href="/imap" className="underline underline-offset-4 hover:text-foreground">
                  The IMAP setup guide
                </Link>{' '}
                walks through app-specific passwords for Gmail, Outlook, iCloud and the rest.
              </li>
              <li>
                <Link href="/limits" className="underline underline-offset-4 hover:text-foreground">
                  Auto Discovery allowances and BYOK
                </Link>{' '}
                answers &quot;how many scans do I get&quot;.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">Other ways to reach us</h2>
            <p className="text-muted-foreground">
              Suprascribe is open source. Bugs and feature requests are welcome as{' '}
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                issues on the GitHub repository
              </a>
              , where you can also read the code that touches your inbox. For anything shorter, the
              social accounts linked at the bottom of this page work too.
            </p>
          </section>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
