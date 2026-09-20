'use client'

import { getDiscountStatus, type DiscountStatus } from '@/lib/config/discount'
import { PRICING } from '@/lib/config/pricing'
import { usePricingCurrency } from '@/lib/hooks/usePricingCurrency'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

interface ProPriceProps {
  /** Discount state resolved on the server, so hydration matches cached HTML. */
  discount: DiscountStatus
  className?: string
  strikeClassName?: string
}

/**
 * PRO price with the struck-through full price next to it while the discount
 * runs, and the full price alone once it ends. Client-side so a page cached
 * from before the deadline still corrects itself for the visitor - and so it
 * lands in the visitor's own currency, which the cached HTML cannot know.
 */
export function ProPrice({ discount, className, strikeClassName }: ProPriceProps) {
  const [status, setStatus] = useState(discount)
  const { currency, format } = usePricingCurrency()

  useEffect(() => {
    const update = () => setStatus(getDiscountStatus())
    update()
    const interval = setInterval(update, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const fullPrice = format(PRICING[currency].proFullCents)
  const discountPrice = format(PRICING[currency].proDiscountCents)

  return (
    <span className={className}>
      {status.active ? discountPrice : fullPrice}
      {status.active && (
        <>
          {' '}
          <span className={cn('line-through', strikeClassName)}>{fullPrice}</span>
        </>
      )}
    </span>
  )
}
