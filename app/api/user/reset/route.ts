import { withAuth } from '@/lib/api/withAuth'
import { captureEvent } from '@/lib/posthog-server'
import { NextResponse } from 'next/server'

export const DELETE = withAuth(async (_req, { user, supabase }) => {
  try {
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

    void captureEvent(user.id, 'user_data_reset')

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
})
