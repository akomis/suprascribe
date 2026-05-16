import { FAQSection } from '@/components/landing/FAQSection'
import { Button } from '@/components/ui/button'
import { faqItems } from '@/lib/config/faq'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Frequently Asked Questions | Suprascribe',
  description:
    'Answers to common questions about Suprascribe - how subscription tracking works, privacy, email scanning, pricing, and more.',
  alternates: {
    canonical: 'https://www.suprascribe.com/faq',
  },
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.suprascribe.com' },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'FAQ',
          item: 'https://www.suprascribe.com/faq',
        },
      ],
    },
  ],
}

export default function FAQPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, '<') }}
      />
      <div className="container mx-auto px-4 py-16 sm:py-24 max-w-2xl">
        <div className="space-y-10">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft /> Back to Home
              </Button>
            </Link>
          </div>
          <div className="space-y-3 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Can&apos;t find your answer?{' '}
              <Link
                href="/contact"
                className="underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Contact us
              </Link>
              .
            </p>
          </div>

          <FAQSection items={faqItems} />
        </div>
      </div>
    </>
  )
}
