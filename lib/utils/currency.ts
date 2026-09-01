import type { Database } from '@/lib/database.types'

export type CurrencyCode = Database['public']['Enums']['CURRENCY_CODE']

/**
 * The currencies offered in the picker and usable as a display target.
 *
 * Deliberately narrower than CurrencyCode: a subscription may be STORED in any
 * ISO-4217 currency, because that is what its receipt said, but converting a
 * total into a target currency needs a rate, and rates only exist here for
 * these. Never index this map with a stored currency - use getCurrencySymbol.
 */
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

export type DisplayCurrencyCode = keyof typeof CURRENCIES

export function isDisplayCurrency(code: string): code is DisplayCurrencyCode {
  return code in CURRENCIES
}

/**
 * Static rates, keyed only by the currencies offered as display targets.
 *
 * Partial on purpose: a stored currency with no rate must be detectable rather
 * than producing NaN, which is what indexing a full Record would have done the
 * moment the stored set grew past the display set.
 */
const EXCHANGE_RATES: Partial<Record<CurrencyCode, number>> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  AUD: 1.54,
  CAD: 1.36,
  CHF: 0.88,
  CNY: 7.24,
  INR: 83.12,
  KRW: 1319.5,
}

/** Whether an amount in this currency can be converted into a display total. */
export function canConvertCurrency(code: string | null | undefined): boolean {
  return Boolean(code && EXCHANGE_RATES[code as CurrencyCode] !== undefined)
}

/**
 * Converts between currencies, leaving the amount untouched when either side
 * has no known rate. Returning the figure unconverted keeps a total finite and
 * close, where the previous full-Record lookup silently yielded NaN and took
 * the whole total with it. Pair with canConvertCurrency when a caller needs to
 * tell the user the figure is approximate.
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const fromRate = EXCHANGE_RATES[fromCurrency]
  const toRate = EXCHANGE_RATES[toCurrency]

  if (fromRate === undefined || toRate === undefined) {
    return amount
  }

  const amountInUSD = amount / fromRate

  return amountInUSD * toRate
}

/**
 * Symbol for any stored currency. Intl knows every ISO-4217 code, so this works
 * for currencies outside the picker; CURRENCIES only covers display targets.
 */
export function getCurrencySymbol(code: string | null | undefined): string {
  if (!code) return '$'
  if (isDisplayCurrency(code)) return CURRENCIES[code].symbol

  try {
    const parts = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    }).formatToParts(0)

    return parts.find((part) => part.type === 'currency')?.value ?? code
  } catch {
    return code
  }
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
