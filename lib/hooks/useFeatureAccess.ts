import { useAccountTier } from './useAccount'
import {
  Feature,
  Features,
  TierFeatures,
  getRequiredTier,
  TierNames,
  type FeatureKey,
} from '@/lib/config/features'
import type { TierType } from '@/lib/config/features'

export interface FeatureAccessResult {
  hasAccess: boolean
  isEnabled: boolean
  tier: TierType | null
  requiresUpgrade: boolean
  requiredTier: TierType | null
  requiredTierName: string | null
  isLoading: boolean
  error: Error | null
}

export function useFeatureAccess(feature: Feature | FeatureKey): FeatureAccessResult {
  const { data: tier, isLoading, error } = useAccountTier()

  const featureKey = feature as FeatureKey

  const isEnabled = Features[featureKey]?.enabled ?? false

  const userTier = tier ?? 'BASIC'
  const tierHasAccess = TierFeatures[userTier]?.includes(featureKey) ?? false

  const hasFullAccess = isEnabled && tierHasAccess

  const requiredTier = getRequiredTier(featureKey)
  const requiredTierName = requiredTier ? TierNames[requiredTier] : null

  const requiresUpgrade = isEnabled && !tierHasAccess && requiredTier !== null

  return {
    hasAccess: hasFullAccess,
    isEnabled,
    tier: tier ?? null,
    requiresUpgrade,
    requiredTier,
    requiredTierName,
    isLoading,
    error: error as Error | null,
  }
}
