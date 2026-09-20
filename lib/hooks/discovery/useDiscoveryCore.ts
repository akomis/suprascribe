'use client'

import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryResponse, TeaserPreviewGroup } from '@/lib/types/discovery'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { useInvalidateDiscoveryRuns } from './useDiscoveryRuns'
import { useInvalidateTeaserStatus } from './useTeaserStatus'

export interface DiscoveryTeaser {
  subscriptionsFound: number
  preview: TeaserPreviewGroup[]
  email: string
  emailCount: number
}

export interface DiscoveryCoreReturn {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  teaser: DiscoveryTeaser | null
  emailCount: number | null
  scannedEmail: string | null
  error: string | null
  warning: string | null
  runDiscovery: (fetchFn: () => Promise<DiscoveryResponse>) => Promise<void>
  retry: () => void
  clearDiscovery: () => void
}

export function useDiscoveryCore(): DiscoveryCoreReturn {
  const invalidateDiscoveryRuns = useInvalidateDiscoveryRuns()
  const invalidateTeaserStatus = useInvalidateTeaserStatus()
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredSubscriptions, setDiscoveredSubscriptions] = useState<DiscoveredSubscription[]>(
    [],
  )
  const [teaser, setTeaser] = useState<DiscoveryTeaser | null>(null)
  const [emailCount, setEmailCount] = useState<number | null>(null)
  const [scannedEmail, setScannedEmail] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const lastFetchFnRef = useRef<(() => Promise<DiscoveryResponse>) | null>(null)
  // Guards against a second scan overlapping the first (double-click, retry
  // while the original request is still open, a second tab). Two overlapping
  // scans race for the same free-scan slot server-side, and the loser pays for
  // a scan it can never store. A ref, not `isDiscovering`, because the state
  // update is not visible to a call made in the same tick.
  const inFlightRef = useRef(false)
  // Set once a run comes back in teaser mode (or is refused because the free
  // scan is already spent): the cached teaser status no longer matches the
  // server, and until it is refetched the dashboard keeps offering the email
  // provider buttons, so a second click only earns a limit-reached warning.
  // The refetch waits for clearDiscovery because dropping `canRunFreeTeaser`
  // unmounts the provider selection - and with it the dialog still showing
  // the teaser result.
  const teaserStatusStaleRef = useRef(false)

  const runDiscovery = async (fetchFn: () => Promise<DiscoveryResponse>) => {
    if (inFlightRef.current) return
    inFlightRef.current = true
    lastFetchFnRef.current = fetchFn
    setIsDiscovering(true)
    setError(null)
    setWarning(null)

    try {
      const data = await fetchFn()

      if (!data.success) {
        if (data.kind === 'rate_limited') {
          teaserStatusStaleRef.current = true
          setWarning(data.error)
        } else {
          const msg = data.error || 'Discovery failed'
          if (data.kind === 'auth_failed') throw new Error(`Authentication failed: ${msg}`)
          if (data.kind === 'quota_exceeded') throw new Error(`Quota exceeded: ${msg}`)
          throw new Error(msg)
        }
        return
      }

      if (data.teaser) {
        teaserStatusStaleRef.current = true
        setTeaser({
          subscriptionsFound: data.subscriptionsFound,
          preview: data.preview,
          email: data.email,
          emailCount: data.emailCount,
        })
        setEmailCount(data.emailCount)
        setScannedEmail(data.email)
        return
      }

      setDiscoveredSubscriptions(
        data.subscriptions.map((sub) => ({ ...sub, source_email: data.email })),
      )
      setEmailCount(data.emailCount)
      setScannedEmail(data.email)
      invalidateDiscoveryRuns()

      const serviceCount = new Set(data.subscriptions.map((s) => s.service_name)).size

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
      inFlightRef.current = false
      setIsDiscovering(false)
    }
  }

  const retry = () => {
    if (lastFetchFnRef.current) runDiscovery(lastFetchFnRef.current)
  }

  const clearDiscovery = () => {
    setIsDiscovering(false)
    setDiscoveredSubscriptions([])
    setTeaser(null)
    setEmailCount(null)
    setScannedEmail(null)
    setError(null)
    setWarning(null)
    lastFetchFnRef.current = null

    if (teaserStatusStaleRef.current) {
      teaserStatusStaleRef.current = false
      invalidateTeaserStatus()
    }
  }

  return {
    isDiscovering,
    discoveredSubscriptions,
    teaser,
    emailCount,
    scannedEmail,
    error,
    warning,
    runDiscovery,
    retry,
    clearDiscovery,
  }
}
