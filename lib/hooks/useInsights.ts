import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import type { CurrencyCode } from './useCurrency'
import type { ApiResponse } from '@/lib/types/api'
import { isApiError } from '@/lib/types/api'
import type { GroupByOption, InsightData, InsightMode, InsightTab } from '@/lib/types/subscriptions'
import { insightKeys, STALE_TIME } from './query-keys'

export { insightKeys }

const insightApi = {
  async getInsights(
    currency: CurrencyCode,
    groupBy: GroupByOption,
    mode: InsightMode,
    tab: InsightTab,
    year?: number,
  ): Promise<InsightData> {
    const params = new URLSearchParams({
      currency,
      groupBy,
      mode,
      tab,
    })
    if (year !== undefined) {
      params.set('year', year.toString())
    }
    const response = await fetch(`/api/subscriptions/insights?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch insights')
    }

    const result: ApiResponse<InsightData> = await response.json()
    if (isApiError(result)) throw new Error(result.error)
    return result.data
  },
}

export function useInsights(
  currency: CurrencyCode,
  groupBy: GroupByOption = 'service',
  mode: InsightMode = 'forecast',
  tab: InsightTab = 'active',
  year?: number,
) {
  return useQuery({
    queryKey: insightKeys.byCurrency(currency, groupBy, mode, tab, year),
    queryFn: () => insightApi.getInsights(currency, groupBy, mode, tab, year),
    staleTime: STALE_TIME.default,
  })
}

export function useInsightsSuspense(
  currency: CurrencyCode,
  groupBy: GroupByOption = 'service',
  mode: InsightMode = 'forecast',
  tab: InsightTab = 'active',
  year?: number,
) {
  return useSuspenseQuery({
    queryKey: insightKeys.byCurrency(currency, groupBy, mode, tab, year),
    queryFn: () => insightApi.getInsights(currency, groupBy, mode, tab, year),
    staleTime: STALE_TIME.default,
  })
}
