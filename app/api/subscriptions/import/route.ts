import { withAdminAuth } from '@/lib/api/withAuth'
import { hasFeatureAccess } from '@/lib/config/features'
import { Constants } from '@/lib/database.types'
import { captureEvent } from '@/lib/posthog-server'
import { intakeSubscription } from '@/lib/services/subscription-intake'
import { getUserTier } from '@/lib/supabase/tier'
import type { CreateSubscriptionFormData } from '@/lib/types/forms'
import { transformFormToDatabaseInserts } from '@/lib/utils'
import { rateLimit } from '@/lib/utils/rate-limit'
import { IMPORT_BATCH_SIZE, parseUrl, type ImportRowResult } from '@/lib/utils/subscriptions-csv'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD')

// http(s) only: the cancel link is rendered as a button, so a "javascript:"
// URL must never reach the database.
const safeUrl = z
  .string()
  .max(2048)
  .refine((value) => parseUrl(value) === value, 'Must be an http(s) URL')

// The client has already parsed the file, but nothing it sends is trusted.
const RowSchema = z
  .object({
    serviceName: z.string().trim().min(1).max(200),
    price: z.number().finite().min(0).max(1_000_000),
    currency: z.enum(Constants.public.Enums.CURRENCY_CODE),
    period: z.enum(Constants.public.Enums.BILLING_PERIOD).optional(),
    startDate: isoDate,
    endDate: isoDate,
    autoRenew: z.boolean(),
    serviceUrl: safeUrl.optional(),
    serviceUnsubscribeUrl: safeUrl.optional(),
    serviceCategory: z.enum(Constants.public.Enums.SUBSCRIPTION_CATEGORY).optional(),
    paymentMethod: z.string().trim().max(100).optional(),
  })
  .refine((row) => row.startDate <= row.endDate, 'Start date is after the next billing date')

const BodySchema = z.object({ rows: z.array(z.unknown()).min(1).max(IMPORT_BATCH_SIZE) })

export const POST = withAdminAuth(async (request, { user, supabase, admin }) => {
  const limited = rateLimit(request, 40, 10 * 60 * 1000, 'subscriptions-import')
  if (limited) return limited

  try {
    const userTier = await getUserTier(admin, user.id)
    if (!hasFeatureAccess(userTier, 'import_export')) {
      return NextResponse.json({ error: 'Import requires a PRO subscription' }, { status: 403 })
    }

    const body = BodySchema.safeParse(await request.json().catch(() => null))
    if (!body.success) {
      return NextResponse.json(
        { error: `Send between 1 and ${IMPORT_BATCH_SIZE} rows` },
        { status: 400 },
      )
    }

    const results: ImportRowResult[] = []

    // One at a time: rows for the same new service would otherwise race to
    // create it, and intake's duplicate check reads rows the previous one wrote.
    for (const [index, raw] of body.data.rows.entries()) {
      const parsed = RowSchema.safeParse(raw)
      if (!parsed.success) {
        results.push({ index, status: 'failed', error: parsed.error.issues[0]?.message })
        continue
      }

      const { service, subscription } = transformFormToDatabaseInserts(
        parsed.data as CreateSubscriptionFormData,
        user.id,
      )
      const result = await intakeSubscription(supabase, service, subscription)

      if (result.ok) {
        results.push({ index, status: 'imported' })
      } else if (
        result.status === 400 &&
        result.error.startsWith('This subscription already exists')
      ) {
        results.push({ index, status: 'duplicate' })
      } else {
        results.push({ index, status: 'failed', error: result.error })
      }
    }

    const count = (status: ImportRowResult['status']) =>
      results.filter((r) => r.status === status).length

    void captureEvent(user.id, 'subscriptions_imported', {
      imported: count('imported'),
      duplicates: count('duplicate'),
      failed: count('failed'),
    })

    return NextResponse.json({ data: results })
  } catch (err) {
    console.error('[POST /subscriptions/import] Unexpected error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
})
