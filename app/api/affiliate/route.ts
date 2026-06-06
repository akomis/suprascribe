import { createClient, createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createServiceClient()
  const { data: affiliate } = await supabaseAdmin
    .from('AFFILIATES')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  return NextResponse.json({ affiliate })
}
