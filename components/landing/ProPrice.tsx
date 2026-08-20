'use client'

import { getDiscountStatus, type DiscountStatus } from '@/lib/config/discount'
import { PRO_FULL_PRICE_DISPLAY, PRO_DISCOUNT_PRICE_DISPLAY } from '@/lib/config/stripe'
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
 * from before the deadline still corrects itself for the visitor.
 */
export function ProPrice({ discount, className, strikeClassName }: ProPriceProps) {
  const [status, setStatus] = useState(discount)

  useEffect(() => {
    const update = () => setStatus(getDiscountStatus())
    update()
    const interval = setInterval(update, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <span className={className}>
      {status.active ? PRO_DISCOUNT_PRICE_DISPLAY : PRO_FULL_PRICE_DISPLAY}
      {status.active && (
        <>
          {' '}
          <span className={cn('line-through', strikeClassName)}>{PRO_FULL_PRICE_DISPLAY}</span>
        </>
      )}
    </span>
  )
}
