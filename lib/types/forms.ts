import type { Database } from '@/lib/types/database'

export type BillingPeriod = Database['public']['Enums']['BILLING_PERIOD']

export type CreateSubscriptionFormData = {
  serviceName: string
  serviceUrl?: string
  serviceUnsubscribeUrl?: string
  serviceCategory?: Database['public']['Enums']['SUBSCRIPTION_CATEGORY']
  startDate: string
  endDate: string
  autoRenew: boolean
  price: number
  currency: Database['public']['Enums']['CURRENCY_CODE']
  period: BillingPeriod
  paymentMethod?: string
  sourceEmail?: string
}

export interface DiscoveredSubscription {
  service_name: string
  category?: Database['public']['Enums']['SUBSCRIPTION_CATEGORY']
  currency?: string
  price: number
  period?: BillingPeriod
  start_date: string
  end_date: string
  service_url?: string
  unsubscribe_url?: string
  payment_method?: string
  auto_renew?: boolean
  source_email?: string
}
