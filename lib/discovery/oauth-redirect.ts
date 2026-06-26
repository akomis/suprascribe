// Shared client-side OAuth kickoff for email discovery. Sets the CSRF state
// cookie and an optional flow marker so the callback knows where to return the
// user (dashboard discovery vs. the anonymous one-time "/one-time-scan" funnel).
export type DiscoveryFlow = 'dashboard' | 'once'

export function redirectToOAuth(config: {
  authBaseUrl: string
  clientId: string
  redirectPath: string
  scope: string
  flow?: DiscoveryFlow
  extraParams?: Record<string, string>
}) {
  const url = new URL(config.authBaseUrl)
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', `${window.location.origin}${config.redirectPath}`)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', config.scope)
  for (const [k, v] of Object.entries(config.extraParams ?? {})) url.searchParams.set(k, v)

  const state = crypto.randomUUID()
  document.cookie = `discovery_state=${state}; path=/; max-age=300; SameSite=Lax`
  if (config.flow) {
    document.cookie = `discovery_flow=${config.flow}; path=/; max-age=300; SameSite=Lax`
  }
  url.searchParams.set('state', state)
  window.location.href = url.toString()
}
