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
    .select('commission_amount, currency, status')
    .eq('affiliate_code', affiliate.code)

  const rows = conversions ?? []

  // Commissions are earned in whatever currency the referred customer paid in, and
  // we sell in more than one. Summing them into a single number would add euros to
  // dollars, so each currency is totalled separately.
  const byCurrency = new Map<string, { total: number; pending: number }>()
  for (const row of rows) {
    const currency = row.currency ?? 'eur'
    const amount = Number(row.commission_amount)
    const entry = byCurrency.get(currency) ?? { total: 0, pending: 0 }
    entry.total += amount
    if (row.status === 'pending') entry.pending += amount
    byCurrency.set(currency, entry)
  }

  const round = (value: number) => Math.round(value * 100) / 100

  return NextResponse.json({
    conversions: rows.length,
    earnings: [...byCurrency.entries()]
      .map(([currency, { total, pending }]) => ({
        currency,
        total: round(total),
        pending: round(pending),
      }))
      .sort((a, b) => a.currency.localeCompare(b.currency)),
  })
}
