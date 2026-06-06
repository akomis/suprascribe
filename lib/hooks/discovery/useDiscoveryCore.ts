'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import posthog from 'posthog-js'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useInvalidateDiscoveryRuns } from './useDiscoveryRuns'

export interface DiscoveryCoreReturn {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  emailCount: number | null
  scannedEmail: string | null
  error: string | null
  warning: string | null
  runDiscovery: (fetchFn: () => Promise<DiscoveryResponse>) => Promise<void>
  retry: () => void
  clearDiscovery: () => void
}

export function useDiscoveryCore(provider: string): DiscoveryCoreReturn {
  const invalidateDiscoveryRuns = useInvalidateDiscoveryRuns()
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredSubscriptions, setDiscoveredSubscriptions] = useState<DiscoveredSubscription[]>(
    [],
  )
  const [emailCount, setEmailCount] = useState<number | null>(null)
  const [scannedEmail, setScannedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const lastFetchFnRef = useRef<(() => Promise<DiscoveryResponse>) | null>(null)

  const runDiscovery = async (fetchFn: () => Promise<DiscoveryResponse>) => {
    lastFetchFnRef.current = fetchFn
    setIsDiscovering(true)
    setError(null)
    setWarning(null)

    try {
      const data = await fetchFn()

      if (!data.success) {
        if (data.kind === 'rate_limited') {
          setWarning(data.error)
        } else {
          const msg = data.error || 'Discovery failed'
          if (data.kind === 'auth_failed') throw new Error(`Authentication failed: ${msg}`)
          if (data.kind === 'quota_exceeded') throw new Error(`Quota exceeded: ${msg}`)
          throw new Error(msg)
        }
        return
      }

      setDiscoveredSubscriptions(
        data.subscriptions.map((sub) => ({ ...sub, source_email: data.email })),
      )
      setEmailCount(data.emailCount)
      setScannedEmail(data.email)
      invalidateDiscoveryRuns()

      const serviceCount = new Set(data.subscriptions.map((s) => s.service_name)).size
      posthog.capture('subscription_discovery_completed', {
        provider,
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

  const retry = () => {
    if (lastFetchFnRef.current) runDiscovery(lastFetchFnRef.current)
  }

  const clearDiscovery = () => {
    setIsDiscovering(false)
    setDiscoveredSubscriptions([])
    setEmailCount(null)
    setScannedEmail(null)
    setError(null)
    setWarning(null)
    lastFetchFnRef.current = null
  }

  return {
    isDiscovering,
    discoveredSubscriptions,
    emailCount,
    scannedEmail,
    error,
    warning,
    runDiscovery,
    retry,
    clearDiscovery,
  }
}
