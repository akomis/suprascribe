import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    // Use service role client to bypass RLS policies on USER_TIERS
    const supabaseAdmin = createServiceClient()

    // Store pending_upgrade_email in USER_TIERS - helps webhook identify the user
    const { error } = await supabaseAdmin.from('USER_TIERS').upsert(
      {
        user_id: user.id,
        pending_upgrade_email: email.toLowerCase().trim(),
      },
      { onConflict: 'user_id' },
    )

    if (error) {
      console.error('Failed to record pending upgrade:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
