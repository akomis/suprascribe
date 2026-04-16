import { useEffect, useState } from 'react'

const logoCache = new Map<string, string | null>()
const inflight = new Map<string, Promise<string | null>>()

const STORE_URL_HOSTNAMES = new Set([
  'apps.apple.com',
  'itunes.apple.com',
  'play.google.com',
  'market.android.com',
])

async function fetchLogoByQuery(query: string): Promise<string | null> {
  if (logoCache.has(query)) return logoCache.get(query)!

  if (!inflight.has(query)) {
    const promise = fetch(`/api/logo?q=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data?.logoUrl as string | null) ?? null)
      .catch(() => null)
      .finally(() => inflight.delete(query))

    promise.then((result) => logoCache.set(query, result))
    inflight.set(query, promise)
  }

  return inflight.get(query)!
}

function buildQueries(serviceName?: string, serviceUrl?: string): string[] {
  const queriesToTry: string[] = []

  if (serviceUrl) {
    try {
      const url = new URL(serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`)
      const hostname = url.hostname.replace('www.', '')
      if (!STORE_URL_HOSTNAMES.has(hostname)) {
        queriesToTry.push(hostname)
      }
    } catch {}
  }

  if (serviceName) {
    const baseName = serviceName.trim().split(' ')[0].toLowerCase()
    const domainGuess = `${baseName}.com`
    if (!queriesToTry.includes(domainGuess)) {
      queriesToTry.push(domainGuess)
    }
    if (!queriesToTry.includes(baseName)) {
      queriesToTry.push(baseName)
    }
  }

  return queriesToTry
}

export async function resolveLogoUrl(
  serviceName?: string,
  serviceUrl?: string,
): Promise<string | null> {
  const queriesToTry = buildQueries(serviceName, serviceUrl)
  if (queriesToTry.length === 0) return null

  for (const query of queriesToTry) {
    const result = await fetchLogoByQuery(query)
    if (result) return result
  }

  return null
}

export function useLogo(serviceName?: string, serviceUrl?: string): string | null {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    resolveLogoUrl(serviceName, serviceUrl).then((result) => {
      if (isMounted) setLogoUrl(result)
    })

    return () => {
      isMounted = false
    }
  }, [serviceName, serviceUrl])

  return logoUrl
}
