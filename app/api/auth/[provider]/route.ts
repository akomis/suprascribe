import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ provider: string }> },
) {
  const supabase = await createClient()
  const { provider } = await context.params

  const origin = request.headers.get('origin') || request.headers.get('referer') || ''
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || origin

  if (provider !== 'azure' && provider !== 'google' && provider !== 'apple') {
    console.error('Unsupported provider:', provider)
    return NextResponse.redirect(`${baseUrl}/login?error=Unsupported+provider`)
  }

  try {
    const options: {
      redirectTo: string
      scopes?: string
      queryParams?: Record<string, string>
    } = {
      redirectTo: `${baseUrl}/api/auth/callback`,
    }

    if (provider === 'azure') {
      options.scopes = 'email openid profile'
    } else if (provider === 'google') {
      options.queryParams = {
        access_type: 'offline',
        prompt: 'consent',
      }
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as 'azure' | 'google' | 'apple',
      options,
    })

    if (error) {
      console.error(`${provider} OAuth error:`, error.message)
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(error.message)}`)
    }

    if (!data.url) {
      return NextResponse.redirect(`${baseUrl}/login?error=Failed+to+generate+OAuth+URL`)
    }

    return NextResponse.redirect(data.url)
  } catch (err) {
    console.error(`Unexpected error during ${provider} OAuth:`, err)
    return NextResponse.redirect(`${baseUrl}/login?error=An+unexpected+error+occurred`)
  }
}
