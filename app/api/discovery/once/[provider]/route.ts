import { ENTITLEMENT_COOKIE, readEntitlement } from '@/lib/discovery/entitlement'
import { discover } from '@/lib/services/subscription-discovery'
import { createServiceClient } from '@/lib/supabase/server'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import { NextRequest, NextResponse } from 'next/server'

// Anonymous, payment-gated discovery for the one-time funnel. No Supabase auth,
// no orchestrator: validates the entitlement cookie + an unconsumed payment row,
// then runs the pure discover() core with the default model. Nothing about the
// scanned subscriptions is persisted.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<NextResponse<DiscoveryResponse>> {
  const { provider } = await params

  if (provider !== 'google' && provider !== 'microsoft') {
    return NextResponse.json({
      success: false,
      kind: 'validation_error',
      error: `Invalid provider: ${provider}`,
    })
  }

  const entitlement = readEntitlement(request.cookies.get(ENTITLEMENT_COOKIE)?.value)
  if (!entitlement) {
    return NextResponse.json({
      success: false,
      kind: 'auth_failed',
      error: 'Payment required. Please purchase a one-time discovery to continue.',
    })
  }

  const token = request.cookies.get(`discovery_token_${provider}`)?.value
  if (!token) {
    return NextResponse.json({
      success: false,
      kind: 'auth_failed',
      error: `Missing access token for ${provider}. Please reconnect your inbox.`,
    })
  }

  const supabase = createServiceClient()
  const { data: row } = await supabase
    .from('ONE_TIME_DISCOVERIES')
    .select('status')
    .eq('stripe_payment_intent_id', entitlement.pi)
    .maybeSingle()

  if (!row) {
    return NextResponse.json({
      success: false,
      kind: 'auth_failed',
      error: 'Payment not found. Please purchase a one-time discovery to continue.',
    })
  }
  if (row.status === 'discovered') {
    return NextResponse.json({
      success: false,
      kind: 'rate_limited',
      error: 'This payment has already been used for a discovery.',
    })
  }

  let result: Awaited<ReturnType<typeof discover>>
  try {
    result = await discover({ provider, credentials: { token } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Discovery failed'
    console.error('[OnceDiscovery] discover error:', message)
    return NextResponse.json({ success: false, kind: 'provider_error', error: message })
  }

  const { subscriptions, emailCount, email } = result

  // Consume the payment so it cannot be redeemed again. Store counts only.
  await supabase
    .from('ONE_TIME_DISCOVERIES')
    .update({
      status: 'discovered',
      discovered_at: new Date().toISOString(),
      email_scanned: email,
      subscriptions_found: subscriptions.length,
    })
    .eq('stripe_payment_intent_id', entitlement.pi)

  const response = NextResponse.json<DiscoveryResponse>({
    success: true,
    subscriptions,
    emailCount,
    email,
  })
  // Clear the single-use cookies.
  response.cookies.set(ENTITLEMENT_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(`discovery_token_${provider}`, '', { path: '/', maxAge: 0 })
  return response
}
