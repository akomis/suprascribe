'use client'

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // sw.js is cache-first over /_next/static, which pins stale chunks in development.
    // Tear down any registration left behind on a dev origin instead of installing one.
    if (process.env.NODE_ENV !== 'production') {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => registrations.forEach((registration) => registration.unregister()))
        .catch(() => {})
      caches?.keys?.().then((keys) => keys.forEach((key) => caches.delete(key)))
      return
    }

    // updateViaCache: 'none' keeps the browser from serving the worker script
    // out of the HTTP cache, so update checks always hit the network.
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => {})
  }, [])

  return null
}
