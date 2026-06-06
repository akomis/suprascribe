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
  subscriptions: DiscoveredSubscription[]
  emailCount: number
  email: string
}

export interface DiscoveryFailureResponse {
  success: false
  kind: DiscoveryErrorKind
  error: string
}

export type DiscoveryResponse = DiscoverySuccessResponse | DiscoveryFailureResponse
