'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { useDiscoveryCore, type DiscoveryTeaser } from './useDiscoveryCore'

interface UseOAuthDiscoveryReturn {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  teaser: DiscoveryTeaser | null
  emailCount: number | null
  scannedEmail: string | null
  error: string | null
  warning: string | null
  clearDiscovery: () => void
  retry: () => void
}

export function useOAuthDiscovery(provider: 'google' | 'microsoft'): UseOAuthDiscoveryReturn {
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    isDiscovering,
    discoveredSubscriptions,
    teaser,
    emailCount,
    scannedEmail,
    error,
    warning,
    runDiscovery,
    retry,
    clearDiscovery: clearCore,
  } = useDiscoveryCore(provider)
  const hasCalledWebhook = useRef(false)

  const callDiscoveryApi = useCallback(
    (token: string) =>
      runDiscovery(async (): Promise<DiscoveryResponse> => {
        const res = await fetch(`/api/discovery/discover/${provider}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
        return res.json()
      }),
    [provider, runDiscovery],
  )

  useEffect(() => {
    const shouldDiscover = searchParams.get('discover') === 'true'

    if (shouldDiscover && !hasCalledWebhook.current) {
      fetch(`/api/discovery/token?provider=${provider}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.token) {
            hasCalledWebhook.current = true

            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('discover')
            router.replace(newUrl.pathname + newUrl.search)

            callDiscoveryApi(data.token)
          }
        })
        .catch(() => {})
    }
  }, [searchParams, router, provider, callDiscoveryApi])

  const clearDiscovery = () => {
    clearCore()
    hasCalledWebhook.current = false
  }

  return {
    isDiscovering,
    discoveredSubscriptions,
    teaser,
    emailCount,
    scannedEmail,
    error,
    warning,
    clearDiscovery,
    retry,
  }
}
