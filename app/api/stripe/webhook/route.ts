import { createClient } from '@supabase/supabase-js'
import { getPostHogClient } from '@/lib/posthog-server'
import { NextResponse, type NextRequest } from 'next/server'
import Stripe from 'stripe'
import { STRIPE_API_VERSION } from '@/lib/config/stripe'

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

      const { data: existingEvent } = await supabaseAdmin
        .from('stripe_webhook_events')
        .select('event_id')
        .eq('event_id', event.id)
        .single()

      if (existingEvent) {
        console.log(`✅ Event ${event.id} already processed, skipping`)
        return NextResponse.json({ success: true, message: 'Event already processed' })
      }

      const customerEmail = session.customer_email || session.customer_details?.email
      if (!customerEmail) {
        console.warn('No customer email in session:', session.id)
        return NextResponse.json({ success: false, error: 'No customer email' }, { status: 400 })
      }

      let user: { id: string; email?: string } | undefined
      let page = 1
      while (!user) {
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
        user = authData.users.find((u) => u.email === customerEmail)
        page++
      }

      if (!user) {
        console.warn('No user found for session:', session.id)
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const { error } = await supabaseAdmin
        .from('USER_SETTINGS')
        .update({ tier: 'PRO' })
        .eq('user_id', user.id)

      if (error) {
        console.error('Failed to update tier:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      const { error: eventError } = await supabaseAdmin.from('stripe_webhook_events').insert({
        event_id: event.id,
        event_type: event.type,
      })

      if (eventError) {
        console.error('Failed to record webhook event:', eventError)
      }

      console.log(`✅ User ${user.id} upgraded to PRO via session ${session.id}`)

      const posthog = getPostHogClient()
      posthog.capture({
        distinctId: user.id,
        event: 'pro_upgrade_completed',
        properties: {
          stripe_session_id: session.id,
          customer_email: customerEmail,
        },
      })
      await posthog.shutdown()

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
