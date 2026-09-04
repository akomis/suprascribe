import { STRIPE_API_VERSION } from '@/lib/config/stripe'
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

// Every session we act on is created by /api/upgrade, which stamps user_id and
// an optional referral_code into metadata. Anything without that metadata is not
// ours to fulfil.
function resolveUserId(
  session: Stripe.Checkout.Session,
): { userId: string; affiliateCode?: string } | NextResponse {
  const userId = session.metadata?.user_id

  if (!userId) {
    console.warn(`[Webhook] pro_upgrade session ${session.id} has no user_id metadata`)
    return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
  }

  const affiliateCode = session.metadata?.referral_code || undefined
  console.log(
    `[Webhook] Resolved ${userId}${affiliateCode ? ` (affiliate: ${affiliateCode})` : ''} from session ${session.id}`,
  )
  return { userId, affiliateCode }
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
    console.log(`✅ Affiliate conversion recorded: ${affiliateCode} → ${userId}`)
  } else if (convErr.code !== '23505') {
    console.error('Failed to record affiliate conversion:', convErr)
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<NextResponse> {
  // Only sessions this app created for a PRO upgrade grant a tier. One-time
  // discovery payments (fulfilled synchronously at their own success_url, see
  // /api/discovery/once/verify) and anything else land here and are ignored.
  if (session.metadata?.purpose !== 'pro_upgrade') {
    console.log(
      `[Webhook] Ignoring session ${session.id} (purpose: ${session.metadata?.purpose ?? 'none'})`,
    )
    return NextResponse.json({ received: true })
  }

  const resolved = resolveUserId(session)
  if (resolved instanceof NextResponse) return resolved

  const supabase = createSupabaseAdmin()
  const { userId, affiliateCode } = resolved
  const { error } = await supabase.from('USER_TIERS').upsert(
    {
      user_id: userId,
      tier: 'PRO',
      date_upgraded: new Date().toISOString(),
      stripe_payment_intent_id: (session.payment_intent as string) ?? null,
    },
    { onConflict: 'user_id' },
  )
  if (error) {
    console.error('Failed to update tier:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

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
