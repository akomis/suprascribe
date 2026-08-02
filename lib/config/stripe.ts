import Stripe from 'stripe'

export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-02-25.clover'

// PRO is a one-time purchase. These drive both the Stripe charge and the price
// shown on the landing page, so the two cannot drift apart.
export const PRO_PRICE_CENTS = 1000
export const PRO_CURRENCY = 'eur'
export const PRO_ORIGINAL_PRICE_DISPLAY = '€20'

export function formatProPrice(cents: number = PRO_PRICE_CENTS): string {
  return `€${new Intl.NumberFormat('de-DE').format(cents / 100)}`
}

// Stripe fetches product images from its own servers, so this must be publicly
// reachable — a NEXT_PUBLIC_BASE_URL-derived localhost URL silently renders no
// image. The logo is identical across environments, so it is pinned to prod.
// Uses the www host directly: suprascribe.com redirects there (see next.config).
export const PRO_PRODUCT_IMAGE_URL = 'https://www.suprascribe.com/logo.jpg'
