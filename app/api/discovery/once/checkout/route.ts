import { getOnceScanPriceCents } from '@/lib/config/pricing'
import { CHECKOUT_CONSENT, STRIPE_API_VERSION } from '@/lib/config/stripe'
import { currencyFromRequest } from '@/lib/pricing/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Creates the one-time Stripe Checkout Session for the anonymous discovery
// funnel. No user/account involved. The `purpose` metadata lets the PRO webhook
// ignore this payment so it never grants a PRO tier.
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
  const currency = currencyFromRequest(request)

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: getOnceScanPriceCents(currency),
            // The advertised price is what the customer pays: any VAT is already
            // inside it rather than added on top at checkout.
            tax_behavior: 'inclusive',
            product_data: {
              name: 'One-time subscription discovery',
              description:
                'Scan one inbox once and reveal your subscriptions with unsubscribe links.',
            },
          },
          quantity: 1,
        },
      ],
      ...CHECKOUT_CONSENT,
      metadata: { purpose: 'one_time_discovery' },
      payment_intent_data: { metadata: { purpose: 'one_time_discovery' } },
      success_url: `${baseUrl}/one-time-scan?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/one-time-scan?canceled=true`,
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[OnceDiscovery] checkout error:', err)
    return NextResponse.json({ error: 'Failed to start checkout' }, { status: 500 })
  }
}
