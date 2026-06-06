import { useEffect, useState } from 'react'
import { STORE_URL_HOSTNAMES } from '@/lib/config/urls'

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

const logoCache = new Map<string, string | null>()
const inflight = new Map<string, Promise<string | null>>()

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

async function resolveLogoUrl(serviceName?: string, serviceUrl?: string): Promise<string | null> {
  const staticPath = getStaticLogo(serviceName, serviceUrl)
  if (staticPath) return staticPath

  const queriesToTry = buildQueries(serviceName, serviceUrl)
  if (queriesToTry.length === 0) return null

  for (const query of queriesToTry) {
    const result = await fetchLogoByQuery(query)
    if (result) return result
  }

  return null
}

export function useLogo(serviceName?: string, serviceUrl?: string): string | null {
  const [logoUrl, setLogoUrl] = useState<string | null>(() =>
    getStaticLogo(serviceName, serviceUrl),
  )

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
