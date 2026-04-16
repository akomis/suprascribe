import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { CurrencyCode } from './useCurrency'

export type GroupByOption = 'service' | 'category' | 'paymentMethod'
export type InsightMode = 'spent' | 'forecast'
export type InsightTab = 'active' | 'past'

export type PieDataItem = {
  name: string
  value: number
  fill: string
}

export type InsightData = {
  totalMonthly: number
  yearly: number
  mostExpensive: {
    name: string
    url?: string
    monthlyCost: number
  } | null
  leastExpensive: {
    name: string
    url?: string
    monthlyCost: number
  } | null
  nextExpiring: Array<{
    name: string
    url?: string
    endDate: string
  }>
  pieData: PieDataItem[]
}

export const insightKeys = {
  all: ['insights'] as const,
  lists: () => [...insightKeys.all, 'list'] as const,
  byCurrency: (
    currency: CurrencyCode,
    groupBy: GroupByOption,
    mode: InsightMode,
    tab: InsightTab,
    year?: number,
  ) => [...insightKeys.all, 'list', currency, groupBy, mode, tab, year] as const,
}

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

    const result = await response.json()
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
