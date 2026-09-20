/**
 * The single source of truth for what we charge, in every currency we charge it in.
 *
 * PRO and the one-time inbox scan are both one-time payments. Each currency here is
 * an independent, deliberately chosen price - NOT an FX conversion of the euro price.
 * $25 is a premium over €20 on purpose, so nothing in this file may ever "convert".
 *
 * Which currency a given visitor gets is decided in ../pricing/detect (browser
 * timezone, correctable by the visitor) and read back server-side in
 * ../pricing/server. This module only answers "what does X cost in currency Y".
 *
 * No runtime `stripe` import here: this is imported by client components (the
 * pricing cards), and a runtime import would drag the Stripe SDK into the browser
 * bundle. Stripe-specific constants live in ./stripe.
 */
import { DISCOUNT, getDiscountStatus } from './discount'

export const SUPPORTED_CURRENCIES = ['usd', 'eur', 'gbp'] as const
export type PricingCurrency = (typeof SUPPORTED_CURRENCIES)[number]

/**
 * What server-rendered (and therefore CDN-cached, visitor-agnostic) HTML shows, and
 * what an absent or unrecognised currency cookie falls back to. The client corrects
 * this after mount for EEA and UK visitors - see ../hooks/usePricingCurrency.
 */
export const DEFAULT_CURRENCY: PricingCurrency = 'usd'

/**
 * Carries the resolved currency from the browser (which is the only thing that can
 * work it out) to the checkout routes (which are the only thing that can charge it).
 * A cookie rather than localStorage precisely because the server has to read it.
 *
 * It also remembers the visitor's own pick: a currency chosen with the toggle
 * outranks the timezone guess on every later visit, and the timezone is only
 * consulted when the cookie is absent.
 *
 * Not httpOnly - the client writes it. That makes it visitor-controlled: someone can
 * hand-edit it and pay €20 instead of $25. Accepted; the currency toggle makes it an
 * explicit choice anyway, and the delta is $5 on a one-time purchase.
 */
export const PRICING_CURRENCY_COOKIE = 'suprascribe_pricing_currency'
export const PRICING_CURRENCY_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export interface CurrencyPricing {
  symbol: string
  /** Undiscounted PRO price. */
  proFullCents: number
  /** PRO price while the offer in ./discount runs. */
  proDiscountCents: number
  /** The anonymous one-time inbox scan (/one-time-scan funnel). */
  onceScanCents: number
}

export const PRICING: Record<PricingCurrency, CurrencyPricing> = {
  eur: {
    symbol: '€',
    proFullCents: 2000,
    // Kept in ./discount so the offer's knobs (name, how long, how much) stay together.
    proDiscountCents: DISCOUNT.priceCents,
    onceScanCents: 500,
  },
  usd: {
    symbol: '$',
    proFullCents: 2500,
    // Exactly 20% off the full price, so the offer badge reads "20%" in every currency.
    proDiscountCents: 2000,
    onceScanCents: 500,
  },
  gbp: {
    symbol: '£',
    proFullCents: 1800,
    proDiscountCents: 1440,
    onceScanCents: 500,
  },
}

/**
 * One price expressed in every currency we sell in.
 *
 * Server components render once into CDN-cached HTML and so cannot know the
 * visitor's currency - they hand the whole map across the boundary and let the
 * client component pick from it. Plain data, so it serializes.
 */
export type PriceByCurrency = Record<PricingCurrency, number>

function priceByCurrency(pick: (prices: CurrencyPricing) => number): PriceByCurrency {
  return Object.fromEntries(
    SUPPORTED_CURRENCIES.map((currency) => [currency, pick(PRICING[currency])]),
  ) as PriceByCurrency
}

export const FREE_PRICES: PriceByCurrency = priceByCurrency(() => 0)
export const PRO_FULL_PRICES: PriceByCurrency = priceByCurrency((p) => p.proFullCents)
export const PRO_DISCOUNT_PRICES: PriceByCurrency = priceByCurrency((p) => p.proDiscountCents)

export function isPricingCurrency(value: unknown): value is PricingCurrency {
  return typeof value === 'string' && SUPPORTED_CURRENCIES.includes(value as PricingCurrency)
}

/**
 * "€20", "$25", "$12.50". Whole amounts drop the decimals; anything else keeps
 * both of them - a plain NumberFormat would render 1250 cents as "$12.5".
 */
export function formatPrice(cents: number, currency: PricingCurrency): string {
  const amount = cents / 100
  const fractionDigits = Number.isInteger(amount) ? 0 : 2
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount)
  return `${PRICING[currency].symbol}${formatted}`
}

/**
 * Price actually charged for PRO: the discounted one while the offer runs
 * (see ./discount), the full price once it ends.
 */
export function getProPriceCents(currency: PricingCurrency, now?: Date): number {
  const prices = PRICING[currency]
  return getDiscountStatus(now).active ? prices.proDiscountCents : prices.proFullCents
}

export function getOnceScanPriceCents(currency: PricingCurrency): number {
  return PRICING[currency].onceScanCents
}

/** Whole-number discount of the offer price against the full price, e.g. 20 for €16 against €20. */
export function getProDiscountPercent(currency: PricingCurrency): number {
  const { proFullCents, proDiscountCents } = PRICING[currency]
  return Math.round((1 - proDiscountCents / proFullCents) * 100)
}

/**
 * The `Offer` node for our PRO product, for the JSON-LD on the landing page and
 * the SEO pages.
 *
 * Deliberately pinned to DEFAULT_CURRENCY: those pages are prerendered once and
 * served from the CDN to every visitor, so their structured data has to be a single
 * stable price rather than whatever currency the last renderer happened to pick -
 * and the default is the one the prerendered HTML itself shows. It also tracks the
 * discount, so the markup can no longer go stale against the real price.
 */
export function buildProOfferJsonLd() {
  return {
    '@type': 'Offer',
    price: String(getProPriceCents(DEFAULT_CURRENCY) / 100),
    priceCurrency: DEFAULT_CURRENCY.toUpperCase(),
    availability: 'https://schema.org/InStock',
  }
}
