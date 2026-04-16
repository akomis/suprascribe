import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { NextResponse } from 'next/server'

export async function DELETE() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { error: discoveryError } = await supabase
      .from('DISCOVERY_RUNS')
      .delete()
      .eq('user_id', user.id)

    if (discoveryError) {
      return NextResponse.json(
        { error: `Error deleting discovery history: ${discoveryError.message}` },
        { status: 500 },
      )
    }

    const { error: subscriptionsError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .delete()
      .eq('user_id', user.id)

    if (subscriptionsError) {
      return NextResponse.json(
        { error: `Error deleting subscriptions: ${subscriptionsError.message}` },
        { status: 500 },
      )
    }

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'user_data_reset',
      properties: {},
    })
    await posthog.shutdown()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
