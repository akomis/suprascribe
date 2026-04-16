import { CurrencyCode } from '@/lib/hooks/useCurrency'

const EXCHANGE_RATES: Record<CurrencyCode, number> = {
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

export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode,
): number {
  if (fromCurrency === toCurrency) {
    return amount
  }

  const amountInUSD = amount / EXCHANGE_RATES[fromCurrency]
  const convertedAmount = amountInUSD * EXCHANGE_RATES[toCurrency]

  return convertedAmount
}

export function formatCurrencyAmount(amount: number, currency: CurrencyCode): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}
