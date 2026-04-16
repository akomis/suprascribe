import { useFeatureAccess, type FeatureAccessResult } from './useFeatureAccess'
import { useBYOKSettings } from './useBYOKSettings'

export interface AutoDiscoveryAccessResult extends FeatureAccessResult {
  hasByokAccess: boolean
}

export function useAutoDiscoveryAccess(): AutoDiscoveryAccessResult {
  const featureAccess = useFeatureAccess('auto_discovery')
  const { activeKeyId, isLoading: isLoadingKeys } = useBYOKSettings()

  const hasActiveByokKey = activeKeyId !== null

  const hasAccess = featureAccess.hasAccess || hasActiveByokKey

  return {
    ...featureAccess,
    hasAccess,
    hasByokAccess: hasActiveByokKey,
    isLoading: featureAccess.isLoading || isLoadingKeys,
    requiresUpgrade: featureAccess.requiresUpgrade && !hasActiveByokKey,
  }
}
