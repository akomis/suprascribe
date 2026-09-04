// Type-only: this module is imported by client components (pricing cards), and a
// runtime import would drag the Stripe SDK into the browser bundle.
import type Stripe from 'stripe'
import { DISCOUNT, getDiscountStatus } from './discount'

export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-02-25.clover'

// PRO is a one-time purchase. This is its undiscounted price - the discounted one
// lives in ./discount. Both drive the Stripe charge and the prices on the landing
// page, so the two cannot drift apart.
export const PRO_FULL_PRICE_CENTS = 2000
export const PRO_DISCOUNT_PRICE_CENTS = DISCOUNT.priceCents
export const PRO_CURRENCY = 'eur'

/**
 * Price actually charged: the discounted one while the discount runs
 * (see ./discount), the full price once it ends.
 */
export function getProPriceCents(now?: Date): number {
  return getDiscountStatus(now).active ? PRO_DISCOUNT_PRICE_CENTS : PRO_FULL_PRICE_CENTS
}

export function formatProPrice(cents: number = getProPriceCents()): string {
  return `€${new Intl.NumberFormat('en-US').format(cents / 100)}`
}

export const PRO_FULL_PRICE_DISPLAY = formatProPrice(PRO_FULL_PRICE_CENTS)
export const PRO_DISCOUNT_PRICE_DISPLAY = formatProPrice(PRO_DISCOUNT_PRICE_CENTS)

/** Whole-number discount of the offer price against the full price, e.g. 50 for €10 off €20. */
export const PRO_DISCOUNT_PERCENT = Math.round(
  (1 - PRO_DISCOUNT_PRICE_CENTS / PRO_FULL_PRICE_CENTS) * 100,
)

// The anonymous one-time inbox scan (/one-time-scan funnel). Same currency as PRO.
// Drives the Checkout Session, the payment verification check, and the copy on
// every page that advertises the scan.
export const ONCE_SCAN_PRICE_CENTS = 500
export const ONCE_SCAN_PRICE_DISPLAY = formatProPrice(ONCE_SCAN_PRICE_CENTS)

// Stripe fetches product images from its own servers, so this must be publicly
// reachable - a NEXT_PUBLIC_BASE_URL-derived localhost URL silently renders no
// image. The logo is identical across environments, so it is pinned to prod.
// Uses the www host directly: suprascribe.com redirects there (see next.config).
export const PRO_PRODUCT_IMAGE_URL = 'https://www.suprascribe.com/logo.jpg'
