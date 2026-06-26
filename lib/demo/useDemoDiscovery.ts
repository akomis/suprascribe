'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import {
  DEMO_DISCOVERED_SUBSCRIPTIONS,
  generateRandomDiscoveredSubscriptions,
} from '@/lib/demo/demoDiscoveryData'

const MIN_DELAY_MS = 5000
const MAX_DELAY_MS = 10000

// Simulates the email-discovery flow on the demo page. Mirrors the slice of the
// real IMAP discovery hook consumed by DiscoveryDialog, but instead of hitting
// any backend it spins for a random 5-10s then returns results.
//
// `randomize` (used by /demo-discovery) generates a fresh random set each scan;
// otherwise the fixed curated set is returned (the public /demo page).
export function useDemoDiscovery(options?: { randomize?: boolean }) {
  const randomize = options?.randomize ?? false
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [discoveredSubscriptions, setDiscoveredSubscriptions] = useState<DiscoveredSubscription[]>(
    [],
  )
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  const startDiscovery = useCallback(() => {
    clearTimer()
    setDiscoveredSubscriptions([])
    setIsDiscovering(true)

    const delay = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
    timerRef.current = setTimeout(() => {
      setDiscoveredSubscriptions(
        randomize ? generateRandomDiscoveredSubscriptions() : DEMO_DISCOVERED_SUBSCRIPTIONS,
      )
      setIsDiscovering(false)
      timerRef.current = null
    }, delay)
  }, [randomize])

  const clearDiscovery = useCallback(() => {
    clearTimer()
    setIsDiscovering(false)
    setDiscoveredSubscriptions([])
  }, [])

  const retry = useCallback(() => {
    startDiscovery()
  }, [startDiscovery])

  useEffect(() => clearTimer, [])

  return { isDiscovering, discoveredSubscriptions, startDiscovery, clearDiscovery, retry }
}
