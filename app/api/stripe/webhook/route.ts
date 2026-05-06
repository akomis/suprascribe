import { STRIPE_API_VERSION } from '@/lib/config/stripe'
import { captureEvent } from '@/lib/posthog-server'
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

      // Prefer client_reference_id (Supabase user ID passed from UpgradeButton) for a direct,
      // reliable lookup. Then check USER_TIERS.pending_upgrade_email. Fall back to email scan as last resort.
      let userId: string | undefined
      const clientRefId = session.client_reference_id
      const customerEmail = session.customer_email || session.customer_details?.email

      console.log(`[Webhook Debug] Session ${session.id}:`, {
        client_reference_id: clientRefId,
        customer_email: customerEmail,
        payment_status: session.payment_status,
        payment_intent: session.payment_intent,
      })

      if (clientRefId) {
        userId = clientRefId
        console.log(`[Webhook Debug] Using client_reference_id: ${userId}`)
      } else if (customerEmail) {
        const normalizedEmail = customerEmail.toLowerCase().trim()

        // First: Check USER_TIERS.pending_upgrade_email (set by UpgradeButton before redirect)
        console.log(
          `[Webhook Debug] Checking USER_TIERS.pending_upgrade_email for: ${normalizedEmail}`,
        )
        const { data: pendingTier } = await supabaseAdmin
          .from('USER_TIERS')
          .select('user_id')
          .eq('pending_upgrade_email', normalizedEmail)
          .maybeSingle()

        if (pendingTier?.user_id) {
          userId = pendingTier.user_id
          console.log(`[Webhook Debug] Found user ${userId} in USER_TIERS.pending_upgrade_email`)
        } else {
          // Second: Fall back to scanning auth users
          console.log(`[Webhook Debug] Falling back to auth user lookup`)
          let page = 1
          let totalUsersChecked = 0

          while (!userId) {
            const { data: authData, error: userError } = await supabaseAdmin.auth.admin.listUsers({
              page,
              perPage: 100,
            })

            if (userError) {
              console.error('[Webhook Debug] Failed to list users:', userError)
              return NextResponse.json(
                { success: false, error: 'Failed to lookup user' },
                { status: 500 },
              )
            }

            if (authData.users.length === 0) break

            totalUsersChecked += authData.users.length
            const matchedUser = authData.users.find((u) => {
              const userEmail = u.email?.toLowerCase().trim()
              return userEmail === normalizedEmail
            })

            if (matchedUser) {
              userId = matchedUser.id
              console.log(`[Webhook Debug] Found user ${userId} in auth on page ${page}`)
            }

            page++
          }

          console.log(`[Webhook Debug] Checked ${totalUsersChecked} auth users`)
        }
      }

      if (!userId) {
        console.warn(`[Webhook Debug] No user found for session:`, {
          session_id: session.id,
          customer_email: customerEmail,
        })
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      const { error } = await supabaseAdmin.from('USER_TIERS').upsert(
        {
          user_id: userId,
          tier: 'PRO',
          date_upgraded: new Date().toISOString(),
          stripe_payment_intent_id: (session.payment_intent as string) ?? null,
          pending_upgrade_email: null, // Clear after successful upgrade
        },
        { onConflict: 'user_id' },
      )

      if (error) {
        console.error('Failed to update tier:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
      }

      await captureEvent(userId, 'pro_upgrade_completed', {
        stripe_session_id: session.id,
        amount_total: session.amount_total,
        currency: session.currency,
      })

      console.log(`✅ User ${userId} upgraded to PRO via session ${session.id}`)
      return NextResponse.json({ success: true })
    }

    if (event.type === 'charge.failed') {
      const charge = event.data.object
      console.warn('Payment failed for charge:', charge.id)
      await captureEvent(charge.customer?.toString() || charge.id, 'charge_failed', {
        charge_id: charge.id,
        amount: charge.amount,
        currency: charge.currency,
        failure_code: charge.failure_code,
        failure_message: charge.failure_message,
      })
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
