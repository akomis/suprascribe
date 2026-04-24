import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const provider = request.nextUrl.searchParams.get('provider')

  if (!provider || !['google', 'microsoft'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 })
  }

  const cookieName = `discovery_token_${provider}`
  const token = request.cookies.get(cookieName)?.value

  if (!token) {
    return NextResponse.json({ error: 'No token found' }, { status: 404 })
  }

  const response = NextResponse.json({ token })
  response.cookies.set(cookieName, '', {
    path: '/',
    maxAge: 0,
  })

  return response
}
