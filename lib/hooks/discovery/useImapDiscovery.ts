'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import posthog from 'posthog-js'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useInvalidateDiscoveryRuns } from './useDiscoveryRuns'

export type { DiscoveredSubscription }

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
  error: string | null
  warning: string | null
  clearDiscovery: () => void
  retry: () => void
  startDiscovery: (credentials: ImapCredentials) => Promise<void>
}

export function useImapDiscovery(): UseImapDiscoveryReturn {
  const invalidateDiscoveryRuns = useInvalidateDiscoveryRuns()
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredSubscriptions, setDiscoveredSubscriptions] = useState<DiscoveredSubscription[]>(
    [],
  )
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const lastCredentialsRef = useRef<ImapCredentials | null>(null)

  const startDiscovery = async (credentials: ImapCredentials) => {
    setIsDiscovering(true)
    setError(null)
    setWarning(null)
    lastCredentialsRef.current = credentials

    try {
      const response = await fetch('/api/discovery/discover/imap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentials: {
            email: credentials.email,
            password: credentials.password,
            server: credentials.server,
            port: credentials.port,
            useTls: credentials.useTls,
          },
        }),
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
        provider: 'imap',
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
  }

  const retry = () => {
    if (lastCredentialsRef.current) {
      startDiscovery(lastCredentialsRef.current)
    }
  }

  return {
    isDiscovering,
    discoveredSubscriptions,
    error,
    warning,
    clearDiscovery,
    retry,
    startDiscovery,
  }
}
