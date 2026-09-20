import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { type FAQItem } from '@/lib/config/faq'
import Link from 'next/link'

interface FAQSectionProps {
  items: FAQItem[]
  showViewAll?: boolean
  /**
   * Renders an `<h2>` above the accordion. Callers that already head their own section leave
   * this unset; pages where the accordion is the section need it, or the outline drops from
   * the page `<h1>` straight to the `<h3>` inside each accordion trigger.
   */
  heading?: string
}

export function FAQSection({ items, showViewAll = false, heading }: FAQSectionProps) {
  return (
    <div className="mx-auto max-w-2xl w-full space-y-6">
      {heading && <h2 className="text-2xl font-bold tracking-tight text-center">{heading}</h2>}
      <Accordion type="single" collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {showViewAll && (
        <p className="text-center text-sm text-muted-foreground">
          Still have questions?{' '}
          <Link
            href="/faq"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            View all FAQs
          </Link>{' '}
          or{' '}
          <Link
            href="/contact"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            contact us
          </Link>
          .
        </p>
      )}
    </div>
  )
}
