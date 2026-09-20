import {
  DEFAULT_CURRENCY,
  isPricingCurrency,
  PRICING_CURRENCY_COOKIE,
  type PricingCurrency,
} from '@/lib/config/pricing'
import type { NextRequest } from 'next/server'

/**
 * The currency to charge this request in, as resolved by the visitor's browser and
 * handed over in the pricing cookie (see ../hooks/usePricingCurrency).
 *
 * Anything missing, malformed or unsupported falls back to DEFAULT_CURRENCY, which
 * is also what a visitor with JavaScript disabled was shown on the page.
 */
export function currencyFromRequest(request: NextRequest): PricingCurrency {
  const value = request.cookies.get(PRICING_CURRENCY_COOKIE)?.value
  return isPricingCurrency(value) ? value : DEFAULT_CURRENCY
}
