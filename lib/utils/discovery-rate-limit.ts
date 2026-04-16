import type { DiscoveryRun } from '@/lib/types/database'

export const MAX_TOTAL_DISCOVERIES = 25

export interface RateLimitInfo {
  canDiscover: boolean
  discoveriesUsed: number
  maxDiscoveries: number
}

export interface RateLimitCheckResult {
  canDiscover: boolean
  reason?: string
}

export function calculateRateLimitInfo(runs: DiscoveryRun[]): RateLimitInfo {
  const totalDiscoveries = runs.length

  return {
    canDiscover: totalDiscoveries < MAX_TOTAL_DISCOVERIES,
    discoveriesUsed: totalDiscoveries,
    maxDiscoveries: MAX_TOTAL_DISCOVERIES,
  }
}

export function checkRateLimit(runs: DiscoveryRun[]): RateLimitCheckResult {
  const rateLimitInfo = calculateRateLimitInfo(runs)

  if (!rateLimitInfo.canDiscover) {
    return {
      canDiscover: false,
      reason: `You've used all ${MAX_TOTAL_DISCOVERIES} discoveries. Configure your own API key (BYOK) for unlimited discoveries.`,
    }
  }

  return { canDiscover: true }
}

export function formatRateLimitTooltip(rateLimitInfo: RateLimitInfo): string | null {
  if (!rateLimitInfo.canDiscover) {
    return `${rateLimitInfo.discoveriesUsed}/${rateLimitInfo.maxDiscoveries} discoveries used. Configure BYOK for unlimited.`
  }

  return null
}
