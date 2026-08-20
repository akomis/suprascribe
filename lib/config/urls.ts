export const GITHUB_URL = 'https://github.com/akomis/suprascribe'

export const STORE_URL_HOSTNAMES = new Set([
  'apps.apple.com',
  'itunes.apple.com',
  'play.google.com',
  'market.android.com',
])

/**
 * Checkout hosts that often end up as a subscription's url because the receipt came from
 * the processor rather than the service. Their brand resolves to a real logo, so they have
 * to be demoted explicitly or they mask the actual service.
 */
export const PAYMENT_PROCESSOR_HOSTNAMES = new Set([
  'stripe.com',
  'checkout.stripe.com',
  'buy.stripe.com',
  'paddle.com',
  'creem.io',
  'lemonsqueezy.com',
  'gumroad.com',
  'chargebee.com',
  'fastspring.com',
  'recurly.com',
  'paypal.com',
  'polar.sh',
])
