import { withAuth } from '@/lib/api/withAuth'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import type { ApiResponse } from '@/lib/types/api'
import type {
  GroupByOption,
  InsightData,
  InsightMode,
  InsightTab,
  Subscription,
} from '@/lib/types/subscriptions'
import { buildInsights } from '@/lib/utils/subscription-analytics'
import { mergeSubscriptionsByService, getMostRecent } from '@/lib/utils/subscription-aggregation'
import { convertCurrency } from '@/lib/utils/currency'
import { toMonthlyCost } from '@/lib/utils'
import { NextResponse } from 'next/server'

export const GET = withAuth(
  async (request, { user, supabase }): Promise<NextResponse<ApiResponse<InsightData>>> => {
    try {
      const { searchParams } = new URL(request.url)
      const targetCurrency = (searchParams.get('currency') || 'USD') as CurrencyCode
      const groupBy = (searchParams.get('groupBy') || 'service') as GroupByOption
      const mode = (searchParams.get('mode') || 'forecast') as InsightMode
      const tab = (searchParams.get('tab') || 'active') as InsightTab
      const yearParam = searchParams.get('year')
      const year = yearParam ? parseInt(yearParam, 10) : undefined

      const { data, error } = await supabase
        .from('USER_SUBSCRIPTIONS')
        .select(
          `
        *,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, category)
        `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const mergedMap = mergeSubscriptionsByService(data || [], 'sum')

      const mergedSubscriptionsList: Subscription[] = Array.from(mergedMap.values()).map(
        ({ merged, subscriptions: subs }) => {
          const mostRecent = getMostRecent(subs)
          const period = mostRecent.period || 'MONTHLY'
          const rawPrice = mostRecent.price || 0
          const convertedPrice = convertCurrency(
            rawPrice,
            mostRecent.currency as CurrencyCode,
            targetCurrency,
          )
          return {
            id: mostRecent.id.toString(),
            name: mostRecent.subscription_service?.name || 'Unknown Service',
            url: mostRecent.subscription_service?.url || undefined,
            price: convertedPrice,
            period,
            monthlyCost: toMonthlyCost(convertedPrice, period),
            currency: targetCurrency,
            startDate: merged.startDate,
            endDate: merged.endDate,
            category: mostRecent.subscription_service?.category || null,
            paymentMethod: mostRecent.payment_method || null,
            sourceEmail: mostRecent.source_email || null,
            autoRenew: Boolean(mostRecent.auto_renew),
          }
        },
      )

      const insightData = buildInsights(mergedSubscriptionsList, mergedMap.values(), {
        targetCurrency,
        groupBy,
        mode,
        tab,
        year,
      })

      return NextResponse.json({ data: insightData })
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 },
      )
    }
  },
)
