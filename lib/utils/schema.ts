interface FaqItem {
  question: string
  answer: string
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}

export function breadcrumbSchema(name: string, url: string) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suprascribe.com' },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  }
}

export const SOFTWARE_APP_ID = 'https://www.suprascribe.com/#software'
export const ORGANIZATION_ID = 'https://www.suprascribe.com/#organization'

interface SoftwareApplicationInput {
  /** Page-specific angle on the same product. */
  description: string
  /** Adds an Audience node, for the pages aimed at one group. */
  audienceType?: string
  /** The provider pages describe the free tier only; the rest also carry the PRO offer. */
  proOffer?: object
}

/**
 * The Suprascribe app node for a marketing page.
 *
 * Every page in app/(seo) used to declare this inline, which meant fourteen anonymous nodes all
 * naming the same product at the same URL with no `@id` - so each one read as a separate entity
 * rather than as another statement about the one entity. Sharing `@id` lets a consumer merge them,
 * the way the blog already `@id`-references the Organization declared in the root layout.
 */
export function softwareApplicationSchema({
  description,
  audienceType,
  proOffer,
}: SoftwareApplicationInput) {
  return {
    '@type': 'SoftwareApplication',
    '@id': SOFTWARE_APP_ID,
    name: 'Suprascribe',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    url: 'https://www.suprascribe.com',
    publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID },
    ...(audienceType ? { audience: { '@type': 'Audience', audienceType } } : {}),
    description,
    offers: [
      {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'EUR',
        name: 'Basic',
        description: 'Free forever - unlimited subscription tracking',
      },
      ...(proOffer
        ? [
            {
              ...proOffer,
              name: 'PRO',
              description: 'One-time purchase - auto-discovery, reminders, calendar',
            },
          ]
        : []),
    ],
  }
}
