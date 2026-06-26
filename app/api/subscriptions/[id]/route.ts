import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { captureEvent } from '@/lib/posthog-server'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { transformFormToDatabaseInserts } from '@/lib/utils'
import { updateSubscription } from '@/lib/services/subscription-intake'
import type { createClient } from '@/lib/supabase/server'

type Params = { params: Promise<{ id: string }> }
type SupabaseClient = Awaited<ReturnType<typeof createClient>>

function parseSubscriptionId(rawId: string): number | null {
  const n = parseInt(rawId, 10)
  return isNaN(n) ? null : n
}

async function fetchOwnedSubscription(
  supabase: SupabaseClient,
  subscriptionId: number,
  userId: string,
): Promise<NextResponse | { id: number; user_id: string; subscription_service_id: number | null }> {
  const { data, error } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select('id, user_id, subscription_service_id')
    .eq('id', subscriptionId)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
  if (data.user_id !== userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  return data
}

export const PUT = withAuth<Params>(async (request, { user, supabase, params }) => {
  try {
    const { id } = await params
    const subscriptionId = parseSubscriptionId(id)
    if (subscriptionId === null)
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })

    const body: CreateSubscriptionFormData = await request.json()

    const owned = await fetchOwnedSubscription(supabase, subscriptionId, user.id)
    if (owned instanceof NextResponse) return owned

    const { service: serviceData, subscription: subscriptionData } = transformFormToDatabaseInserts(
      body,
      user.id,
    )

    const result = await updateSubscription(
      supabase,
      subscriptionId,
      serviceData,
      subscriptionData,
      user.id,
      owned.subscription_service_id ?? undefined,
    )

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status })
    }

    void captureEvent(user.id, 'subscription_updated', {
      subscription_id: subscriptionId,
      price: result.subscription.price,
    })

    return NextResponse.json({ data: result.subscription }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
})

export const PATCH = withAuth<Params>(async (request, { user, supabase, params }) => {
  try {
    const { id } = await params
    const subscriptionId = parseSubscriptionId(id)
    if (subscriptionId === null)
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })

    const body = await request.json()

    const owned = await fetchOwnedSubscription(supabase, subscriptionId, user.id)
    if (owned instanceof NextResponse) return owned

    const updateData: { auto_renew?: boolean; end_date?: string } = {}

    if (typeof body.auto_renew === 'boolean') {
      updateData.auto_renew = body.auto_renew
    }

    if (typeof body.end_date === 'string') {
      if (isNaN(new Date(body.end_date).getTime())) {
        return NextResponse.json({ error: 'Invalid end_date' }, { status: 400 })
      }
      updateData.end_date = body.end_date
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
    }

    const { data: updatedSubscription, error: updateError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .update(updateData)
      .eq('id', subscriptionId)
      .select(
        `
        *,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url)
        `,
      )
      .single()

    if (updateError) {
      return NextResponse.json(
        { error: `Error updating subscription: ${updateError.message}` },
        { status: 500 },
      )
    }

    if (typeof updateData.auto_renew === 'boolean') {
      void captureEvent(user.id, 'subscription_auto_renew_toggled', {
        subscription_id: subscriptionId,
        auto_renew: updateData.auto_renew,
      })
    }

    return NextResponse.json({ data: updatedSubscription }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
})

export const DELETE = withAuth<Params>(async (_request, { user, supabase, params }) => {
  try {
    const { id } = await params
    const subscriptionId = parseSubscriptionId(id)
    if (subscriptionId === null)
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })

    const owned = await fetchOwnedSubscription(supabase, subscriptionId, user.id)
    if (owned instanceof NextResponse) return owned

    const { error: deleteSubError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .delete()
      .eq('id', subscriptionId)

    if (deleteSubError) {
      return NextResponse.json(
        { error: `Error deleting subscription: ${deleteSubError.message}` },
        { status: 500 },
      )
    }

    void captureEvent(user.id, 'subscription_deleted', { subscription_id: subscriptionId })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
})
