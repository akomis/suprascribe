import type { DiscoveredSubscription } from '@/lib/types/forms'

export type DiscoveryErrorKind =
  | 'auth_failed'
  | 'quota_exceeded'
  | 'rate_limited'
  | 'provider_error'
  | 'validation_error'
  | 'unknown'

export interface DiscoverySuccessResponse {
  success: true
  teaser?: false
  subscriptions: DiscoveredSubscription[]
  emailCount: number
  email: string
  // Id of the DISCOVERY_RUNS row this scan created. Absent for flows that
  // record no run (teaser claim, anonymous one-time scan) or if the insert failed.
  runId?: string
}

export interface DiscoveryTeaserResponse {
  success: true
  teaser: true
  subscriptionsFound: number
  preview: DiscoveredSubscription[] // first 1-2 real, for proof
  emailCount: number
  email: string
}

export interface DiscoveryFailureResponse {
  success: false
  kind: DiscoveryErrorKind
  error: string
}

export type DiscoveryResponse =
  DiscoverySuccessResponse | DiscoveryTeaserResponse | DiscoveryFailureResponse

// Number of real preview rows sent to a BASIC client in teaser mode.
export const TEASER_PREVIEW_COUNT = 2
