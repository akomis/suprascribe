import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin
  const rawNext = searchParams.get('next') ?? '/dashboard'
  const next = /^\/[^/\\]/.test(rawNext) ? rawNext : '/dashboard'

  // Handle error cases (expired OTP, access denied, etc.)
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    const errorMsg = errorDescription || 'Authentication failed'
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorMsg)}`)
  }

  // No code provided
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=No+authorization+code+provided`)
  }

  const supabase = await createClient()

  try {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError.message)
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(exchangeError.message)}`,
      )
    }

    return NextResponse.redirect(`${baseUrl}${next}`)
  } catch (err) {
    console.error('Unexpected error during code exchange:', err)
    return NextResponse.redirect(`${baseUrl}/login?error=Authentication+failed`)
  }
}
