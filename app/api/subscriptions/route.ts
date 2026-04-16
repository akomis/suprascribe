import { createClient } from '@/lib/supabase/server'
import { getPostHogClient } from '@/lib/posthog-server'
import { UserSubscriptionInsert, UserSubscriptionWithDetails } from '@/lib/types/database'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import {
  isDuplicateSubscription,
  mergeSubscriptionsByService,
  normalizeToMonthlyPrice,
  transformFormToDatabaseInserts,
} from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

export interface MergedSubscriptionResponse {
  name: string
  serviceUrl?: string
  price: number
  currency: string
  startDate: string
  endDate: string
  autoRenew: boolean
  active: boolean
  category?: string | null
  paymentMethod?: string | null
  subscriptions: UserSubscriptionWithDetails[]
  spentThisYear: number
  forecastThisYear: number
  totalSpent: number
}

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select(
        `
        *,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url, category)
        `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mergedMap = mergeSubscriptionsByService(data || [], false)

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const jan1st = new Date(today.getFullYear(), 0, 1)
    const dec31st = new Date(today.getFullYear(), 11, 31)

    const mergedSubscriptions: MergedSubscriptionResponse[] = Array.from(mergedMap.values()).map(
      ({ subscriptions: subs, merged }) => {
        const sortedByEndDate = [...subs].sort(
          (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
        )
        const mostRecent = sortedByEndDate[0]
        const autoRenew = Boolean(mostRecent.auto_renew)
        const monthlyPrice = mostRecent.price || 0

        const recordsThisYear = subs.filter((s) => {
          if (!s.start_date) return false
          const d = new Date(s.start_date)
          return d >= jan1st && d <= today
        })
        let spentThisYear: number
        if (recordsThisYear.length > 0) {
          spentThisYear = recordsThisYear.reduce((sum, s) => sum + (s.price || 0), 0)
        } else {
          const activeRecord = subs.find((s) => {
            if (!s.start_date || !s.end_date) return false
            const start = new Date(s.start_date)
            const end = new Date(s.end_date)
            return start <= today && end >= jan1st
          })
          if (activeRecord) {
            const effectiveStart =
              new Date(activeRecord.start_date!) < jan1st
                ? jan1st
                : new Date(activeRecord.start_date!)
            const monthsElapsed =
              (today.getFullYear() - effectiveStart.getFullYear()) * 12 +
              (today.getMonth() - effectiveStart.getMonth()) +
              1
            spentThisYear = monthlyPrice * Math.max(0, monthsElapsed)
          } else {
            spentThisYear = 0
          }
        }

        let forecastThisYear: number
        if (!autoRenew) {
          forecastThisYear = spentThisYear
        } else {
          const earliestStart = subs.reduce<Date | null>((earliest, s) => {
            if (!s.start_date) return earliest
            const d = new Date(s.start_date)
            return earliest === null || d < earliest ? d : earliest
          }, null)
          if (!earliestStart) {
            forecastThisYear = 0
          } else {
            const effectiveStart = earliestStart < jan1st ? jan1st : earliestStart
            const monthsInYear =
              (dec31st.getFullYear() - effectiveStart.getFullYear()) * 12 +
              (dec31st.getMonth() - effectiveStart.getMonth()) +
              1
            forecastThisYear = monthlyPrice * Math.max(0, monthsInYear)
          }
        }

        const totalSpent = subs.reduce((sum, s) => sum + (s.price || 0), 0)

        return {
          name: mostRecent.subscription_service?.name || 'Unknown Service',
          serviceUrl: mostRecent.subscription_service?.url || undefined,
          price: monthlyPrice,
          currency: mostRecent.currency,
          startDate: merged.startDate,
          endDate: merged.endDate,
          autoRenew,
          active: merged.active,
          category: mostRecent.subscription_service?.category || null,
          paymentMethod: mostRecent.payment_method || null,
          subscriptions: subs,
          spentThisYear,
          forecastThisYear,
          totalSpent,
        }
      },
    )

    return NextResponse.json({ data: mergedSubscriptions })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const body: CreateSubscriptionFormData = await request.json()

    if (!body.serviceName || !body.serviceName.trim()) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
    }

    if (!body.startDate || !body.startDate.trim()) {
      return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
    }

    if (!body.endDate || !body.endDate.trim()) {
      return NextResponse.json({ error: 'End date is required' }, { status: 400 })
    }

    if (body.price === undefined || body.price === null) {
      return NextResponse.json({ error: 'Price is required' }, { status: 400 })
    }

    let serviceData, subscriptionData
    try {
      const result = transformFormToDatabaseInserts(body, user.id)
      serviceData = result.service
      subscriptionData = result.subscription
    } catch (transformError) {
      console.error('[POST /subscriptions] Transform error:', transformError)
      return NextResponse.json(
        {
          error:
            transformError instanceof Error ? transformError.message : 'Invalid subscription data',
        },
        { status: 400 },
      )
    }

    let serviceId: number

    const { data: existingService, error: findError } = await supabase
      .from('SUBSCRIPTION_SERVICES')
      .select('id, url, unsubscribe_url, name')
      .ilike('name', serviceData.name!)
      .single()

    if (findError && findError.code !== 'PGRST116') {
      return NextResponse.json(
        { error: `Error finding service: ${findError.message}` },
        { status: 500 },
      )
    }

    if (existingService) {
      serviceId = existingService.id

      const updateData: any = {}
      if (!existingService.url && serviceData.url) {
        updateData.url = serviceData.url
      }
      if (serviceData.unsubscribe_url) {
        updateData.unsubscribe_url = serviceData.unsubscribe_url
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from('SUBSCRIPTION_SERVICES')
          .update(updateData)
          .eq('id', serviceId)

        if (updateError) {
          return NextResponse.json(
            { error: `Error updating service: ${updateError.message}` },
            { status: 500 },
          )
        }
      }
    } else {
      const serviceToCreate = {
        name: serviceData.name,
        ...(serviceData.url && { url: serviceData.url }),
        ...(serviceData.unsubscribe_url && { unsubscribe_url: serviceData.unsubscribe_url }),
        ...(serviceData.category && { category: serviceData.category }),
      }

      const { data: newService, error: createServiceError } = await supabase
        .from('SUBSCRIPTION_SERVICES')
        .insert(serviceToCreate)
        .select('id')
        .single()

      if (createServiceError) {
        if (createServiceError.code === '23505') {
          const { data: retryService, error: retryError } = await supabase
            .from('SUBSCRIPTION_SERVICES')
            .select('id')
            .ilike('name', serviceData.name!)
            .single()

          if (retryError || !retryService) {
            return NextResponse.json(
              { error: `Error fetching existing service after duplicate: ${retryError?.message}` },
              { status: 500 },
            )
          }

          serviceId = retryService.id
        } else {
          return NextResponse.json(
            { error: `Error creating service: ${createServiceError.message}` },
            { status: 500 },
          )
        }
      } else {
        serviceId = newService.id
      }
    }

    const { data: existingSubscriptions, error: checkUserSubError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select(
        `
        id, start_date, end_date,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name)
        `,
      )
      .eq('user_id', user.id)
      .eq('subscription_service_id', serviceId)

    if (checkUserSubError) {
      return NextResponse.json(
        { error: `Error checking existing subscription: ${checkUserSubError.message}` },
        { status: 500 },
      )
    }

    if (existingSubscriptions && existingSubscriptions.length > 0) {
      for (const existing of existingSubscriptions) {
        const existingData = existing as any
        const isDuplicate = isDuplicateSubscription(
          {
            service_name: serviceData.name!,
            start_date: subscriptionData.start_date!,
            end_date: subscriptionData.end_date!,
          },
          {
            subscription_service: existingData.subscription_service
              ? { name: (existingData.subscription_service as any).name }
              : null,
            start_date: existing.start_date,
            end_date: existing.end_date,
          },
        )

        if (isDuplicate) {
          return NextResponse.json(
            {
              error: `This subscription already exists (${existing.start_date} to ${existing.end_date})`,
            },
            { status: 400 },
          )
        }
      }
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

    const { data: userSubscription, error: createUserSubError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .insert(userSubscriptionData)
      .select('id')
      .single()

    if (createUserSubError) {
      return NextResponse.json(
        { error: `Error creating user subscription: ${createUserSubError.message}` },
        { status: 500 },
      )
    }

    const { data: completeSubscription, error: fetchError } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select(
        `
        *,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, unsubscribe_url)
        `,
      )
      .eq('id', userSubscription.id)
      .single()

    if (fetchError) {
      return NextResponse.json(
        { error: `Error fetching complete subscription: ${fetchError.message}` },
        { status: 500 },
      )
    }

    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'subscription_created',
      properties: {
        service_name: serviceData.name,
        price: monthlyPrice,
        currency: subscriptionData.currency,
        auto_renew: subscriptionData.auto_renew,
      },
    })
    await posthog.shutdown()

    return NextResponse.json({ data: completeSubscription }, { status: 201 })
  } catch (error) {
    console.error('[POST /subscriptions] Unexpected error:', error)
    if (error instanceof Error) {
      console.error('[POST /subscriptions] Error stack:', error.stack)
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
