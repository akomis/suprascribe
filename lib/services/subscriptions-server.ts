import { createClient } from '@/lib/supabase/server'
import { mergeSubscriptionsByService, getMostRecent } from '@/lib/utils/subscription-aggregation'
import {
  calculateServiceSpentThisYear,
  calculateServiceForecastThisYear,
} from '@/lib/utils/subscription-analytics'
import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'

export async function fetchSubscriptionsServer(): Promise<MergedSubscriptionResponse[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

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

  if (error || !data) return []

  const mergedMap = mergeSubscriptionsByService(data, 'average')
  const today = new Date()

  return Array.from(mergedMap.values()).map(({ subscriptions: subs, merged }) => {
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
      forecastThisYear: calculateServiceForecastThisYear(subs, monthlyPrice, autoRenew, today),
      totalSpent: subs.reduce((sum, s) => sum + (s.price || 0), 0),
    }
  })
}
