import { withAdminAuth } from '@/lib/api/withAuth'
import { hasFeatureAccess } from '@/lib/config/features'
import { captureEvent } from '@/lib/posthog-server'
import { getUserTier } from '@/lib/supabase/tier'
import { NextResponse } from 'next/server'

export interface ReminderSettings {
  email_reminders_enabled: boolean
  reminder_days_before: number
}

export const GET = withAdminAuth(async (_req, { user, supabase }) => {
  try {
    const { data, error } = await supabase
      .from('USER_SETTINGS')
      .select('email_reminders_enabled, reminder_days_before')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      email_reminders_enabled: data?.email_reminders_enabled ?? false,
      reminder_days_before: data?.reminder_days_before ?? 3,
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
})

export const PUT = withAdminAuth(async (request, { user, supabase, admin }) => {
  try {
    // Use service role client for USER_TIERS lookup
    const userTier = await getUserTier(admin, user.id)
    if (!hasFeatureAccess(userTier, 'renewal_reminders')) {
      return NextResponse.json(
        { error: 'Renewal reminders require a Pro subscription' },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { email_reminders_enabled, reminder_days_before } = body as ReminderSettings

    if (
      reminder_days_before !== undefined &&
      (reminder_days_before < 1 || reminder_days_before > 30)
    ) {
      return NextResponse.json({ error: 'Reminder days must be between 1 and 30' }, { status: 400 })
    }

    const { error } = await supabase.from('USER_SETTINGS').upsert(
      {
        user_id: user.id,
        email_reminders_enabled,
        reminder_days_before,
      },
      { onConflict: 'user_id' },
    )

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    void captureEvent(user.id, 'reminder_settings_updated', {
      email_reminders_enabled,
      reminder_days_before,
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 },
    )
  }
})
