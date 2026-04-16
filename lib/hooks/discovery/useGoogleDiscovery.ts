'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import { useRouter, useSearchParams } from 'next/navigation'
import posthog from 'posthog-js'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useInvalidateDiscoveryRuns } from './useDiscoveryRuns'

export type { DiscoveredSubscription }

interface UseGoogleDiscoveryReturn {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  error: string | null
  warning: string | null
  clearDiscovery: () => void
  retry: () => void
}

export function useGoogleDiscovery(): UseGoogleDiscoveryReturn {
  const router = useRouter()
  const searchParams = useSearchParams()
  const invalidateDiscoveryRuns = useInvalidateDiscoveryRuns()
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredSubscriptions, setDiscoveredSubscriptions] = useState<DiscoveredSubscription[]>(
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const hasCalledWebhook = useRef(false)
  const lastTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const shouldDiscover = searchParams.get('discover') === 'true'

    if (shouldDiscover && !hasCalledWebhook.current) {
      fetch('/api/discovery/token?provider=google')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.token) {
            hasCalledWebhook.current = true

            const newUrl = new URL(window.location.href)
            newUrl.searchParams.delete('discover')
            router.replace(newUrl.pathname + newUrl.search)

            lastTokenRef.current = data.token
            callDiscoveryApi(data.token)
          }
        })
        .catch(() => {})
    }
  }, [searchParams, router])

  const callDiscoveryApi = async (token: string) => {
    setIsDiscovering(true)
    setError(null)
    setWarning(null)

    try {
      const response = await fetch('/api/discovery/discover/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!data.success) {
        if (data.warning) {
          setWarning(data.warning)
        } else {
          throw new Error(data.error || 'Discovery failed')
        }
        return
      }

      setDiscoveredSubscriptions(
        data.subscriptions.map((sub: DiscoveredSubscription) => ({
          ...sub,
          source_email: data.email,
        })),
      )
      invalidateDiscoveryRuns()

      const serviceCount = new Set(
        data.subscriptions.map((s: DiscoveredSubscription) => s.service_name),
      ).size
      posthog.capture('subscription_discovery_completed', {
        provider: 'google',
        subscriptions_found: data.subscriptions.length,
        services_found: serviceCount,
        emails_scanned: data.emailCount,
      })
      if (data.subscriptions.length > 0) {
        toast.success('Discovery Completed', {
          description: `Found ${serviceCount} service${serviceCount !== 1 ? 's' : ''} from ${data.emailCount} emails.`,
        })
      } else {
        toast.success('Discovery Completed', {
          description: `No subscriptions found in ${data.emailCount} emails.`,
        })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to discover subscriptions.'
      setError(errorMessage)
      toast.error('Discovery Failed', { description: errorMessage })
    } finally {
      setIsDiscovering(false)
    }
  }

  const clearDiscovery = () => {
    setIsDiscovering(false)
    setDiscoveredSubscriptions([])
    setError(null)
    setWarning(null)
    hasCalledWebhook.current = false
  }

  const retry = () => {
    if (lastTokenRef.current) {
      callDiscoveryApi(lastTokenRef.current)
    }
  }

  return {
    isDiscovering,
    discoveredSubscriptions,
    error,
    warning,
    clearDiscovery,
    retry,
  }
}
