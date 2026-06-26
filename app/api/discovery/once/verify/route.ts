import { STRIPE_API_VERSION } from '@/lib/config/stripe'
import {
  ENTITLEMENT_COOKIE,
  ENTITLEMENT_TTL_SECONDS,
  mintEntitlement,
} from '@/lib/discovery/entitlement'
import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Called by the /one-time-scan funnel after returning from Stripe. Verifies the €1
// payment, claims the payment_intent (one redemption per payment), and mints a
// short-lived entitlement cookie the anonymous discover endpoint validates.
export async function POST(request: NextRequest) {
  let sessionId: string | undefined
  try {
    const body = (await request.json()) as { session_id?: string }
    sessionId = body.session_id
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  if (!sessionId) {
    return NextResponse.json({ ok: false, error: 'Missing session_id' }, { status: 400 })
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    const valid =
      session.payment_status === 'paid' &&
      session.metadata?.purpose === 'one_time_discovery' &&
      session.amount_total === 100 &&
      session.currency === 'eur'

    if (!valid) {
      return NextResponse.json({ ok: false, error: 'Payment not verified' }, { status: 402 })
    }

    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id
    if (!paymentIntentId) {
      return NextResponse.json({ ok: false, error: 'Missing payment reference' }, { status: 402 })
    }

    const payerEmail = session.customer_details?.email ?? session.customer_email ?? null

    const supabase = createServiceClient()

    // Atomic claim at the primary key: insert if new, no-op if it already exists.
    await supabase.from('ONE_TIME_DISCOVERIES').insert({
      stripe_payment_intent_id: paymentIntentId,
      stripe_session_id: session.id,
      payer_email: payerEmail,
      status: 'paid',
    })

    const { data: row } = await supabase
      .from('ONE_TIME_DISCOVERIES')
      .select('status')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .maybeSingle()

    if (row?.status === 'discovered') {
      return NextResponse.json(
        { ok: false, error: 'This payment has already been used' },
        { status: 409 },
      )
    }

    const response = NextResponse.json({ ok: true })
    response.cookies.set(ENTITLEMENT_COOKIE, mintEntitlement(paymentIntentId, session.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ENTITLEMENT_TTL_SECONDS,
    })
    return response
  } catch (err) {
    console.error('[OnceDiscovery] verify error:', err)
    return NextResponse.json({ ok: false, error: 'Verification failed' }, { status: 500 })
  }
}
