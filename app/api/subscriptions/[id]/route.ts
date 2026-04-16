import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { UserSubscriptionInsert } from '@/lib/types/database'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { transformFormToDatabaseInserts, normalizeToMonthlyPrice } from '@/lib/utils'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const subscriptionId = parseInt(id, 10)

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })
    }

    const body: CreateSubscriptionFormData = await request.json()

    const { data: existingSubscription, error: fetchError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select('id, user_id, subscription_service_id')
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (existingSubscription.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { service: serviceData, subscription: subscriptionData } = transformFormToDatabaseInserts(
      body,
      user.id,
    )

    let serviceId: number

    const { data: existingService, error: findError } = await supabase
      .from('SUBSCRIPTION_SERVICES')
      .select('id')
      .eq('name', serviceData.name)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: `Error finding service: ${findError.message}` },
        { status: 500 },
      )
    }

    if (existingService) {
      serviceId = existingService.id
    } else {
      const { data: newService, error: createServiceError } = await supabase
        .from('SUBSCRIPTION_SERVICES')
        .insert(serviceData)
        .select('id')
        .single()

      if (createServiceError) {
        return NextResponse.json(
          { error: `Error creating service: ${createServiceError.message}` },
          { status: 500 },
        )
      }

      serviceId = newService.id
    }

    const monthlyPrice = normalizeToMonthlyPrice(
      subscriptionData.price ?? 0,
      subscriptionData.start_date!,
      subscriptionData.end_date!,
    )

    const userSubscriptionData: UserSubscriptionInsert = {
      ...subscriptionData,
      price: monthlyPrice,
      subscription_service_id: serviceId,
    }

    const { error: updateError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .update(userSubscriptionData)
      .eq('id', subscriptionId)

    if (updateError) {
      return NextResponse.json(
        { error: `Error updating subscription: ${updateError.message}` },
        { status: 500 },
      )
    }

    const { data: completeSubscription, error: fetchCompleteError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select(
        `
        *,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url)
        `,
      )
      .eq('id', subscriptionId)
      .single()

    if (fetchCompleteError) {
      return NextResponse.json(
        { error: `Error fetching new subscription: ${fetchCompleteError.message}` },
        { status: 500 },
      )
    }

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'subscription_updated',
      properties: {
        subscription_id: subscriptionId,
        price: monthlyPrice,
      },
    })
    await posthog.shutdown()

    return NextResponse.json({ data: completeSubscription }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const subscriptionId = parseInt(id, 10)

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })
    }

    const body = await request.json()

    const { data: existingSubscription, error: fetchError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select('id, user_id')
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !existingSubscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (existingSubscription.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const updateData: { auto_renew?: boolean } = {}

    if (typeof body.auto_renew === 'boolean') {
      updateData.auto_renew = body.auto_renew
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

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'subscription_auto_renew_toggled',
      properties: {
        subscription_id: subscriptionId,
        auto_renew: updateData.auto_renew,
      },
    })
    await posthog.shutdown()

    return NextResponse.json({ data: updatedSubscription }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const subscriptionId = parseInt(id, 10)

    if (isNaN(subscriptionId)) {
      return NextResponse.json({ error: 'Invalid subscription ID' }, { status: 400 })
    }

    const { data: subscription, error: fetchError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select('id, user_id')
      .eq('id', subscriptionId)
      .single()

    if (fetchError || !subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (subscription.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

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

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'subscription_deleted',
      properties: { subscription_id: subscriptionId },
    })
    await posthog.shutdown()

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
