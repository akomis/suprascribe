export function openExternalUrl(url: string | null | undefined) {
  if (!url) return
  window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer')
}

export function buildJustDeleteMeUrl(serviceName: string) {
  // /en instead of / because the root page redirects to a language subpage,
  // which drops the hash the search field reads from
  return `https://justdeleteme.xyz/en#${encodeURIComponent(serviceName.trim().toLowerCase())}`
}

export type UnsubscribeSurface = 'dashboard' | 'public'

export function buildMissingLinkContactHref(serviceName: string, surface: UnsubscribeSurface) {
  const name = serviceName.trim() || 'this service'
  const subject = `Missing unsubscribe link: ${name}`
  const message = `Suprascribe doesn't have an unsubscribe link for ${name}.\n\nIf you know the correct unsubscribe or cancellation page, please paste it below and we'll add it.\n\nLink: `

  const params = new URLSearchParams({ subject, message })
  if (surface === 'dashboard') {
    params.set('category', 'bug_report')
    return `/dashboard/support?${params.toString()}`
  }
  return `/contact?${params.toString()}`
}
