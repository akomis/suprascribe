import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { author } from '@/lib/config/author'
import { GITHUB_URL } from '@/lib/config/urls'
import { breadcrumbSchema } from '@/lib/utils/schema'
import { SITE_URL } from '@/lib/utils/metadata'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'About the Author - Who Writes Suprascribe',
  description:
    'Who writes the Suprascribe blog, the freedom, privacy, and transparency motivations behind the articles, and why the product scans email instead of linking a bank account.',
  path: '/about-author',
})

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/about-author#person`,
      name: author.name,
      url: author.url,
      jobTitle: author.role,
      description: author.bio,
      worksFor: {
        '@type': 'Organization',
        name: 'Suprascribe',
        url: SITE_URL,
      },
    },
    {
      '@type': 'AboutPage',
      url: `${SITE_URL}/about-author`,
      mainEntity: { '@id': `${SITE_URL}/about-author#person` },
    },
    breadcrumbSchema('About the Author', `${SITE_URL}/about-author`),
  ],
}

const LINK_CLASS = 'text-primary underline underline-offset-4 hover:no-underline'

export default function AboutPage() {
  return (
    <SEOPage
      jsonLd={jsonLd}
      title="About the Author"
      description="Who writes the Suprascribe blog, why the articles keep coming back to freedom, privacy, and transparency, and how the claims made here can be checked."
      primaryCta={{ href: '/login?tab=signup', label: 'Start for Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      relatedHeading="Read More"
      relatedPages={[
        { href: '/blog', label: 'Blog' },
        { href: '/safety', label: 'Privacy & Safety' },
        { href: '/contact', label: 'Contact' },
      ]}
    >
      <SEOSection title="The man behind the articles">
        <div className="space-y-5 text-muted-foreground">
          <p>
            Our blog articles are written by <strong>{author.name}</strong>, {author.role}.
          </p>
          <p>
            Everything published on the blog is written from working on the product itself - reading
            how real billing emails are structured, how providers word renewal notices, and where
            automatic detection succeeds or fails. Where a guide describes a limitation of
            Suprascribe, that limitation is real and stated rather than omitted. Cancellation steps
            are walked through on the actual provider before they are published, and corrected when
            a company quietly moves the button. Nothing here is written to fill a keyword slot -
            each piece answers a question that came up while building or using the thing.
          </p>
          <p>
            The articles keep returning to the same three things, because they are the reasons this
            product exists at all. Every one of them comes down to information being power: the
            subscription economy runs on you not knowing what you pay, not knowing what is
            collected, and not knowing where the exit is - so writing it down plainly moves that
            power back to the person paying.
          </p>
          <p>
            <strong>Freedom</strong> - a subscription is easy to start and deliberately hard to
            leave. Cancellation is buried behind support chats, retention offers, and settings pages
            that move. The how-to-cancel guides exist to hand that back: know what you pay for, know
            exactly where the cancel button is, and leave when you decide to rather than when the
            friction finally wears off.
          </p>
          <p>
            <strong>Privacy</strong> - the standard way to find your subscriptions is to hand a
            company read access to your entire bank history. That trade is presented as the only
            option, and it is not. Writing about email-based detection, data minimisation, and what
            these apps actually collect is a way of showing that the convenient answer and the
            invasive one are not the same answer.
          </p>
          <p>
            <strong>Transparency</strong> - privacy claims are marketing copy until someone can
            check them. That applies to the tools reviewed here and to Suprascribe itself, which is
            why the comparisons name what competitors do well, why the pricing is stated in full,
            and why the code is open.
          </p>
          <p>
            The source code is public on{' '}
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
              our Github repository
            </a>
            , so any claim made here about how email scanning works can be checked against the code
            that does it.
          </p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
