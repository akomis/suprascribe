import { useFeatureAccess, type FeatureAccessResult } from './useFeatureAccess'
import { useBYOKSettings } from './useBYOKSettings'
import { useTeaserStatus } from './discovery/useTeaserStatus'

export interface AutoDiscoveryAccessResult extends FeatureAccessResult {
  hasByokAccess: boolean
  // BASIC user (no BYOK) who hasn't yet used their one free teaser scan.
  canRunFreeTeaser: boolean
}

export function useAutoDiscoveryAccess(): AutoDiscoveryAccessResult {
  const featureAccess = useFeatureAccess('auto_discovery')
  const { activeKeyId, isLoading: isLoadingKeys } = useBYOKSettings()
  const { status: teaserStatus, isLoading: isLoadingTeaser } = useTeaserStatus()

  const hasActiveByokKey = activeKeyId !== null

  const hasPaidAccess = featureAccess.hasAccess || hasActiveByokKey

  const canRunFreeTeaser =
    !hasPaidAccess && featureAccess.requiresUpgrade && teaserStatus !== undefined
      ? !teaserStatus.freeScanUsed && !teaserStatus.isPro
      : false

  // Free-teaser users also reach the discovery flow, just in teaser mode.
  const hasAccess = hasPaidAccess || canRunFreeTeaser

  return {
    ...featureAccess,
    hasAccess,
    hasByokAccess: hasActiveByokKey,
    canRunFreeTeaser,
    isLoading: featureAccess.isLoading || isLoadingKeys || isLoadingTeaser,
    requiresUpgrade: featureAccess.requiresUpgrade && !hasActiveByokKey && !canRunFreeTeaser,
  }
}
