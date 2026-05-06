import { FAQSection } from '@/components/landing/FAQSection'
import { Button } from '@/components/ui/button'
import { faqItems } from '@/lib/config/faq'
import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ - Suprascribe',
  description:
    'Frequently asked questions about Suprascribe - subscription tracking, privacy, pricing, and more.',
  alternates: {
    canonical: 'https://www.suprascribe.com/faq',
  },
}

export default function FAQPage() {
  return (
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
  )
}
