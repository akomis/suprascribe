'use client'

import { OAuthDiscoveryHandler } from '@/components/dashboard/discovery/OAuthDiscoveryHandler'

export function DiscoveryHandlers() {
  return (
    <>
      <OAuthDiscoveryHandler provider="google" />
      <OAuthDiscoveryHandler provider="microsoft" />
    </>
  )
}
