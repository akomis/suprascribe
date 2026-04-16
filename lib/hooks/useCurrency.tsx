'use client'

import * as React from 'react'

export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
  GBP: { symbol: '£', name: 'British Pound' },
  JPY: { symbol: '¥', name: 'Japanese Yen' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { symbol: '¥', name: 'Chinese Yuan' },
  INR: { symbol: '₹', name: 'Indian Rupee' },
  KRW: { symbol: '₩', name: 'South Korean Won' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  currencySymbol: string
  formatCurrency: (amount: number) => string
}

const CurrencyContext = React.createContext<CurrencyContextType | undefined>(undefined)

const STORAGE_KEY = 'suprascribe_currency'

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<CurrencyCode>('USD')
  const [isHydrated, setIsHydrated] = React.useState(false)

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as CurrencyCode | null
    if (stored && CURRENCIES[stored]) {
      setCurrencyState(stored)
    }
    setIsHydrated(true)
  }, [])

  const setCurrency = React.useCallback((newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency)
    localStorage.setItem(STORAGE_KEY, newCurrency)
  }, [])

  const formatCurrencyFn = React.useCallback(
    (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
      }).format(amount)
    },
    [currency],
  )

  const value = React.useMemo(
    () => ({
      currency,
      setCurrency,
      currencySymbol: CURRENCIES[currency].symbol,
      formatCurrency: formatCurrencyFn,
    }),
    [currency, setCurrency, formatCurrencyFn],
  )

  if (!isHydrated) {
    return null
  }

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const context = React.useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }
  return context
}
