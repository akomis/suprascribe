'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import { useDiscoveryCore } from './useDiscoveryCore'

interface ImapCredentials {
  email: string
  password: string
  server: string
  port: number
  useTls: boolean
}

interface UseImapDiscoveryReturn {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  emailCount: number | null
  scannedEmail: string | null
  error: string | null
  warning: string | null
  clearDiscovery: () => void
  retry: () => void
  startDiscovery: (credentials: ImapCredentials) => Promise<void>
}

export function useImapDiscovery(): UseImapDiscoveryReturn {
  const {
    isDiscovering,
    discoveredSubscriptions,
    emailCount,
    scannedEmail,
    error,
    warning,
    runDiscovery,
    retry,
    clearDiscovery,
  } = useDiscoveryCore('imap')

  const startDiscovery = (credentials: ImapCredentials) =>
    runDiscovery(async (): Promise<DiscoveryResponse> => {
      const res = await fetch('/api/discovery/discover/imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credentials }),
      })
      return res.json()
    })

  return {
    isDiscovering,
    discoveredSubscriptions,
    emailCount,
    scannedEmail,
    error,
    warning,
    clearDiscovery,
    retry,
    startDiscovery,
  }
}
