import { SEOPage } from '@/components/shared/SEOPage'
import { SEOSection } from '@/components/shared/SEOSection'
import { audiencePages, type AudienceId, type RichText } from '@/lib/config/audiencePages'
import { buildProOfferJsonLd } from '@/lib/config/pricing'
import { faqItems } from '@/lib/config/faq'
import { breadcrumbSchema, faqPageSchema, softwareApplicationSchema } from '@/lib/utils/schema'
import { buildMetadata } from '@/lib/utils/metadata'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'

/**
 * The shared shape behind the five "subscription tracking for X" pages. The words live in
 * lib/config/audiencePages; everything structural is here, once.
 */

/**
 * Renders a run of prose, bolding `lead` at the front and each `emphasis` phrase at its first
 * occurrence. Same approach as the blog's inline links: match a substring rather than mark up the
 * text, so the copy stays readable as plain strings in the config.
 */
function Rich({ value }: { value: RichText }) {
  const emphasised = renderEmphasis(value.text, value.emphasis ?? [])
  return (
    <>
      {value.lead && <strong className="text-foreground">{value.lead}</strong>}
      {value.lead && ' '}
      {emphasised}
    </>
  )
}

function renderEmphasis(text: string, phrases: string[]): ReactNode[] {
  let segments: ReactNode[] = [text]

  for (const phrase of phrases) {
    const next: ReactNode[] = []
    let done = false

    for (const segment of segments) {
      if (done || typeof segment !== 'string') {
        next.push(segment)
        continue
      }
      const at = segment.indexOf(phrase)
      if (at === -1) {
        next.push(segment)
        continue
      }
      // First occurrence only - a phrase that repeats should not bold every instance.
      if (at > 0) next.push(segment.slice(0, at))
      next.push(
        <strong key={`${phrase}-${at}`} className="text-foreground">
          {phrase}
        </strong>,
      )
      const rest = segment.slice(at + phrase.length)
      if (rest) next.push(rest)
      done = true
    }

    segments = next
  }

  return segments
}

export function audienceMetadata(id: AudienceId): Metadata {
  const page = audiencePages[id]
  return buildMetadata({
    title: page.metaTitle,
    description: page.metaDescription,
    path: page.path,
  })
}

export function AudiencePage({ id }: { id: AudienceId }) {
  const page = audiencePages[id]
  const pageFaqItems = faqItems.filter((item) => page.faqQuestions.includes(item.question))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      softwareApplicationSchema({
        audienceType: page.audienceType,
        description: page.schemaDescription,
        proOffer: buildProOfferJsonLd(),
      }),
      faqPageSchema(pageFaqItems),
      breadcrumbSchema(page.breadcrumbName, `https://www.suprascribe.com${page.path}`),
    ],
  }

  return (
    <SEOPage
      jsonLd={jsonLd}
      path={page.path}
      title={page.h1}
      description={page.intro}
      primaryCta={{ href: '/login?tab=signup', label: 'Try Suprascribe Free' }}
      secondaryCta={{ href: '/demo', label: 'See the Demo' }}
      faqItems={pageFaqItems}
      relatedHeading={page.relatedHeading}
      relatedDescription={page.relatedDescription}
    >
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-6xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{page.toolsHeading}</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">{page.toolsIntro}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {page.tools.map((tool) => (
              <div key={tool.name} className="border rounded-lg p-5 space-y-2">
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-muted-foreground">{tool.why}</p>
              </div>
            ))}
          </div>

          <div className="border rounded-lg p-5 space-y-2 text-center max-w-3xl mx-auto">
            <p className="text-sm text-muted-foreground">
              <Rich value={page.toolsTotal} />
            </p>
          </div>
        </div>
      </section>

      <SEOSection title={page.whyTitle}>
        <div className="space-y-5 text-muted-foreground">
          {page.whyParagraphs.map((paragraph) => (
            <p key={paragraph.text}>
              <Rich value={paragraph} />
            </p>
          ))}
        </div>
      </SEOSection>

      <SEOSection title={page.helpsTitle}>
        <div className="space-y-5 text-muted-foreground">
          {page.helpsParagraphs.map((paragraph) => (
            <p key={paragraph.text}>
              <Rich value={paragraph} />
            </p>
          ))}
        </div>

        <div className="border rounded-lg p-5 space-y-3">
          <h3 className="font-semibold">{page.cardTitle}</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5">
            {page.cardBullets.map((bullet) => (
              <li key={bullet.text}>
                • <Rich value={bullet} />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground pt-1">{page.cardFootnote}</p>
        </div>
      </SEOSection>
    </SEOPage>
  )
}
