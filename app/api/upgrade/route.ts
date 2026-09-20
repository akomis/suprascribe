import { getProPriceCents } from '@/lib/config/pricing'
import { CHECKOUT_CONSENT, PRO_PRODUCT_IMAGE_URL, STRIPE_API_VERSION } from '@/lib/config/stripe'
import { currencyFromRequest } from '@/lib/pricing/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.url
    return NextResponse.redirect(new URL('/login', baseUrl))
  }

  const supabaseAdmin = createServiceClient()

  const { data: tierData } = await supabaseAdmin
    .from('USER_TIERS')
    .select('tier')
    .eq('user_id', user.id)
    .maybeSingle()

  if (tierData?.tier === 'PRO') {
    const origin = process.env.NEXT_PUBLIC_BASE_URL || request.url
    return NextResponse.redirect(`${origin}/dashboard`)
  }

  const referralCode = request.cookies.get('referral_code')?.value
  let validReferralCode: string | undefined

  if (referralCode) {
    const { data: affiliate } = await supabaseAdmin
      .from('AFFILIATES')
      .select('id')
      .eq('code', referralCode)
      .maybeSingle()
    if (affiliate) {
      validReferralCode = referralCode
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })

    const currency = currencyFromRequest(request)

    const metadata = {
      purpose: 'pro_upgrade',
      user_id: user.id,
      // Recorded so the charged currency is readable off the payment intent alone.
      currency,
      ...(validReferralCode ? { referral_code: validReferralCode } : {}),
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      line_items: [
        {
          price_data: {
            currency,
            unit_amount: getProPriceCents(currency),
            // The advertised price is what the customer pays: any VAT is already
            // inside it rather than added on top at checkout.
            tax_behavior: 'inclusive',
            product_data: {
              name: 'Suprascribe PRO',
              description:
                "PRO automatically discovers what you're paying for and gives you the tools to stay in control - quick unsubscribe, group/search/sort subscriptions, complete history, calendar view, renewal alerts and more.",
              images: [PRO_PRODUCT_IMAGE_URL],
            },
          },
          quantity: 1,
        },
      ],
      ...CHECKOUT_CONSENT,
      metadata,
      payment_intent_data: { metadata },
      success_url: `${baseUrl}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard?upgrade=canceled`,
    })

    if (!session.url) {
      console.error('[Upgrade] Stripe returned a session with no URL:', session.id)
      return NextResponse.redirect(`${baseUrl}/dashboard?upgrade=error`, { status: 303 })
    }

    return NextResponse.redirect(session.url, { status: 303 })
  } catch (err) {
    console.error('[Upgrade] checkout error:', err)
    return NextResponse.redirect(`${baseUrl}/dashboard?upgrade=error`, { status: 303 })
  }
}
