'use client'

import { GoogleDiscoveryHandler } from '@/components/dashboard/discovery/GoogleDiscoveryHandler'
import { MicrosoftDiscoveryHandler } from '@/components/dashboard/discovery/MicrosoftDiscoveryHandler'

export function DiscoveryHandlers() {
  return (
    <>
      <GoogleDiscoveryHandler />
      <MicrosoftDiscoveryHandler />
    </>
  )
}
