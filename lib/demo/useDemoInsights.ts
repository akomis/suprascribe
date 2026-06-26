import { useMemo } from 'react'
import type { DemoMergedSubscription } from '@/lib/demo/sampleData'
import type {
  GroupByOption,
  InsightData,
  InsightMode,
  InsightTab,
  Subscription,
} from '@/lib/types/subscriptions'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import { toMonthlyCost } from '@/lib/utils'
import { convertCurrency } from '@/lib/utils/currency'
import { buildInsights } from '@/lib/utils/subscription-analytics'
import { useDemoContext } from '@/components/demo/DemoProvider'

function transformSubscriptions(
  subscriptions: DemoMergedSubscription[],
  targetCurrency: CurrencyCode,
): Subscription[] {
  return subscriptions.map((sub, index) => {
    const period = sub.period ?? 'MONTHLY'
    const convertedPrice = convertCurrency(sub.price, sub.currency as CurrencyCode, targetCurrency)
    return {
      id: index.toString(),
      name: sub.name,
      url: sub.serviceUrl,
      price: convertedPrice,
      period,
      monthlyCost: toMonthlyCost(convertedPrice, period),
      currency: targetCurrency,
      startDate: sub.startDate,
      endDate: sub.endDate,
      category: sub.category || sub.subscriptions[0]?.category || null,
      paymentMethod: sub.subscriptions[0]?.payment_method || null,
      autoRenew: Boolean(sub.autoRenew),
    }
  })
}

export function useDemoInsights(
  currency: CurrencyCode,
  groupBy: GroupByOption = 'service',
  mode: InsightMode = 'forecast',
  tab: InsightTab = 'active',
  year?: number,
): { data: InsightData; error: null; isLoading: false } {
  const { subscriptions } = useDemoContext()

  const data = useMemo((): InsightData => {
    const transformed = transformSubscriptions(subscriptions, currency)
    const serviceGroups = subscriptions.map((sub) => ({
      subscriptions: sub.subscriptions,
      merged: { startDate: sub.startDate, endDate: sub.endDate },
    }))
    return buildInsights(transformed, serviceGroups, {
      targetCurrency: currency,
      groupBy,
      mode,
      tab,
      year,
    })
  }, [subscriptions, currency, groupBy, mode, tab, year])

  return { data, error: null, isLoading: false }
}
