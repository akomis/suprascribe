import { withAuth } from '@/lib/api/withAuth'
import { captureEvent } from '@/lib/posthog-server'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'
import type { CreateSubscriptionFormData } from '@/lib/types/forms'
import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import type { ApiResponse } from '@/lib/types/api'
import { transformFormToDatabaseInserts } from '@/lib/utils'
import { mergeSubscriptionsByService, getMostRecent } from '@/lib/utils/subscription-aggregation'
import {
  calculateServiceSpentThisYear,
  calculateServiceForecastThisYear,
} from '@/lib/utils/subscription-analytics'
import { intakeSubscription } from '@/lib/services/subscription-intake'
import { NextResponse } from 'next/server'

export const GET = withAuth(
  async (
    _req,
    { user, supabase },
  ): Promise<NextResponse<ApiResponse<MergedSubscriptionResponse[]>>> => {
    try {
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

      const mergedMap = mergeSubscriptionsByService(data || [], 'average')
      const today = new Date()

      const mergedSubscriptions: MergedSubscriptionResponse[] = Array.from(mergedMap.values()).map(
        ({ subscriptions: subs, merged }) => {
          const mostRecent = getMostRecent(subs)
          const autoRenew = Boolean(mostRecent.auto_renew)
          const monthlyPrice = mostRecent.price || 0

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
            spentThisYear: calculateServiceSpentThisYear(subs, monthlyPrice, today),
            forecastThisYear: calculateServiceForecastThisYear(
              subs,
              monthlyPrice,
              autoRenew,
              today,
            ),
            totalSpent: subs.reduce((sum, s) => sum + (s.price || 0), 0),
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
  },
)

export const POST = withAuth(
  async (
    request,
    { user, supabase },
  ): Promise<NextResponse<ApiResponse<UserSubscriptionWithDetails>>> => {
    try {
      const body: CreateSubscriptionFormData = await request.json()

      if (!body.serviceName?.trim()) {
        return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
      }
      if (!body.startDate?.trim()) {
        return NextResponse.json({ error: 'Start date is required' }, { status: 400 })
      }
      if (!body.endDate?.trim()) {
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
        return NextResponse.json(
          {
            error:
              transformError instanceof Error
                ? transformError.message
                : 'Invalid subscription data',
          },
          { status: 400 },
        )
      }

      const result = await intakeSubscription(supabase, serviceData, subscriptionData)

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status })
      }

      void captureEvent(user.id, 'subscription_created', {
        service_name: serviceData.name,
        price: result.subscription.price,
        currency: subscriptionData.currency,
        auto_renew: subscriptionData.auto_renew,
      })

      return NextResponse.json({ data: result.subscription }, { status: 201 })
    } catch (error) {
      console.error('[POST /subscriptions] Unexpected error:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 },
      )
    }
  },
)
