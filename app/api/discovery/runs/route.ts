import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: runs, error } = await supabase
      .from('DISCOVERY_RUNS')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_byok', false)
      .order('discovered_at', { ascending: false })

    if (error) {
      console.error('[Discovery Runs] Error fetching runs:', error)
      return NextResponse.json({ error: 'Failed to fetch discovery runs' }, { status: 500 })
    }

    return NextResponse.json(runs || [])
  } catch (error) {
    console.error('[Discovery Runs] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
