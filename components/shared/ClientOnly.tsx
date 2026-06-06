'use client'

import * as React from 'react'

interface ClientOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * ClientOnly wrapper that prevents SSR/hydration mismatches.
 * Use this to wrap components that generate random IDs or use browser-only APIs.
 */
export function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return mounted ? children : fallback
}
