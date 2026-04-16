import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin

  if (code) {
    const supabase = await createClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Error exchanging code for session:', error.message)
        return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
      }

      const rawNext = searchParams.get('next') ?? '/dashboard'
      const next = /^\/[^/\\]/.test(rawNext) ? rawNext : '/dashboard'
      return NextResponse.redirect(`${baseUrl}${next}`)
    } catch (err) {
      console.error('Unexpected error during code exchange:', err)
      return NextResponse.redirect(`${baseUrl}/login?error=Authentication+failed`)
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=No+authorization+code+provided`)
}
