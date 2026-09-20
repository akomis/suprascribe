'use client'

import { PRICING, SUPPORTED_CURRENCIES } from '@/lib/config/pricing'
import { usePricingCurrency } from '@/lib/hooks/usePricingCurrency'
import { cn } from '@/lib/utils'
import { Fragment } from 'react'

/**
 * Lets the visitor correct the currency we guessed from their timezone. A VPN, a
 * trip or an expat address all put someone on the wrong side of that guess, and
 * this is the only way back - the server has no location signal of its own.
 *
 * The choice is written to the pricing cookie, so it follows through to checkout.
 */
export function CurrencyToggle({ className }: { className?: string }) {
  const { currency, setCurrency } = usePricingCurrency()

  return (
    <div
      role="group"
      aria-label="Currency"
      className={cn('inline-flex rounded-md border p-0.5', className)}
    >
      {SUPPORTED_CURRENCIES.map((code, index) => (
        <Fragment key={code}>
          {index > 0 && <span aria-hidden className="my-1 mx-0.5 w-px shrink-0 bg-border" />}
          <button
            type="button"
            onClick={() => setCurrency(code)}
            aria-pressed={currency === code}
            className={cn(
              'rounded-sm px-2.5 py-1 text-sm font-medium transition-colors',
              currency === code
                ? 'bg-secondary text-secondary-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {PRICING[code].symbol} {code.toUpperCase()}
          </button>
        </Fragment>
      ))}
    </div>
  )
}
