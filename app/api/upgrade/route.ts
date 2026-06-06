import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK

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

  try {
    await supabaseAdmin
      .from('USER_TIERS')
      .upsert(
        { user_id: user.id, pending_upgrade_email: user.email?.toLowerCase().trim() },
        { onConflict: 'user_id' },
      )
  } catch {}

  const referralCode = request.cookies.get('referral_code')?.value
  let clientRefId = user.id

  if (referralCode) {
    const { data: affiliate } = await supabaseAdmin
      .from('AFFILIATES')
      .select('id')
      .eq('code', referralCode)
      .maybeSingle()
    if (affiliate) {
      clientRefId = `${user.id}:${referralCode}`
    }
  }

  const paymentUrl =
    `${STRIPE_PAYMENT_LINK}` +
    `?prefilled_email=${encodeURIComponent(user.email ?? '')}` +
    `&client_reference_id=${encodeURIComponent(clientRefId)}`
  return NextResponse.redirect(paymentUrl)
}
