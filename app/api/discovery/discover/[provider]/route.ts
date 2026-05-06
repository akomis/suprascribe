import type { ImapCredentials } from '@/lib/services/subscription-discovery'
import { runDiscovery } from '@/lib/services/discovery-orchestrator'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import { NextRequest, NextResponse } from 'next/server'

interface OAuthRequestBody {
  token: string
}

interface ImapRequestBody {
  credentials: ImapCredentials
}

type RequestBody = OAuthRequestBody | ImapRequestBody

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<NextResponse<DiscoveryResponse>> {
  const { provider } = await params

  if (!['google', 'microsoft', 'imap'].includes(provider)) {
    return NextResponse.json({
      success: false,
      kind: 'validation_error',
      error: `Invalid provider: ${provider}`,
    })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({
      success: false,
      kind: 'auth_failed',
      error: 'Unauthorized. Please log in to use email discovery.',
    })
  }

  const body: RequestBody = await request.json()

  if (provider === 'imap') {
    const { credentials } = body as ImapRequestBody
    if (!credentials?.email || !credentials?.password) {
      return NextResponse.json({
        success: false,
        kind: 'validation_error',
        error: 'Missing required credentials for IMAP',
      })
    }
  } else {
    if (!(body as OAuthRequestBody).token) {
      return NextResponse.json({
        success: false,
        kind: 'validation_error',
        error: `Missing access token for ${provider}`,
      })
    }
  }

  const input =
    provider === 'imap'
      ? { provider: 'imap' as const, credentials: (body as ImapRequestBody).credentials }
      : {
          provider: provider as 'google' | 'microsoft',
          token: (body as OAuthRequestBody).token,
        }

  // Use service role for discovery orchestrator to access USER_TIERS
  const supabaseAdmin = createServiceClient()
  const result = await runDiscovery(supabaseAdmin, user.id, input)
  return NextResponse.json(result)
}
