'use client'

import { ImportDiscoveredHandler } from '@/components/dashboard/discovery/ImportDiscoveredHandler'
import { OAuthDiscoveryHandler } from '@/components/dashboard/discovery/OAuthDiscoveryHandler'
import { TeaserUnlockHandler } from '@/components/dashboard/discovery/TeaserUnlockHandler'

export function DiscoveryHandlers() {
  return (
    <>
      <OAuthDiscoveryHandler provider="google" />
      <OAuthDiscoveryHandler provider="microsoft" />
      <TeaserUnlockHandler />
      <ImportDiscoveredHandler />
    </>
  )
}
