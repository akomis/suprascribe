import type { UserSubscriptionWithDetails } from '@/lib/types/database'

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

export type GroupByOption = 'service' | 'sourceEmail' | 'category' | 'paymentMethod'
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

export type Subscription = {
  id: string
  name: string
  url?: string
  monthlyCost: number
  currency: string
  startDate: string
  endDate: string
  category?: string | null
  paymentMethod?: string | null
  sourceEmail?: string | null
  autoRenew: boolean
}
