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
    .select('code')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!affiliate) {
    return NextResponse.json({ conversions: 0, totalCommission: 0, pendingCommission: 0 })
  }

  const { data: conversions } = await supabaseAdmin
    .from('AFFILIATE_CONVERSIONS')
    .select('commission_amount, status')
    .eq('affiliate_code', affiliate.code)

  const rows = conversions ?? []
  const totalCommission = rows.reduce((sum, r) => sum + Number(r.commission_amount), 0)
  const pendingCommission = rows
    .filter((r) => r.status === 'pending')
    .reduce((sum, r) => sum + Number(r.commission_amount), 0)

  return NextResponse.json({
    conversions: rows.length,
    totalCommission: Math.round(totalCommission * 100) / 100,
    pendingCommission: Math.round(pendingCommission * 100) / 100,
  })
}
