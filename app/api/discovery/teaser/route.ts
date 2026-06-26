import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getUserTier } from '@/lib/supabase/tier'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import { decryptApiKey } from '@/lib/utils/server-crypto'
import { NextResponse } from 'next/server'

export interface TeaserStatusResponse {
  freeScanUsed: boolean
  hasPendingTeaser: boolean
  subscriptionsFound: number
  isPro: boolean
}

export async function GET(): Promise<NextResponse<TeaserStatusResponse>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      freeScanUsed: false,
      hasPendingTeaser: false,
      subscriptionsFound: 0,
      isPro: false,
    })
  }

  const admin = createServiceClient()
  const isPro = (await getUserTier(admin, user.id)) === 'PRO'

  const { data: teaser } = await admin
    .from('DISCOVERY_TEASERS')
    .select('subscriptions_found, claimed, expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  const hasPendingTeaser =
    !!teaser && !teaser.claimed && new Date(teaser.expires_at).getTime() > Date.now()

  return NextResponse.json({
    freeScanUsed: !!teaser,
    hasPendingTeaser,
    subscriptionsFound: teaser?.subscriptions_found ?? 0,
    isPro,
  })
}

export async function POST(): Promise<NextResponse<DiscoveryResponse>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({
      success: false,
      kind: 'auth_failed',
      error: 'Unauthorized. Please log in to claim your discovered subscriptions.',
    })
  }

  const admin = createServiceClient()

  if ((await getUserTier(admin, user.id)) !== 'PRO') {
    return NextResponse.json(
      {
        success: false,
        kind: 'auth_failed',
        error: 'Upgrade to Pro to unlock your discovered subscriptions.',
      },
      { status: 403 },
    )
  }

  const { data: teaser, error } = await admin
    .from('DISCOVERY_TEASERS')
    .select('id, email_address, payload_encrypted, claimed, expires_at')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error || !teaser) {
    return NextResponse.json({
      success: false,
      kind: 'unknown',
      error: 'No discovered subscriptions found to unlock.',
    })
  }

  if (teaser.claimed) {
    return NextResponse.json({
      success: false,
      kind: 'unknown',
      error: 'These discovered subscriptions have already been unlocked.',
    })
  }

  if (new Date(teaser.expires_at).getTime() <= Date.now()) {
    return NextResponse.json({
      success: false,
      kind: 'unknown',
      error: 'Your discovered subscriptions have expired. Please run a new scan.',
    })
  }

  let subscriptions: DiscoveredSubscription[]
  try {
    subscriptions = JSON.parse(decryptApiKey(teaser.payload_encrypted)) as DiscoveredSubscription[]
  } catch (err) {
    console.error('[Teaser] Failed to decrypt payload:', err)
    return NextResponse.json({
      success: false,
      kind: 'unknown',
      error: 'Failed to read your discovered subscriptions.',
    })
  }

  const { error: updateError } = await admin
    .from('DISCOVERY_TEASERS')
    .update({ claimed: true })
    .eq('id', teaser.id)

  if (updateError) {
    console.error('[Teaser] Failed to mark teaser claimed:', updateError)
    return NextResponse.json({
      success: false,
      kind: 'unknown',
      error: 'Failed to unlock your discovered subscriptions.',
    })
  }

  return NextResponse.json({
    success: true,
    subscriptions,
    emailCount: 0,
    email: teaser.email_address,
  })
}
