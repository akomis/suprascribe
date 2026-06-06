import { FAQSection } from '@/components/landing/FAQSection'
import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { SiteFooter } from '@/components/shared/SiteFooter'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { FAQItem } from '@/lib/config/faq'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

interface CTAButton {
  href: string
  label: string
  variant?: 'default' | 'outline' | 'secondary'
}

interface RelatedPage {
  href: string
  label: string
}

interface SEOPageProps {
  jsonLd: object
  title: string
  description: string
  primaryCta: CTAButton
  secondaryCta?: CTAButton
  faqItems?: FAQItem[]
  relatedPages?: RelatedPage[]
  relatedHeading?: string
  relatedDescription?: string
  children?: ReactNode
}

export function PageShell({ jsonLd, children }: { jsonLd: object; children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '<') }}
      />
      <div className="flex flex-col px-4 md:px-8">
        <div className="container mx-auto px-4 pt-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft /> Back to Home
            </Button>
          </Link>
        </div>
        {children}
      </div>
    </>
  )
}

export function SEOPage({
  jsonLd,
  title,
  description,
  primaryCta,
  secondaryCta,
  faqItems,
  relatedPages,
  relatedHeading = 'Also worth exploring',
  relatedDescription,
  children,
}: SEOPageProps) {
  return (
    <PageShell jsonLd={jsonLd}>
      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl text-center">
        <div className="space-y-6">
          <SuprascribeLogo size={36} layout="column" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">{title}</h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            {description}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href={primaryCta.href}>
              <Button size="lg" variant={primaryCta.variant ?? 'default'}>
                {primaryCta.label}
              </Button>
            </Link>
            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button size="lg" variant={secondaryCta.variant ?? 'outline'}>
                  {secondaryCta.label}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {children && (
        <>
          <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />
          {children}
        </>
      )}

      {faqItems && faqItems.length > 0 && (
        <>
          <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />
          <section className="container mx-auto px-4 py-12 sm:py-20 max-w-2xl">
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Common Questions</h2>
              </div>
              <FAQSection items={faqItems} showViewAll />
            </div>
          </section>
        </>
      )}

      {relatedPages && relatedPages.length > 0 && (
        <>
          <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />
          <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl text-center">
            <div className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{relatedHeading}</h2>
              {relatedDescription && <p className="text-muted-foreground">{relatedDescription}</p>}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {relatedPages.map((page) => (
                  <Link key={page.href} href={page.href}>
                    <Button variant="outline">{page.label}</Button>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </>
      )}

      <Separator />

      <SiteFooter />
    </PageShell>
  )
}
