import { timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

function getCookieValue(request: NextRequest, name: string): string | null {
  return request.cookies.get(name)?.value ?? null
}

async function handleOAuthCallback(
  request: NextRequest,
  provider: string,
  code: string | null,
  state: string | null,
  error: string | null,
) {
  const origin = process.env.NEXT_PUBLIC_BASE_URL as string

  if (error) {
    console.error(`${provider} OAuth error:`, error)
    return NextResponse.redirect(`${origin}/dashboard?error=oauth_denied`)
  }

  const savedState = getCookieValue(request, 'discovery_state')
  const stateValid =
    !!state &&
    !!savedState &&
    state.length === savedState.length &&
    timingSafeEqual(Buffer.from(state), Buffer.from(savedState))
  if (!stateValid) {
    console.error('Invalid or missing state parameter')
    return NextResponse.redirect(`${origin}/dashboard?error=invalid_state`)
  }

  if (!code) {
    console.error('No authorization code provided')
    return NextResponse.redirect(`${origin}/dashboard?error=no_code`)
  }

  try {
    let clientId: string | undefined
    let clientSecret: string | undefined
    let tokenUrl: string
    const extraBody: Record<string, string> = {}

    switch (provider) {
      case 'google':
        clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
        clientSecret = process.env.GOOGLE_CLIENT_SECRET
        tokenUrl = 'https://oauth2.googleapis.com/token'
        break
      case 'microsoft':
        clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
        clientSecret = process.env.MICROSOFT_CLIENT_SECRET
        tokenUrl = 'https://login.microsoftonline.com/consumers/oauth2/v2.0/token'
        extraBody.scope =
          'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read'
        break
      case 'apple':
        clientId = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID
        clientSecret = process.env.APPLE_CLIENT_SECRET
        tokenUrl = 'https://appleid.apple.com/auth/token'
        break
      default:
        console.error('Unsupported provider:', provider)
        return NextResponse.redirect(`${origin}/dashboard?error=unsupported_provider`)
    }

    if (!clientId || !clientSecret) {
      console.error(`${provider} OAuth credentials not configured`)
      return NextResponse.redirect(`${origin}/dashboard?error=config_error`)
    }

    const redirectUri = `${origin}/api/discovery/callback/${provider}`

    const body = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      ...extraBody,
    } as Record<string, string>)

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(`${origin}/dashboard?error=token_exchange_failed`)
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token as string | undefined

    if (!accessToken) {
      console.error('No access token in response')
      return NextResponse.redirect(`${origin}/dashboard?error=no_access_token`)
    }

    const response = NextResponse.redirect(`${origin}/dashboard?discover=true`)

    response.cookies.set(`discovery_token_${provider}`, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60,
    })

    response.cookies.set('discovery_state', '', {
      path: '/',
      maxAge: 0,
    })

    return response
  } catch (err) {
    console.error('Error in OAuth callback:', err)
    return NextResponse.redirect(`${origin}/dashboard?error=server_error`)
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params
  const code = request.nextUrl.searchParams.get('code')
  const state = request.nextUrl.searchParams.get('state')
  const error = request.nextUrl.searchParams.get('error')

  return handleOAuthCallback(request, provider, code, state, error)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params
  const formData = await request.formData()
  const code = formData.get('code') as string | null
  const state = formData.get('state') as string | null
  const error = formData.get('error') as string | null

  return handleOAuthCallback(request, provider, code, state, error)
}
