import { withAdminAuth } from '@/lib/api/withAuth'
import { hasFeatureAccess } from '@/lib/config/features'
import { captureEvent } from '@/lib/posthog-server'
import { fetchSubscriptionsServer } from '@/lib/services/subscriptions-server'
import { getUserTier } from '@/lib/supabase/tier'
import { exportFilename, rowsFromMerged, toCsv } from '@/lib/utils/subscriptions-csv'
import { NextResponse } from 'next/server'

export const GET = withAdminAuth(async (_req, { user, admin }) => {
  try {
    const userTier = await getUserTier(admin, user.id)
    if (!hasFeatureAccess(userTier, 'import_export')) {
      return NextResponse.json({ error: 'Export requires a PRO subscription' }, { status: 403 })
    }

    const rows = rowsFromMerged(await fetchSubscriptionsServer())

    void captureEvent(user.id, 'subscriptions_exported', { count: rows.length })

    return new NextResponse(toCsv(rows), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${exportFilename('suprascribe-subscriptions')}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
})
