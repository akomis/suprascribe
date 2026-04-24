import { STRIPE_API_VERSION } from '@/lib/config/stripe'
import { getPostHogClient } from '@/lib/posthog-server'
import { createClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: STRIPE_API_VERSION,
    })
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )

      // Insert the event record first - if it already exists (unique constraint), this will
      // return an error and we skip processing. This is atomic and fixes both the race
      // condition and the "event recorded after upgrade" ordering issue.
      const { error: eventError } = await supabaseAdmin.from('stripe_webhook_events').insert({
        event_id: event.id,
        event_type: event.type,
      })

      if (eventError) {
        // Unique constraint violation means already processed
        if (eventError.code === '23505') {
          console.log(`✅ Event ${event.id} already processed, skipping`)
          return NextResponse.json({ success: true, message: 'Event already processed' })
        }
        console.error('Failed to record webhook event:', eventError)
        return NextResponse.json({ success: false, error: eventError.message }, { status: 500 })
      }

      // Prefer client_reference_id (Supabase user ID passed from UpgradeButton) for a direct,
      // reliable lookup. Fall back to email scan for sessions created before this change.
      let userId: string | undefined
      const clientRefId = session.client_reference_id

      if (clientRefId) {
        userId = clientRefId
      } else {
        const customerEmail = session.customer_email || session.customer_details?.email
        if (!customerEmail) {
          console.warn('No customer email or client_reference_id in session:', session.id)
          return NextResponse.json(
            { success: false, error: 'Cannot identify user from session' },
            { status: 400 },
          )
        }

        let page = 1
        while (!userId) {
          const { data: authData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 100,
          })

          if (userError) {
            console.error('Failed to list users:', userError)
            return NextResponse.json(
              { success: false, error: 'Failed to lookup user' },
              { status: 500 },
            )
          }

          if (authData.users.length === 0) break
          userId = authData.users.find((u) => u.email === customerEmail)?.id
          page++
        }

        if (!userId) {
          console.warn('No user found for session:', session.id)
          return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }
      }

      const { error } = await supabaseAdmin
        .from('USER_SETTINGS')
        .update({ tier: 'PRO' })
        .eq('user_id', userId)

      if (error) {
        console.error('Failed to update tier:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      const posthogUpgrade = getPostHogClient()
      posthogUpgrade.capture({
        distinctId: userId,
        event: 'pro_upgrade_completed',
        properties: {
          stripe_session_id: session.id,
          amount_total: session.amount_total,
          currency: session.currency,
        },
      })
      await posthogUpgrade.shutdown()

      console.log(`✅ User ${userId} upgraded to PRO via session ${session.id}`)
      return NextResponse.json({ success: true })
    }

    if (event.type === 'charge.failed') {
      const charge = event.data.object
      console.warn('Payment failed for charge:', charge.id)
      const posthogCharge = getPostHogClient()
      posthogCharge.capture({
        distinctId: charge.customer?.toString() || charge.id,
        event: 'charge_failed',
        properties: {
          charge_id: charge.id,
          amount: charge.amount,
          currency: charge.currency,
          failure_code: charge.failure_code,
          failure_message: charge.failure_message,
        },
      })
      await posthogCharge.shutdown()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err)
    return NextResponse.json(
      { error: err?.message || 'Webhook processing failed' },
      { status: 500 },
    )
  }
}
