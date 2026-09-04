import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'

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
}

// One charge, stripped to what a locked teaser may show: price and period only.
// Start/renewal dates, unsubscribe and receipt links stay locked.
export interface TeaserPreviewEntry {
  price: number
  currency?: string
  /** Absent for a one-time payment, matching isOneTimePayment(). */
  period?: BillingPeriod
  is_active: boolean
}

// One card per service, already grouped and ordered server-side: the client
// cannot do it itself because the dates that order the charges are withheld.
export interface TeaserPreviewGroup {
  service_name: string
  service_url?: string
  /** The recurring charge first, then each one-time purchase, newest first. */
  entries: TeaserPreviewEntry[]
  /** True when any entry is still running. */
  is_active: boolean
}

export interface DiscoveryTeaserResponse {
  success: true
  teaser: true
  subscriptionsFound: number
  preview: TeaserPreviewGroup[] // every service found, prices but no dates
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
