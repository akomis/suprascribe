import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use service role for USER_TIERS access - only admin should manage this table
    const supabaseAdmin = createServiceClient()

    const { data, error } = await supabaseAdmin
      .from('USER_TIERS')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return tier from database, or BASIC if no record exists
    // (New users should have a USER_TIERS row created by database trigger on signup)
    return NextResponse.json({ tier: data?.tier ?? 'BASIC' })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
