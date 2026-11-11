import { describe, expect, it } from 'vitest'
import { formatCurrencyAmount, getCurrencySymbol, normalizeCurrency } from '@/lib/utils/currency'

describe('normalizeCurrency', () => {
  it('accepts ISO-4217 codes', () => {
    expect(normalizeCurrency('USD')).toBe('USD')
    expect(normalizeCurrency('ils')).toBe('ILS')
  })

  it('maps the shekel symbol to ILS', () => {
    expect(normalizeCurrency('₪')).toBe('ILS')
  })

  it('maps common shekel spellings to ILS', () => {
    expect(normalizeCurrency('NIS')).toBe('ILS')
    expect(normalizeCurrency('shekel')).toBe('ILS')
    expect(normalizeCurrency('SHEKELS')).toBe('ILS')
  })

  it('finds a symbol inside an amount string', () => {
    expect(normalizeCurrency('₪29.90')).toBe('ILS')
    expect(normalizeCurrency('9.99 $')).toBe('USD')
  })

  it('returns undefined for unrecognisable input', () => {
    expect(normalizeCurrency('banana')).toBeUndefined()
    expect(normalizeCurrency('')).toBeUndefined()
    expect(normalizeCurrency(null)).toBeUndefined()
  })
})

describe('formatCurrencyAmount', () => {
  it('formats shekel amounts', () => {
    expect(formatCurrencyAmount(29.9, 'ILS')).toBe('₪29.90')
  })

  it('falls back gracefully for invalid currency codes', () => {
    expect(formatCurrencyAmount(9.99, '₪')).toBe('₪9.99')
  })
})

describe('getCurrencySymbol', () => {
  it('returns the shekel symbol for ILS', () => {
    expect(getCurrencySymbol('ILS')).toBe('₪')
  })

  it('returns the input code when Intl cannot resolve it', () => {
    expect(getCurrencySymbol('XYZ')).toBe('XYZ')
  })
})
