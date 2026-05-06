export type { Database, Json } from '@/lib/database.types'

export type { DataClassification, DataProtectionLevel } from '@/lib/config/data-classification'
export { DATA_CLASSIFICATION } from '@/lib/config/data-classification'

import type { Database } from '@/lib/database.types'

export type SubscriptionService = Database['public']['Tables']['SUBSCRIPTION_SERVICES']['Row']
export type SubscriptionServiceInsert =
  Database['public']['Tables']['SUBSCRIPTION_SERVICES']['Insert']

export type UserSubscription = Database['public']['Tables']['USER_SUBSCRIPTIONS']['Row']
export type UserSubscriptionInsert = Database['public']['Tables']['USER_SUBSCRIPTIONS']['Insert']

export type UserSettings = Database['public']['Tables']['USER_SETTINGS']['Row']

export type UserTier = Database['public']['Tables']['USER_TIERS']['Row']

export type DiscoveryRun = Database['public']['Tables']['DISCOVERY_RUNS']['Row']

export enum Tier {
  BASIC = 'BASIC',
  PRO = 'PRO',
}

export type CurrencyCode = Database['public']['Enums']['CURRENCY_CODE']

export type UserSubscriptionWithDetails = UserSubscription & {
  subscription_service: Pick<SubscriptionService, 'name' | 'url' | 'unsubscribe_url'>
}
