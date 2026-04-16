import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { hasFeatureAccess } from '@/lib/config/features'
import { NextRequest, NextResponse } from 'next/server'

export interface ReminderSettings {
  email_reminders_enabled: boolean
  reminder_days_before: number
}

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
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: settings } = await supabase
      .from('USER_SETTINGS')
      .select('tier')
      .eq('user_id', user.id)
      .maybeSingle()

    const userTier = settings?.tier || 'BASIC'
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

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'reminder_settings_updated',
      properties: {
        email_reminders_enabled,
        reminder_days_before,
      },
    })
    await posthog.shutdown()

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
  }
}
