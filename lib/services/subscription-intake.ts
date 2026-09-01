import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  SubscriptionServiceInsert,
  UserSubscriptionInsert,
  UserSubscriptionWithDetails,
} from '@/lib/types/database'
import { isDuplicateSubscription } from '@/lib/utils'

export type IntakeResult =
  | { ok: true; subscription: UserSubscriptionWithDetails }
  | { ok: false; error: string; status: number }

type ServiceResult = { serviceId: number } | { error: string; status: number }

// Generic billing/app-store hosts that are wrongly curated as service domains on some
// rows (e.g. a payment processor). Never derive an unsubscribe_url from these.
const NON_SERVICE_HOSTS = new Set([
  'stripe.com',
  'paddle.com',
  'apple.com',
  'apps.apple.com',
  'itunes.apple.com',
  'play.google.com',
  'market.android.com',
])

function hostnameFromUrl(url: string): string | undefined {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname
      .replace(/^www\./, '')
      .toLowerCase()
  } catch {
    return undefined
  }
}

// Derives an unsubscribe_url for a service from a curated sibling row sharing the same
// domain, so tier/variant rows ("Spotify Premium Individual") inherit the canonical cancel
// link. Returns undefined when the host is generic, unknown, or maps to more than one
// distinct unsubscribe_url (ambiguous - e.g. amazon.com → Amazon Prime vs AWS).
async function deriveUnsubscribeUrlByDomain(
  supabase: SupabaseClient,
  url: string | null | undefined,
): Promise<string | undefined> {
  if (!url) return undefined
  const host = hostnameFromUrl(url)
  if (!host || NON_SERVICE_HOSTS.has(host)) return undefined

  const { data, error } = await supabase
    .from('SUBSCRIPTION_SERVICES')
    .select('unsubscribe_url')
    .contains('domains', [host])
    .not('unsubscribe_url', 'is', null)

  if (error || !data || data.length === 0) return undefined

  const distinct = Array.from(
    new Set(data.map((r) => r.unsubscribe_url).filter((u): u is string => Boolean(u))),
  )
  return distinct.length === 1 ? distinct[0] : undefined
}

async function updateExistingService(
  supabase: SupabaseClient,
  existing: { id: number; url: string | null; unsubscribe_url: string | null },
  serviceData: SubscriptionServiceInsert,
): Promise<ServiceResult> {
  const updateData: Partial<SubscriptionServiceInsert> = {}
  if (!existing.url && serviceData.url) updateData.url = serviceData.url
  if (serviceData.unsubscribe_url) updateData.unsubscribe_url = serviceData.unsubscribe_url
  else if (!existing.unsubscribe_url) {
    const derived = await deriveUnsubscribeUrlByDomain(supabase, serviceData.url ?? existing.url)
    if (derived) updateData.unsubscribe_url = derived
  }

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
  const unsubscribeUrl =
    serviceData.unsubscribe_url ?? (await deriveUnsubscribeUrlByDomain(supabase, serviceData.url))

  const serviceToCreate = {
    name: serviceData.name,
    ...(serviceData.url && { url: serviceData.url }),
    ...(unsubscribeUrl && { unsubscribe_url: unsubscribeUrl }),
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
    .single<{ id: number; url: string | null; unsubscribe_url: string | null }>()

  if (findError && findError.code !== 'PGRST116')
    return { error: `Error finding service: ${findError.message}`, status: 500 }

  if (existing) return updateExistingService(supabase, existing, serviceData)
  return createNewService(supabase, serviceData)
}

function minDate(a: string | null, b: string): string {
  return a && a < b ? a : b
}

function maxDate(a: string | null, b: string): string {
  return a && a > b ? a : b
}

/**
 * Whether a discovered period belongs to a run the user already has.
 *
 * Requires the same billing cycle, so a monthly plan never absorbs a yearly one,
 * and a one-time payment (no period) never absorbs anything.
 */
export function overlapsExistingPeriod(
  incoming: { start_date: string; end_date: string; period: string | null },
  existing: { start_date: string | null; end_date: string | null; period: string | null },
): boolean {
  if (!existing.start_date || !existing.end_date) return false
  if (!incoming.period || incoming.period !== existing.period) return false

  return incoming.start_date <= existing.end_date && existing.start_date <= incoming.end_date
}

async function extendExistingPeriod(
  supabase: SupabaseClient,
  id: number,
  dates: { start_date: string; end_date: string },
): Promise<IntakeResult> {
  const { error } = await supabase.from('USER_SUBSCRIPTIONS').update(dates).eq('id', id)

  if (error) {
    return { ok: false, error: `Error extending subscription: ${error.message}`, status: 500 }
  }

  const { data: full, error: fetchError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select(
      `*, subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url)`,
    )
    .eq('id', id)
    .single()

  if (fetchError || !full) {
    return { ok: false, error: `Error fetching subscription: ${fetchError?.message}`, status: 500 }
  }

  return { ok: true, subscription: full as UserSubscriptionWithDetails }
}

export interface IntakeOptions {
  /**
   * Merge a new period into an overlapping one for the same service and cycle
   * instead of inserting a second row. Set for discovery imports, where the
   * same subscription is re-derived on every scan; left off for manual adds,
   * where two overlapping periods may well be deliberate.
   */
  extendOverlapping?: boolean
}

export async function intakeSubscription(
  supabase: SupabaseClient,
  serviceData: SubscriptionServiceInsert,
  subscriptionData: Omit<UserSubscriptionInsert, 'subscription_service_id'>,
  options: IntakeOptions = {},
): Promise<IntakeResult> {
  const serviceResult = await upsertService(supabase, serviceData)
  if ('error' in serviceResult) return { ok: false, ...serviceResult }

  const { serviceId } = serviceResult

  const { data: existing, error: checkError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select(
      `
      id, start_date, end_date, period,
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

    // A re-scan of the same inbox produces the same subscription with a slightly
    // later end date, because consolidation stretches the current run to cover
    // today. Exact-match duplicate detection misses that, so every re-scan used
    // to add another row for a subscription the user already had. Extending the
    // period the user owns is the honest outcome: same service, same cycle, one
    // continuous run.
    if (options.extendOverlapping) {
      const overlapping = existing.find((sub) =>
        overlapsExistingPeriod(
          {
            start_date: subscriptionData.start_date!,
            end_date: subscriptionData.end_date!,
            period: subscriptionData.period ?? null,
          },
          sub,
        ),
      )

      if (overlapping) {
        return extendExistingPeriod(supabase, overlapping.id, {
          start_date: minDate(overlapping.start_date, subscriptionData.start_date!),
          end_date: maxDate(overlapping.end_date, subscriptionData.end_date!),
        })
      }
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .insert({ ...subscriptionData, subscription_service_id: serviceId })
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
  userId?: string,
  oldServiceId?: number,
): Promise<IntakeResult> {
  const serviceResult = await upsertService(supabase, serviceData)
  if ('error' in serviceResult) return { ok: false, ...serviceResult }

  const { serviceId } = serviceResult

  // Service changed: repoint ALL of this user's billing periods from old service to new
  if (userId && oldServiceId && oldServiceId !== serviceId) {
    const { error: bulkError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .update({ subscription_service_id: serviceId })
      .eq('user_id', userId)
      .eq('subscription_service_id', oldServiceId)
    if (bulkError) {
      return {
        ok: false,
        error: `Error updating service for all periods: ${bulkError.message}`,
        status: 500,
      }
    }
  }

  const { error: updateError } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .update({ ...subscriptionData, subscription_service_id: serviceId })
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
