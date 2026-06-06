import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { extendAutoRenewingSubscriptions } from '@/lib/utils/subscription-period-extension'
import type { ProviderConfig } from './ai-provider'
import { analyzeEmailsBatch, type TokenUsage } from './email-analyzer'
import {
  fetchGmailEmails,
  fetchGmailProfileEmail,
  fetchOutlookEmails,
  fetchOutlookProfileEmail,
  fetchImapEmails,
} from './email-fetcher'

type _Provider = 'google' | 'microsoft' | 'imap'

export interface OAuthCredentials {
  token: string
}

export interface ImapCredentials {
  email: string
  password: string
  server?: string
  port?: number
  useTls?: boolean
}

export type DiscoveryInput =
  | { provider: 'google' | 'microsoft'; credentials: OAuthCredentials; byokConfig?: ProviderConfig }
  | { provider: 'imap'; credentials: ImapCredentials; byokConfig?: ProviderConfig }

export interface DiscoveryResult {
  subscriptions: DiscoveredSubscription[]
  emailCount: number
  email: string
  usage: TokenUsage
}

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

export async function discover(input: DiscoveryInput): Promise<DiscoveryResult> {
  const keywords = EMAIL_DISCOVERY_CONFIG.subjectKeywords
  let email: string
  let rawEmails: Awaited<ReturnType<typeof fetchGmailEmails>>

  if (input.provider === 'imap') {
    const { credentials } = input
    if (credentials.server && isBlockedImapHost(credentials.server)) {
      throw new Error('Invalid IMAP server address')
    }
    email = credentials.email
    rawEmails = await fetchImapEmails(credentials, keywords)
  } else if (input.provider === 'google') {
    email = await fetchGmailProfileEmail(input.credentials.token)
    rawEmails = await fetchGmailEmails(input.credentials.token, keywords)
  } else {
    email = await fetchOutlookProfileEmail(input.credentials.token)
    rawEmails = await fetchOutlookEmails(input.credentials.token, keywords)
  }

  console.log(`[Discovery] ${input.provider} | Fetched ${rawEmails.length} emails`)

  if (rawEmails.length === 0) {
    return { subscriptions: [], emailCount: 0, email, usage: { inputTokens: 0, outputTokens: 0 } }
  }

  const { subscriptions: discovered, totalUsage } = await analyzeEmailsBatch(
    rawEmails,
    input.byokConfig ? { byokConfig: input.byokConfig } : undefined,
  )

  const extended = extendAutoRenewingSubscriptions(discovered)
  const sorted = extended.sort((a, b) => {
    const nameCompare = a.service_name.localeCompare(b.service_name)
    return nameCompare !== 0 ? nameCompare : a.price - b.price
  })

  return { subscriptions: sorted, emailCount: rawEmails.length, email, usage: totalUsage }
}
