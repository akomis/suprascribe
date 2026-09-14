'use client'

import { getOnceScanPriceCents } from '@/lib/config/pricing'
import { usePricingCurrency } from '@/lib/hooks/usePricingCurrency'

/**
 * The one-time scan price, in the visitor's currency. A client component so it can
 * be dropped into the copy of prerendered server-rendered pages, which are cached
 * and shared across visitors and so cannot resolve a currency themselves.
 */
export function OnceScanPrice() {
  const { currency, format } = usePricingCurrency()
  return <>{format(getOnceScanPriceCents(currency))}</>
}
