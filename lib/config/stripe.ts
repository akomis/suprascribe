// Type-only: this module is imported by client components (pricing cards), and a
// runtime import would drag the Stripe SDK into the browser bundle.
import type Stripe from 'stripe'

export const STRIPE_API_VERSION: Stripe.LatestApiVersion = '2026-02-25.clover'

// Prices live in ./pricing - PRO and the one-time scan are each priced separately
// per currency, and the currency is resolved per visitor (see ../pricing/detect).

// Stripe fetches product images from its own servers, so this must be publicly
// reachable - a NEXT_PUBLIC_BASE_URL-derived localhost URL silently renders no
// image. The logo is identical across environments, so it is pinned to prod.
// Uses the www host directly: suprascribe.com redirects there (see next.config).
export const PRO_PRODUCT_IMAGE_URL = 'https://www.suprascribe.com/logo.jpg'

// Rendered inside Stripe's hosted checkout, so it is pinned to prod for the same
// reason as the product image above - a localhost URL would be a dead link.
export const TERMS_URL = 'https://www.suprascribe.com/terms-and-privacy'

// Spread into every Checkout Session so both funnels ask for consent in the same
// words. `terms_of_service: 'required'` puts a checkbox above the pay button and
// records the acceptance on the session (`session.consent.terms_of_service`),
// which is what makes it auditable after the fact. It requires a terms of service
// URL on the Stripe account (Dashboard > Settings > Public details, set per mode)
// or session creation fails.
export const CHECKOUT_CONSENT = {
  consent_collection: { terms_of_service: 'required' },
  custom_text: {
    terms_of_service_acceptance: {
      message: `I agree to the [Terms & Privacy Policy](${TERMS_URL}).`,
    },
  },
} satisfies Pick<Stripe.Checkout.SessionCreateParams, 'consent_collection' | 'custom_text'>
