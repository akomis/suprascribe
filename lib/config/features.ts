import type { Database } from '@/lib/database.types'

export type TierType = Database['public']['Enums']['TIER_TYPE']
export type FeatureTier = 'basic' | 'pro'

export const TIER = {
  BASIC: 'basic' as const,
  PRO: 'pro' as const,
} as const

export interface FeatureDefinition {
  key: string
  name: string
  description: string
  tier: FeatureTier
  enabled: boolean
  moreInfoLink?: { label: string; href: string }
}

export const Features = {
  basic_subscriptions: {
    key: 'basic_subscriptions',
    name: 'Subscription Management',
    description: 'Dashboard with subscriptions and insights',
    tier: TIER.BASIC,
    enabled: true,
  },
  manual_add: {
    key: 'manual_add',
    name: 'Manual Add',
    description: 'Create and manage (unlimited) subscriptions manually',
    tier: TIER.BASIC,
    enabled: true,
  },
  multiple_currency: {
    key: 'multiple_currency',
    name: 'Multiple Currency',
    description: 'Support for multiple currencies',
    tier: TIER.BASIC,
    enabled: true,
  },
  byok: {
    key: 'byok',
    name: 'Bring Your Own Key',
    description: 'Use your own API keys for unlimited discovery with a variety of AI providers',
    tier: TIER.BASIC,
    enabled: true,
    moreInfoLink: { label: 'Learn about BYOK', href: '/limits#byok' },
  },
  auto_discovery: {
    key: 'auto_discovery',
    name: 'Auto Discovery',
    description:
      'Discover active & past subscriptions automatically through Gmail, Outlook and iCloud (or any other provider with IMAP)',
    tier: TIER.PRO,
    enabled: true,
    moreInfoLink: { label: 'Learn about discovery limits', href: '/limits' },
  },
  subscription_history: {
    key: 'subscription_history',
    name: 'Complete History',
    description: 'Complete subscription history & management',
    tier: TIER.PRO,
    enabled: true,
  },
  search_sort_group: {
    key: 'search_sort_group',
    name: 'Search, Sort & Group',
    description: 'Search, sort and group subscriptions',
    tier: TIER.PRO,
    enabled: true,
  },
  quick_unsubscribe: {
    key: 'quick_unsubscribe',
    name: 'Quick Unsubscribe',
    description: 'Two-click service unsubscribe',
    tier: TIER.PRO,
    enabled: true,
  },
  renewal_reminders: {
    key: 'renewal_reminders',
    name: 'Renewal Reminders',
    description: 'Renewal email reminders',
    tier: TIER.PRO,
    enabled: true,
  },
  calendar_view: {
    key: 'calendar_view',
    name: 'Calendar View',
    description: 'Subscription calendar view',
    tier: TIER.PRO,
    enabled: true,
  },
  email_support: {
    key: 'email_support',
    name: 'Email Support',
    description: 'Email support',
    tier: TIER.PRO,
    enabled: true,
  },
} as const

export type FeatureKey = keyof typeof Features

export const Feature = Object.keys(Features).reduce(
  (acc, key) => {
    acc[key.toUpperCase() as Uppercase<FeatureKey>] = key as FeatureKey
    return acc
  },
  {} as Record<Uppercase<FeatureKey>, FeatureKey>,
)

export type Feature = (typeof Feature)[keyof typeof Feature]

const BASIC_FEATURES = Object.entries(Features)
  .filter(([_, feature]) => feature.tier === TIER.BASIC)
  .map(([key]) => key as FeatureKey)

const PRO_FEATURES = Object.entries(Features)
  .filter(([_, feature]) => feature.tier === TIER.PRO)
  .map(([key]) => key as FeatureKey)

export const TierFeatures: Record<TierType, FeatureKey[]> = {
  BASIC: BASIC_FEATURES,
  PRO: [...BASIC_FEATURES, ...PRO_FEATURES],
}

export const FeatureNames: Record<FeatureKey, string> = Object.entries(Features).reduce(
  (acc, [key, feature]) => {
    acc[key as FeatureKey] = feature.name
    return acc
  },
  {} as Record<FeatureKey, string>,
)

export const TierNames: Record<TierType, string> = {
  BASIC: 'Basic',
  PRO: 'Pro',
}

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return Features[feature]?.enabled ?? false
}

export function hasFeatureAccess(
  userTier: TierType | null | undefined,
  feature: FeatureKey,
): boolean {
  if (!userTier) {
    return TierFeatures.BASIC.includes(feature)
  }

  return TierFeatures[userTier].includes(feature)
}

export function getRequiredTier(feature: FeatureKey): TierType | null {
  if (TierFeatures.BASIC.includes(feature)) {
    return 'BASIC'
  }

  if (TierFeatures.PRO.includes(feature)) {
    return 'PRO'
  }

  return null
}

export function getFeaturesByTier(tier: FeatureTier): FeatureDefinition[] {
  return Object.values(Features).filter((feature) => feature.tier === tier)
}

export function getEnabledFeaturesByTier(tier: FeatureTier): FeatureDefinition[] {
  return getFeaturesByTier(tier).filter((feature) => feature.enabled)
}
