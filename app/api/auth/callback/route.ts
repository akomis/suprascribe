import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

async function handleAuthCallback(
  request: NextRequest,
  code: string | null,
  error: string | null,
  errorDescription: string | null,
  rawNext: string | null,
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || new URL(request.url).origin
  const next = rawNext && /^\/[^/\\]/.test(rawNext) ? rawNext : '/dashboard'

  // Provider returned an error (user denied, etc.)
  if (error) {
    console.error('Auth callback error:', error, errorDescription)
    const errorMsg = errorDescription || 'Authentication failed'
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorMsg)}`)
  }

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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  return handleAuthCallback(
    request,
    searchParams.get('code'),
    searchParams.get('error'),
    searchParams.get('error_description'),
    searchParams.get('next'),
  )
}

// Apple Sign In uses response_mode=form_post, so the callback arrives as a POST
// with an application/x-www-form-urlencoded body instead of query params.
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const getField = (name: string) => {
    const value = formData.get(name)
    return typeof value === 'string' ? value : null
  }
  return handleAuthCallback(
    request,
    getField('code'),
    getField('error'),
    getField('error_description'),
    getField('next'),
  )
}
