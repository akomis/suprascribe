import { createClient } from '@/lib/supabase/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin

  // Debug logging
  console.log('[Auth Confirm] Request URL:', request.url)
  console.log('[Auth Confirm] Params:', {
    token_hash: token_hash ? 'present' : null,
    type,
    code: code ? 'present' : null,
    next,
  })

  const supabase = await createClient()

  // Check if we already have a session (e.g., from /auth/v1/verify redirect)
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  console.log('[Auth Confirm] Session check:', {
    hasSession: !!sessionData.session,
    error: sessionError?.message,
  })

  if (sessionData.session) {
    console.log('[Auth Confirm] Existing session found, redirecting to:', next)
    return NextResponse.redirect(`${baseUrl}${next}`)
  }

  // Handle explicit token_hash + type verification
  if (token_hash && type) {
    console.log('[Auth Confirm] Verifying OTP with token_hash...')
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })

    if (!error) {
      console.log('[Auth Confirm] OTP verified, redirecting to:', next)
      return NextResponse.redirect(`${baseUrl}${next}`)
    }

    console.error('[Auth Confirm] OTP verification error:', error.message)
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Invalid or expired link. Please try again.')}`,
    )
  }

  // Handle PKCE code exchange (from /auth/v1/verify redirects)
  if (code) {
    console.log('[Auth Confirm] Exchanging code for session...')
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      console.log('[Auth Confirm] Code exchanged, redirecting to:', next)
      return NextResponse.redirect(`${baseUrl}${next}`)
    }

    console.error('[Auth Confirm] Code exchange error:', error.message)
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Invalid or expired link. Please try again.')}`,
    )
  }

  // No valid auth params found
  console.error('[Auth Confirm] No valid auth params found')
  return NextResponse.redirect(`${baseUrl}/login?error=Invalid+link`)
}
