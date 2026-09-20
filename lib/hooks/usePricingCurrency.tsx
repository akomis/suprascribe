'use client'

import {
  DEFAULT_CURRENCY,
  formatPrice,
  isPricingCurrency,
  PRICING_CURRENCY_COOKIE,
  PRICING_CURRENCY_COOKIE_MAX_AGE,
  type PricingCurrency,
} from '@/lib/config/pricing'
import { detectCurrency } from '@/lib/pricing/detect'
import * as React from 'react'

/**
 * The currency our own prices are shown and charged in.
 *
 * Distinct from `useCurrency`, which is the display currency for the subscriptions a
 * user tracks - that one converts through a static FX table across ten currencies.
 * This one never converts: each currency has its own hand-set price.
 */
type PricingCurrencyContextType = {
  currency: PricingCurrency
  setCurrency: (currency: PricingCurrency) => void
  /** Format an amount of cents in the active currency, e.g. 2500 -> "$25". */
  format: (cents: number) => string
}

const PricingCurrencyContext = React.createContext<PricingCurrencyContextType | undefined>(
  undefined,
)

function readCookie(name: string): string | undefined {
  return document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`))
    ?.split('=')[1]
}

/**
 * The cookie both carries the currency to the checkout routes, which have no
 * location signal of their own, and remembers what the visitor settled on.
 */
function writeCurrencyCookie(currency: PricingCurrency) {
  document.cookie = `${PRICING_CURRENCY_COOKIE}=${currency}; path=/; max-age=${PRICING_CURRENCY_COOKIE_MAX_AGE}; samesite=lax`
}

export function PricingCurrencyProvider({ children }: { children: React.ReactNode }) {
  // Starts on the currency the server rendered, so hydration matches the cached HTML,
  // then corrects itself on mount. Same pattern the discount countdown uses.
  const [currency, setCurrencyState] = React.useState<PricingCurrency>(DEFAULT_CURRENCY)

  React.useEffect(() => {
    // A cookie means the visitor has been here before, or picked a currency by hand -
    // either way it outranks a fresh guess at their timezone.
    const stored = readCookie(PRICING_CURRENCY_COOKIE)
    const resolved = isPricingCurrency(stored) ? stored : detectCurrency()

    setCurrencyState(resolved)
    // Written back even when it came from the cookie, to extend the year-long window.
    writeCurrencyCookie(resolved)
  }, [])

  const setCurrency = React.useCallback((next: PricingCurrency) => {
    setCurrencyState(next)
    writeCurrencyCookie(next)
  }, [])

  const value = React.useMemo(
    () => ({
      currency,
      setCurrency,
      format: (cents: number) => formatPrice(cents, currency),
    }),
    [currency, setCurrency],
  )

  return <PricingCurrencyContext.Provider value={value}>{children}</PricingCurrencyContext.Provider>
}

export function usePricingCurrency() {
  const context = React.useContext(PricingCurrencyContext)
  if (!context) {
    throw new Error('usePricingCurrency must be used within a PricingCurrencyProvider')
  }
  return context
}
