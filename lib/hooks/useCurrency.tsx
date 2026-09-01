'use client'

import * as React from 'react'
import { STORAGE_KEYS } from '@/lib/config/storage-keys'
import {
  CURRENCIES,
  type CurrencyCode,
  type DisplayCurrencyCode,
  formatCurrencyAmount,
  isDisplayCurrency,
} from '@/lib/utils/currency'

export type { CurrencyCode, DisplayCurrencyCode }
export { CURRENCIES }

// The display target is always one of the picker currencies - it needs an
// exchange rate, which only those have. A subscription may still be STORED in
// any ISO-4217 currency.
type CurrencyContextType = {
  currency: DisplayCurrencyCode
  setCurrency: (currency: DisplayCurrencyCode) => void
  currencySymbol: string
  formatCurrency: (amount: number) => string
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<DisplayCurrencyCode>('USD')
  React.useEffect(() => {
    // Use setTimeout to avoid synchronous setState during effect
    const timer = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.currency)
      if (stored && isDisplayCurrency(stored)) {
        setCurrencyState(stored)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const setCurrency = React.useCallback((newCurrency: DisplayCurrencyCode) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(STORAGE_KEYS.currency, newCurrency)
  }, [])

  const value = React.useMemo(
    () => ({
      currency,
      setCurrency,
      currencySymbol: CURRENCIES[currency].symbol,
      formatCurrency: (amount: number) => formatCurrencyAmount(amount, currency),
    }),
    [currency, setCurrency],
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
