import { STRIPE_API_VERSION } from '@/lib/config/stripe'
import { captureEvent } from '@/lib/posthog-server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'

function createSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )
}

// Prefer client_reference_id (Supabase user ID passed from UpgradeButton) for a direct,
// reliable lookup. Then check USER_TIERS.pending_upgrade_email. Fall back to email scan as last resort.
async function resolveUserId(
  supabase: SupabaseClient,
  session: Stripe.Checkout.Session,
): Promise<{ userId: string; affiliateCode?: string } | NextResponse> {
  const clientRefId = session.client_reference_id
  const customerEmail = session.customer_email || session.customer_details?.email

  console.log(`[Webhook Debug] Session ${session.id}:`, {
    client_reference_id: clientRefId,
    customer_email: customerEmail,
    payment_status: session.payment_status,
    payment_intent: session.payment_intent,
  })

  if (clientRefId) {
    const [userId, affiliateCode] = clientRefId.split(':')
    console.log(
      `[Webhook Debug] Using client_reference_id: ${userId}${affiliateCode ? ` (affiliate: ${affiliateCode})` : ''}`,
    )
    return { userId, affiliateCode }
  }

  if (!customerEmail) {
    console.warn(`[Webhook Debug] No user found for session:`, {
      session_id: session.id,
      customer_email: customerEmail,
    })
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  const normalizedEmail = customerEmail.toLowerCase().trim()
  console.log(`[Webhook Debug] Checking USER_TIERS.pending_upgrade_email for: ${normalizedEmail}`)

  const { data: pendingTier } = await supabase
    .from('USER_TIERS')
    .select('user_id')
    .eq('pending_upgrade_email', normalizedEmail)
    .maybeSingle()
  if (pendingTier?.user_id) {
    console.log(
      `[Webhook Debug] Found user ${pendingTier.user_id} in USER_TIERS.pending_upgrade_email`,
    )
    return { userId: pendingTier.user_id }
  }

  console.log(`[Webhook Debug] Falling back to auth user lookup`)
  let page = 1
  let totalUsersChecked = 0
  let userId: string | undefined

  while (!userId) {
    const { data: authData, error: userError } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    })
    if (userError) {
      console.error('[Webhook Debug] Failed to list users:', userError)
      return NextResponse.json({ success: false, error: 'Failed to lookup user' }, { status: 500 })
    }
    if (authData.users.length === 0) break
    totalUsersChecked += authData.users.length
    const match = authData.users.find((u) => u.email?.toLowerCase().trim() === normalizedEmail)
    if (match) {
      userId = match.id
      console.log(`[Webhook Debug] Found user ${userId} in auth on page ${page}`)
    }
    page++
  }

  console.log(`[Webhook Debug] Checked ${totalUsersChecked} auth users`)
  if (!userId) {
    console.warn(`[Webhook Debug] No user found for session:`, {
      session_id: session.id,
      customer_email: customerEmail,
    })
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }
  return { userId }
}

async function handleAffiliateConversion(
  supabase: SupabaseClient,
  userId: string,
  session: Stripe.Checkout.Session,
  affiliateCode: string,
) {
  const { data: affiliate } = await supabase
    .from('AFFILIATES')
    .select('commission_rate')
    .eq('code', affiliateCode)
    .maybeSingle()
  if (!affiliate) return
  const commissionAmount = ((session.amount_total ?? 0) / 100) * Number(affiliate.commission_rate)
  const { error: convErr } = await supabase.from('AFFILIATE_CONVERSIONS').insert({
    affiliate_code: affiliateCode,
    converted_user_id: userId,
    stripe_payment_intent_id: (session.payment_intent as string) ?? null,
    amount_cents: session.amount_total ?? 0,
    currency: session.currency ?? 'eur',
    commission_amount: commissionAmount,
    status: 'pending',
  })
  if (!convErr) {
    await captureEvent(userId, 'affiliate_conversion', {
      affiliate_code: affiliateCode,
      amount_total: session.amount_total,
      commission_amount: commissionAmount,
    })
    console.log(`✅ Affiliate conversion recorded: ${affiliateCode} → ${userId}`)
  } else if (convErr.code !== '23505') {
    console.error('Failed to record affiliate conversion:', convErr)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<NextResponse> {
  const supabase = createSupabaseAdmin()
  const resolved = await resolveUserId(supabase, session)
  if (resolved instanceof NextResponse) return resolved

  const { userId, affiliateCode } = resolved
  const { error } = await supabase.from('USER_TIERS').upsert(
    {
      user_id: userId,
      tier: 'PRO',
      date_upgraded: new Date().toISOString(),
      stripe_payment_intent_id: (session.payment_intent as string) ?? null,
      pending_upgrade_email: null,
    },
    { onConflict: 'user_id' },
  )
  if (error) {
    console.error('Failed to update tier:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  await captureEvent(userId, 'pro_upgrade_completed', {
    stripe_session_id: session.id,
    amount_total: session.amount_total,
    currency: session.currency,
  })
  if (affiliateCode) await handleAffiliateConversion(supabase, userId, session, affiliateCode)

  console.log(`✅ User ${userId} upgraded to PRO via session ${session.id}`)
  return NextResponse.json({ success: true })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    if (!signature) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: STRIPE_API_VERSION })
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )

    if (event.type === 'checkout.session.completed')
      return handleCheckoutCompleted(event.data.object)

    if (event.type === 'charge.failed') {
      const charge = event.data.object
      console.warn('Payment failed for charge:', charge.id)
      await captureEvent(charge.customer?.toString() || charge.id, 'charge_failed', {
        charge_id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        failure_code: charge.failure_code,
        failure_message: charge.failure_message,
      })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: err?.message || 'Webhook processing failed' },
      { status: 500 },
    )
  }
}
