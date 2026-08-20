import { withAuth } from '@/lib/api/withAuth'
import { captureEvent } from '@/lib/posthog-server'
import { NextResponse } from 'next/server'

// Resets subscription data only. Discovery history is deliberately kept: it is
// the record of a user's scan quota, so clearing it would hand out a fresh
// allowance on every reset.
export const DELETE = withAuth(async (_req, { user, supabase }) => {
  try {
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
