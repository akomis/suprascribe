import { useCallback, useEffect, useState } from 'react'
import { PAYMENT_PROCESSOR_HOSTNAMES, STORE_URL_HOSTNAMES } from '@/lib/config/urls'

const STATIC_LOGOS: Record<string, string> = {
  'netflix.com': '/logos/netflix.svg',
  'spotify.com': '/logos/spotify.svg',
  'disneyplus.com': '/logos/disneyplus.svg',
  'tv.apple.com': '/logos/apple-tv.svg',
  'youtube.com': '/logos/youtube.svg',
  'amazon.com': '/logos/amazon.svg',
  'adobe.com': '/logos/adobe.svg',
  'microsoft.com': '/logos/microsoft.svg',
  'dropbox.com': '/logos/dropbox.svg',
  'github.com': '/logos/github.svg',
  'slack.com': '/logos/slack.svg',
  'figma.com': '/logos/figma.svg',
  'notion.so': '/logos/notion.svg',
  'linear.app': '/logos/linear.svg',
  'namecheap.com': '/logos/namecheap.svg',
}

/** A logo request that never settles must not leave the UI stuck on a skeleton. */
const LOGO_LOAD_TIMEOUT_MS = 8000

const candidateCache = new Map<string, string[]>()
const inflight = new Map<string, Promise<string[]>>()

async function fetchCandidates(queries: string[]): Promise<string[]> {
  const cacheKey = queries.join('|')
  const cached = candidateCache.get(cacheKey)
  if (cached) return cached

  let promise = inflight.get(cacheKey)

  if (!promise) {
    const params = new URLSearchParams()
    queries.forEach((query) => params.append('q', query))

    promise = fetch(`/api/logo?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (Array.isArray(data?.logoUrls) ? (data.logoUrls as string[]) : []))
      .catch(() => [])
      .finally(() => inflight.delete(cacheKey))

    promise.then((result) => candidateCache.set(cacheKey, result))
    inflight.set(cacheKey, promise)
  }

  return promise
}

function buildQueries(serviceName?: string, serviceUrl?: string): string[] {
  const queriesToTry: string[] = []
  let processorHostname: string | null = null

  if (serviceUrl) {
    try {
      const url = new URL(serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`)
      const hostname = url.hostname.replace('www.', '')
      if (PAYMENT_PROCESSOR_HOSTNAMES.has(hostname)) {
        processorHostname = hostname
      } else if (!STORE_URL_HOSTNAMES.has(hostname)) {
        queriesToTry.push(hostname)
      }
    } catch {}
  }

  if (serviceName) {
    const domainGuess = `${serviceName.trim().split(' ')[0].toLowerCase()}.com`
    if (!queriesToTry.includes(domainGuess)) {
      queriesToTry.push(domainGuess)
    }
  }

  // Last resort only: the processor's own logo beats no logo, but never the service's.
  if (processorHostname && !queriesToTry.includes(processorHostname)) {
    queriesToTry.push(processorHostname)
  }

  return queriesToTry
}

function getStaticLogo(serviceName?: string, serviceUrl?: string): string | null {
  if (serviceUrl) {
    try {
      const hostname = new URL(
        serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`,
      ).hostname.replace('www.', '')
      if (STATIC_LOGOS[hostname]) return STATIC_LOGOS[hostname]
    } catch {}
  }
  if (serviceName) {
    const guess = `${serviceName.trim().split(' ')[0].toLowerCase()}.com`
    if (STATIC_LOGOS[guess]) return STATIC_LOGOS[guess]
  }
  return null
}

export type LogoState = {
  /** Current candidate to render, or null once every candidate has failed. */
  src: string | null
  /** True while candidates are being resolved or the current one is still loading. */
  isLoading: boolean
  onLoad: () => void
  /** Advances to the next candidate; exhausting them settles `src` at null. */
  onError: () => void
}

export function useLogo(serviceName?: string, serviceUrl?: string): LogoState {
  const [candidates, setCandidates] = useState<string[] | null>(() => {
    const staticPath = getStaticLogo(serviceName, serviceUrl)
    return staticPath ? [staticPath] : null
  })
  const [index, setIndex] = useState(0)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  useEffect(() => {
    setIndex(0)
    setIsImageLoaded(false)

    const staticPath = getStaticLogo(serviceName, serviceUrl)
    if (staticPath) {
      setCandidates([staticPath])
      return
    }

    const queries = buildQueries(serviceName, serviceUrl)
    if (queries.length === 0) {
      setCandidates([])
      return
    }

    setCandidates(null)

    let isMounted = true
    fetchCandidates(queries).then((result) => {
      if (isMounted) setCandidates(result)
    })

    return () => {
      isMounted = false
    }
  }, [serviceName, serviceUrl])

  const onLoad = useCallback(() => setIsImageLoaded(true), [])
  const onError = useCallback(() => {
    setIsImageLoaded(false)
    setIndex((current) => current + 1)
  }, [])

  const src = candidates && index < candidates.length ? candidates[index] : null
  const isExhausted = candidates !== null && index >= candidates.length

  useEffect(() => {
    if (!src || isImageLoaded) return

    const timer = setTimeout(() => setIndex((current) => current + 1), LOGO_LOAD_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [src, isImageLoaded])

  return {
    src,
    isLoading: !isExhausted && !isImageLoaded,
    onLoad,
    onError,
  }
}
