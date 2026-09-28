'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryErrorKind, DiscoveryResponse } from '@/lib/types/discovery'
import { useDiscoveryCore, type DiscoveryTeaser } from './useDiscoveryCore'

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
  teaser: DiscoveryTeaser | null
  emailCount: number | null
  scannedEmail: string | null
  error: string | null
  warning: string | null
  warningKind: DiscoveryErrorKind | null
  clearDiscovery: () => void
  retry: () => void
  startDiscovery: (credentials: ImapCredentials) => Promise<void>
}

export function useImapDiscovery(): UseImapDiscoveryReturn {
  const {
    isDiscovering,
    discoveredSubscriptions,
    teaser,
    emailCount,
    scannedEmail,
    error,
    warning,
    warningKind,
    runDiscovery,
    retry,
    clearDiscovery,
  } = useDiscoveryCore()

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
    teaser,
    emailCount,
    scannedEmail,
    error,
    warning,
    warningKind,
    clearDiscovery,
    retry,
    startDiscovery,
  }
}
