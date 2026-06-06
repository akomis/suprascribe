'use client'

import * as React from 'react'
import { STORAGE_KEYS } from '@/lib/config/storage-keys'
import { CURRENCIES, CurrencyCode, formatCurrencyAmount } from '@/lib/utils/currency'

export type { CurrencyCode }
export { CURRENCIES }

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  currencySymbol: string
  formatCurrency: (amount: number) => string
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<CurrencyCode>('USD')
  React.useEffect(() => {
    // Use setTimeout to avoid synchronous setState during effect
    const timer = setTimeout(() => {
      const stored = localStorage.getItem(STORAGE_KEYS.currency) as CurrencyCode | null
      if (stored && CURRENCIES[stored]) {
        setCurrencyState(stored)
      }
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const setCurrency = React.useCallback((newCurrency: CurrencyCode) => {
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
