import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  SubscriptionServiceInsert,
  UserSubscriptionInsert,
  UserSubscriptionWithDetails,
} from '@/lib/types/database'
import { isDuplicateSubscription, normalizeToMonthlyPrice } from '@/lib/utils'

export type IntakeResult =
  | { ok: true; subscription: UserSubscriptionWithDetails }
  | { ok: false; error: string; status: number }

type ServiceResult = { serviceId: number } | { error: string; status: number }

async function updateExistingService(
  supabase: SupabaseClient,
  existing: { id: number; url: string | null },
  serviceData: SubscriptionServiceInsert,
): Promise<ServiceResult> {
  const updateData: Partial<SubscriptionServiceInsert> = {}
  if (!existing.url && serviceData.url) updateData.url = serviceData.url
  if (serviceData.unsubscribe_url) updateData.unsubscribe_url = serviceData.unsubscribe_url

  if (Object.keys(updateData).length > 0) {
    const { error } = await supabase
      .from('SUBSCRIPTION_SERVICES')
      .update(updateData)
      .eq('id', existing.id)
    if (error) return { error: `Error updating service: ${error.message}`, status: 500 }
  }
  return { serviceId: existing.id }
}

async function createNewService(
  supabase: SupabaseClient,
  serviceData: SubscriptionServiceInsert,
): Promise<ServiceResult> {
  const serviceToCreate = {
    name: serviceData.name,
    ...(serviceData.url && { url: serviceData.url }),
    ...(serviceData.unsubscribe_url && { unsubscribe_url: serviceData.unsubscribe_url }),
    ...(serviceData.category && { category: serviceData.category }),
  }

  const { data: created, error: createError } = await supabase
    .from('SUBSCRIPTION_SERVICES')
    .insert(serviceToCreate)
    .select('id')
    .single()

  if (!createError) return { serviceId: created.id }
  if (createError.code !== '23505')
    return { error: `Error creating service: ${createError.message}`, status: 500 }

  // Race condition: another request created the same service concurrently
  const { data: retried, error: retryError } = await supabase
    .from('SUBSCRIPTION_SERVICES')
    .select('id')
    .ilike('name', serviceData.name!)
    .single()

  if (retryError || !retried)
    return { error: `Error resolving service after conflict: ${retryError?.message}`, status: 500 }

  return { serviceId: retried.id }
}

async function upsertService(
  supabase: SupabaseClient,
  serviceData: SubscriptionServiceInsert,
): Promise<ServiceResult> {
  const { data: existing, error: findError } = await supabase
    .from('SUBSCRIPTION_SERVICES')
    .select('id, url, unsubscribe_url')
    .ilike('name', serviceData.name!)
    .single()

  if (findError && findError.code !== 'PGRST116')
    return { error: `Error finding service: ${findError.message}`, status: 500 }

  if (existing) return updateExistingService(supabase, existing, serviceData)
  return createNewService(supabase, serviceData)
}

export async function intakeSubscription(
  supabase: SupabaseClient,
  serviceData: SubscriptionServiceInsert,
  subscriptionData: Omit<UserSubscriptionInsert, 'subscription_service_id'>,
): Promise<IntakeResult> {
  const serviceResult = await upsertService(supabase, serviceData)
  if ('error' in serviceResult) return { ok: false, ...serviceResult }

  const { serviceId } = serviceResult

  const { data: existing, error: checkError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select(
      `
      id, start_date, end_date,
      subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name)
      `,
    )
    .eq('user_id', subscriptionData.user_id)
    .eq('subscription_service_id', serviceId)

  if (checkError) {
    return {
      ok: false,
      error: `Error checking existing subscription: ${checkError.message}`,
      status: 500,
    }
  }

  if (existing && existing.length > 0) {
    for (const sub of existing) {
      const subAny = sub as typeof sub & { subscription_service: { name: string } | null }
      if (
        isDuplicateSubscription(
          {
            service_name: serviceData.name!,
            start_date: subscriptionData.start_date!,
            end_date: subscriptionData.end_date!,
          },
          {
            subscription_service: subAny.subscription_service
              ? { name: subAny.subscription_service.name }
              : null,
            start_date: sub.start_date,
            end_date: sub.end_date,
          },
        )
      ) {
        return {
          ok: false,
          error: `This subscription already exists (${sub.start_date} to ${sub.end_date})`,
          status: 400,
        }
      }
    }
  }

  const monthlyPrice = normalizeToMonthlyPrice(
    subscriptionData.price ?? 0,
    subscriptionData.start_date!,
    subscriptionData.end_date!,
  )

  const { data: inserted, error: insertError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .insert({ ...subscriptionData, price: monthlyPrice, subscription_service_id: serviceId })
    .select('id')
    .single()

  if (insertError) {
    return { ok: false, error: `Error creating subscription: ${insertError.message}`, status: 500 }
  }

  const { data: full, error: fetchError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select(
      `*, subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url)`,
    )
    .eq('id', inserted.id)
    .single()

  if (fetchError || !full) {
    return { ok: false, error: `Error fetching subscription: ${fetchError?.message}`, status: 500 }
  }

  return { ok: true, subscription: full as UserSubscriptionWithDetails }
}

export async function updateSubscription(
  supabase: SupabaseClient,
  subscriptionId: number,
  serviceData: SubscriptionServiceInsert,
  subscriptionData: Omit<UserSubscriptionInsert, 'subscription_service_id'>,
): Promise<IntakeResult> {
  const serviceResult = await upsertService(supabase, serviceData)
  if ('error' in serviceResult) return { ok: false, ...serviceResult }

  const { serviceId } = serviceResult

  const monthlyPrice = normalizeToMonthlyPrice(
    subscriptionData.price ?? 0,
    subscriptionData.start_date!,
    subscriptionData.end_date!,
  )

  const { error: updateError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .update({ ...subscriptionData, price: monthlyPrice, subscription_service_id: serviceId })
    .eq('id', subscriptionId)

  if (updateError) {
    return { ok: false, error: `Error updating subscription: ${updateError.message}`, status: 500 }
  }

  const { data: full, error: fetchError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select(
      `*, subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url)`,
    )
    .eq('id', subscriptionId)
    .single()

  if (fetchError || !full) {
    return { ok: false, error: `Error fetching subscription: ${fetchError?.message}`, status: 500 }
  }

  return { ok: true, subscription: full as UserSubscriptionWithDetails }
}
