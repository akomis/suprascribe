import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { hasFeatureAccess } from '@/lib/config/features'
import { analyzeEmailsBatch, mergeSubscriptions } from '@/lib/services/email-analyzer'
import { fetchGmailEmails, fetchImapEmails, fetchOutlookEmails } from '@/lib/services/email-fetcher'
import { createClient } from '@/lib/supabase/server'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { checkRateLimit } from '@/lib/utils/discovery-rate-limit'
import { extendAutoRenewingSubscriptions } from '@/lib/utils/subscription-period-extension'
import { getBYOKConfig } from '@/app/api/user/api-keys/route'
import { getPostHogClient } from '@/lib/posthog-server'
import { NextRequest, NextResponse } from 'next/server'

function isBlockedImapHost(host: string): boolean {
  const h = host.trim().toLowerCase()

  if (h.includes('://')) return true

  if (h === 'localhost' || h === '::1' || h.startsWith('127.')) return true

  if (h.startsWith('169.254.')) return true

  if (h.startsWith('10.')) return true
  if (h.startsWith('192.168.')) return true
  const parts = h.split('.')
  if (parts.length === 4) {
    const second = parseInt(parts[1], 10)
    if (parts[0] === '172' && second >= 16 && second <= 31) return true
  }

  if (h === 'metadata.google.internal') return true

  return false
}

type Provider = 'google' | 'microsoft' | 'imap'

interface GoogleMicrosoftRequestBody {
  token: string
}

interface ImapRequestBody {
  credentials: {
    email: string
    password: string
    server?: string
    port?: number
    useTls?: boolean
  }
}

type RequestBody = GoogleMicrosoftRequestBody | ImapRequestBody

interface DiscoverySuccessResponse {
  success: true
  subscriptions: DiscoveredSubscription[]
  emailCount: number
  email: string
}

interface DiscoveryWarningResponse {
  success: false
  warning: string
}

interface DiscoveryErrorResponse {
  success: false
  error: string
}

type DiscoveryResponse =
  | DiscoverySuccessResponse
  | DiscoveryWarningResponse
  | DiscoveryErrorResponse

async function getGoogleEmail(token: string): Promise<string> {
  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error('Failed to get Google email address')
  }
  const data = await response.json()
  return data.emailAddress
}

async function getMicrosoftEmail(token: string): Promise<string> {
  const response = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error('Failed to get Microsoft email address')
  }
  const data = await response.json()
  return data.mail || data.userPrincipalName
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
): Promise<NextResponse<DiscoveryResponse>> {
  const startTime = Date.now()

  const { provider } = await params

  if (!['google', 'microsoft', 'imap'].includes(provider)) {
    return NextResponse.json({ success: false, error: `Invalid provider: ${provider}` })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({
      success: false,
      error: 'Unauthorized. Please log in to use email discovery.',
    })
  }

  const byokConfig = await getBYOKConfig(user.id)
  const isByokMode = !!byokConfig

  if (!isByokMode) {
    const { data: userSettings } = await supabase
      .from('USER_SETTINGS')
      .select('tier')
      .eq('user_id', user.id)
      .single()

    const userTier = userSettings?.tier || 'BASIC'
    if (!hasFeatureAccess(userTier, 'auto_discovery')) {
      return NextResponse.json({
        success: false,
        error: 'Auto-discovery requires a Pro subscription or your own API key (BYOK).',
      })
    }
  }

  const body: RequestBody = await request.json()

  if (provider === 'imap') {
    const imapBody = body as ImapRequestBody
    if (!imapBody.credentials?.email || !imapBody.credentials?.password) {
      return NextResponse.json({ success: false, error: 'Missing required credentials for IMAP' })
    }
    if (imapBody.credentials.server && isBlockedImapHost(imapBody.credentials.server)) {
      return NextResponse.json({ success: false, error: 'Invalid IMAP server address' })
    }
  } else {
    const oauthBody = body as GoogleMicrosoftRequestBody
    if (!oauthBody.token) {
      return NextResponse.json({ success: false, error: `Missing access token for ${provider}` })
    }
  }

  let discoveryEmail: string
  try {
    switch (provider as Provider) {
      case 'google': {
        const { token } = body as GoogleMicrosoftRequestBody
        discoveryEmail = await getGoogleEmail(token)
        break
      }
      case 'microsoft': {
        const { token } = body as GoogleMicrosoftRequestBody
        discoveryEmail = await getMicrosoftEmail(token)
        break
      }
      case 'imap': {
        const { credentials } = body as ImapRequestBody
        discoveryEmail = credentials.email
        break
      }
      default:
        throw new Error('Invalid provider')
    }
  } catch (emailError) {
    const errorMessage =
      emailError instanceof Error ? emailError.message : 'Failed to get email address'
    return NextResponse.json({ success: false, error: errorMessage })
  }

  if (!isByokMode) {
    const { data: existingRuns, error: runsError } = await supabase
      .from('DISCOVERY_RUNS')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_byok', false)

    if (runsError) {
      console.error('[Discovery] Error fetching discovery runs:', runsError)
      return NextResponse.json({ success: false, error: 'Failed to check rate limits' })
    }

    const rateLimitCheck = checkRateLimit(existingRuns || [])
    if (!rateLimitCheck.canDiscover) {
      const posthog = getPostHogClient()
      posthog.capture({
        distinctId: user.id,
        event: 'discovery_rate_limit_hit',
        properties: { provider, reason: rateLimitCheck.reason },
      })
      await posthog.shutdown()
      return NextResponse.json({
        success: false,
        warning: rateLimitCheck.reason || 'Rate limit exceeded',
      })
    }
  }

  const posthogStart = getPostHogClient()
  posthogStart.capture({
    distinctId: user.id,
    event: 'discovery_started',
    properties: { provider, is_byok: isByokMode },
  })
  await posthogStart.shutdown()

  const keywords = EMAIL_DISCOVERY_CONFIG.subjectKeywords
  let emails: Array<{ subject: string; body: string; from: string; date: string }>

  try {
    switch (provider as Provider) {
      case 'google': {
        const { token } = body as GoogleMicrosoftRequestBody
        emails = await fetchGmailEmails(token, keywords)
        break
      }
      case 'microsoft': {
        const { token } = body as GoogleMicrosoftRequestBody
        emails = await fetchOutlookEmails(token, keywords)
        break
      }
      case 'imap': {
        const { credentials } = body as ImapRequestBody
        emails = await fetchImapEmails(credentials, keywords)
        break
      }
      default:
        throw new Error('Invalid provider')
    }

    console.log(`[Discovery] ${provider} | Fetched ${emails.length} emails`)
  } catch (fetchError) {
    const errorMessage = fetchError instanceof Error ? fetchError.message : 'Failed to fetch emails'
    const posthog = getPostHogClient()
    posthog.capture({
      distinctId: user.id,
      event: 'discovery_failed',
      properties: { provider, error: errorMessage, is_byok: isByokMode },
    })
    await posthog.shutdown()
    return NextResponse.json({ success: false, error: errorMessage })
  }

  if (emails.length === 0) {
    return NextResponse.json({
      success: true,
      subscriptions: [],
      emailCount: 0,
      email: discoveryEmail,
    })
  }

  const { subscriptions: discoveredSubscriptions, totalUsage } = await analyzeEmailsBatch(
    emails.map((email) => ({
      subject: email.subject,
      body: email.body,
      from: email.from,
    })),
    undefined,
    byokConfig ? { byokConfig } : undefined,
  )

  const mergedSubscriptions = mergeSubscriptions(discoveredSubscriptions)

  const extendedSubscriptions = extendAutoRenewingSubscriptions(mergedSubscriptions)

  const uniqueSubscriptions = extendedSubscriptions.sort((a, b) => {
    const nameCompare = a.service_name.localeCompare(b.service_name)
    if (nameCompare !== 0) return nameCompare
    return a.price - b.price
  })

  const duration = Date.now() - startTime

  const { inputCostPerMillion, outputCostPerMillion } = EMAIL_DISCOVERY_CONFIG.analysisModel
  const totalCost =
    (totalUsage.inputTokens / 1_000_000) * inputCostPerMillion +
    (totalUsage.outputTokens / 1_000_000) * outputCostPerMillion

  const modeLabel = isByokMode ? 'BYOK' : 'default'
  console.log(
    `[Discovery] ${provider} (${modeLabel}) | ✓ ${uniqueSubscriptions.length}/${emails.length} subs | ${(duration / 1000).toFixed(1)}s | $${totalCost.toFixed(4)}`,
  )

  const { error: insertError } = await supabase.from('DISCOVERY_RUNS').insert({
    user_id: user.id,
    email_address: discoveryEmail,
    provider: provider,
    discovered_at: new Date().toISOString(),
    subscriptions_found: uniqueSubscriptions.length,
    is_byok: isByokMode,
  })

  if (insertError) {
    console.error('[Discovery] Error recording discovery run:', insertError)
  }

  const posthogComplete = getPostHogClient()
  posthogComplete.capture({
    distinctId: user.id,
    event: 'discovery_completed',
    properties: {
      provider,
      is_byok: isByokMode,
      emails_scanned: emails.length,
      subscriptions_found: uniqueSubscriptions.length,
      duration_ms: duration,
      input_tokens: totalUsage.inputTokens,
      output_tokens: totalUsage.outputTokens,
      cost_usd: parseFloat(totalCost.toFixed(6)),
      model: isByokMode ? byokConfig?.model : EMAIL_DISCOVERY_CONFIG.analysisModel.modelName,
    },
  })
  await posthogComplete.shutdown()

  return NextResponse.json({
    success: true,
    subscriptions: uniqueSubscriptions,
    emailCount: emails.length,
    email: discoveryEmail,
  })
}
