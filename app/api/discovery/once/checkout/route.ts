import { STRIPE_API_VERSION } from '@/lib/config/stripe'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Creates a €1 one-time Stripe Checkout Session for the anonymous discovery
// funnel. No user/account involved. The `purpose` metadata lets the PRO webhook
// ignore this payment so it never grants a Pro tier.
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            unit_amount: 100,
            product_data: {
              name: 'One-time subscription discovery',
              description:
                'Scan one inbox once and reveal your subscriptions with unsubscribe links.',
            },
          },
          quantity: 1,
        },
      ],
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
