import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('DISCOVERY_RUNS')
      .select('subscriptions_found, user_id')

    if (error) {
      console.error('[Discovery Stats] Error fetching stats:', error)
      return NextResponse.json({ error: 'Failed to fetch discovery stats' }, { status: 500 })
    }

    const total = (data || []).reduce((sum, run) => sum + (run.subscriptions_found || 0), 0)
    const uniqueUsers = new Set((data || []).map((run) => run.user_id)).size

    return NextResponse.json({ total, users: uniqueUsers })
  } catch (error) {
    console.error('[Discovery Stats] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
