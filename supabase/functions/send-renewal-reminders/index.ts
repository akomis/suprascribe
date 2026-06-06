import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'https://esm.sh/resend@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SubscriptionWithService {
  id: number
  price: number | null
  currency: string
  end_date: string
  subscription_service: {
    name: string | null
  } | null
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function sendReminderForUser(
  supabase: ReturnType<typeof createClient>,
  resend: InstanceType<typeof Resend>,
  userSettings: { user_id: string; reminder_days_before: number },
  today: Date,
): Promise<{ sent: boolean; error?: string }> {
  const { user_id, reminder_days_before } = userSettings
  const targetDate = new Date(today)
  targetDate.setDate(targetDate.getDate() + reminder_days_before)
  const targetDateStr = targetDate.toISOString().split('T')[0]

  const { data: subscriptions, error: subsError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select('id, price, currency, end_date, subscription_service:SUBSCRIPTION_SERVICES(name)')
    .eq('user_id', user_id)
    .eq('auto_renew', true)
    .eq('end_date', targetDateStr)

  if (subsError) return { sent: false, error: `User ${user_id}: ${subsError.message}` }
  if (!subscriptions?.length) return { sent: false }

  const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id)
  if (userError || !userData?.user?.email)
    return { sent: false, error: `User ${user_id}: Could not get email` }

  const subs = subscriptions as SubscriptionWithService[]
  const plural = (n: number, w: string) => `${n} ${w}${n > 1 ? 's' : ''}`
  const subject = `Renewal Reminder: ${plural(subs.length, 'subscription')} renewing in ${plural(reminder_days_before, 'day')}`

  try {
    await resend.emails.send({
      from: 'Suprascribe <reminders@suprascribe.com>',
      to: [userData.user.email],
      subject,
      html: buildReminderEmail(subs, reminder_days_before, targetDateStr),
      text: buildReminderEmailText(subs, reminder_days_before, targetDateStr),
    })
    return { sent: true }
  } catch (e: unknown) {
    return {
      sent: false,
      error: `User ${user_id}: Failed to send email - ${e instanceof Error ? e.message : 'Unknown error'}`,
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) return jsonResponse({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const resend = new Resend(Deno.env.get('RESEND_API_KEY')!)
    const today = new Date()

    const { data: usersWithReminders, error: usersError } = await supabase
      .from('USER_SETTINGS')
      .select('user_id, reminder_days_before, USER_TIERS!inner(tier)')
      .eq('email_reminders_enabled', true)
      .eq('USER_TIERS.tier', 'PRO')

    if (usersError) throw new Error(`Failed to fetch users: ${usersError.message}`)
    if (!usersWithReminders?.length)
      return jsonResponse({ message: 'No users with reminders enabled', sent: 0 })

    let emailsSent = 0
    const errors: string[] = []

    for (const userSettings of usersWithReminders) {
      const result = await sendReminderForUser(supabase, resend, userSettings, today)
      if (result.sent) emailsSent++
      if (result.error) errors.push(result.error)
    }

    return jsonResponse({
      message: 'Renewal reminders processed',
      sent: emailsSent,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function buildReminderEmail(
  subscriptions: SubscriptionWithService[],
  daysBefore: number,
  renewalDate: string,
): string {
  const formattedDate = new Date(renewalDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const subscriptionRows = subscriptions
    .map((sub) => {
      const serviceName = escapeHtml(sub.subscription_service?.name || 'Unknown Service')
      const price =
        sub.price !== null ? `${escapeHtml(sub.currency)} ${sub.price.toFixed(2)}` : 'N/A'
      return `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #eee;">${serviceName}</td>
          <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${price}</td>
        </tr>
      `
    })
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h1 style="color: #333; margin-bottom: 8px;">Renewal Reminder</h1>
        <p style="color: #666; margin-bottom: 24px;">
          The following subscription${subscriptions.length > 1 ? 's' : ''} will renew in <strong>${daysBefore} day${daysBefore > 1 ? 's' : ''}</strong> on ${formattedDate}:
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f9f9f9;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #eee;">Service</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #eee;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${subscriptionRows}
          </tbody>
        </table>

        <p style="color: #666; font-size: 14px;">
          Review or manage your subscriptions in your
          <a href="https://suprascribe.com/dashboard" style="color: #0066cc;">Suprascribe dashboard</a>.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">

        <p style="color: #999; font-size: 12px;">
          You're receiving this because you have renewal reminders enabled in your Suprascribe settings.
          <a href="https://suprascribe.com/dashboard" style="color: #999;">Manage preferences</a>
        </p>
      </div>
    </body>
    </html>
  `
}

function buildReminderEmailText(
  subscriptions: SubscriptionWithService[],
  daysBefore: number,
  renewalDate: string,
): string {
  const formattedDate = new Date(renewalDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const subscriptionList = subscriptions
    .map((sub) => {
      const serviceName = sub.subscription_service?.name || 'Unknown Service'
      const price = sub.price !== null ? `${sub.currency} ${sub.price.toFixed(2)}` : 'N/A'
      return `- ${serviceName}: ${price}`
    })
    .join('\n')

  return `
Renewal Reminder

The following subscription${subscriptions.length > 1 ? 's' : ''} will renew in ${daysBefore} day${daysBefore > 1 ? 's' : ''} on ${formattedDate}:

${subscriptionList}

Review or manage your subscriptions at: https://suprascribe.com/dashboard

---
You're receiving this because you have renewal reminders enabled in your Suprascribe settings.
  `.trim()
}
