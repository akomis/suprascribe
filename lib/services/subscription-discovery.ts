import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { earliestDate } from '@/lib/utils/date'
import { consolidateSubscriptionPeriods } from '@/lib/utils/subscription-period-extension'
import type { ProviderConfig } from './ai-provider'
import { analyzeEmailsBatch, type FailedUnit, type TokenUsage } from './email-analyzer'
import type { ClassificationVerdict } from './charge-classifier'
import {
  countGmailEmails,
  countOutlookEmails,
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
  /** Charges the model read, before the recurrence decision dropped any. */
  chargeCount: number
  /** Analysis units sent to the model. The denominator for failedUnits. */
  unitCount: number
  /** Every merchant group's outcome, drops and reasons included. */
  verdicts: ClassificationVerdict[]
  /** Senders whose analysis failed, so their emails contributed nothing. */
  failedUnits: FailedUnit[]
  /** Recurring subscriptions the normalizer rejected after the classifier kept them. */
  rejectedCount: number
  /** Charges discarded as balance top-ups rather than subscription payments. */
  creditPurchases: number
  /** True when the mailbox held more matching email than the scan cap allows. */
  truncated: boolean
  /** Received date of the oldest email actually scanned, YYYY-MM-DD. */
  oldestEmailDate?: string
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

/** The address being scanned, resolved without touching a single message. */
export async function resolveInboxAddress(input: DiscoveryInput): Promise<string> {
  if (input.provider === 'imap') {
    if (input.credentials.server && isBlockedImapHost(input.credentials.server)) {
      throw new Error('Invalid IMAP server address')
    }
    return input.credentials.email
  }
  if (input.provider === 'google') return fetchGmailProfileEmail(input.credentials.token)
  return fetchOutlookProfileEmail(input.credentials.token)
}

/**
 * How many messages the discovery search matches right now, bodies untouched.
 *
 * Null means "cannot tell cheaply, scan anyway". That is the IMAP case: the
 * real fetch de-duplicates messages that appear in more than one mailbox, and
 * the key it de-duplicates on comes out of the parsed body. A body-free count
 * would therefore be a different number from the one the scan records, which
 * is the number this gets compared against.
 */
export async function countMatchingEmails(input: DiscoveryInput): Promise<number | null> {
  const keywords = EMAIL_DISCOVERY_CONFIG.subjectKeywords

  if (input.provider === 'google') return countGmailEmails(input.credentials.token, keywords)
  if (input.provider === 'microsoft') {
    return countOutlookEmails(input.credentials.token, EMAIL_DISCOVERY_CONFIG.outlookSubjectTokens)
  }
  return null
}

export async function discover(
  input: DiscoveryInput,
  knownEmail?: string,
): Promise<DiscoveryResult> {
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
    // The orchestrator resolves the address before the scan to size the
    // mailbox, so reuse it rather than paying for the profile call twice.
    email = knownEmail ?? (await fetchGmailProfileEmail(input.credentials.token))
    rawEmails = await fetchGmailEmails(input.credentials.token, keywords)
  } else {
    email = knownEmail ?? (await fetchOutlookProfileEmail(input.credentials.token))
    // Graph gets single-word tokens rather than the shared phrase list - see the
    // note on outlookSubjectTokens for why phrases cannot be quoted safely here.
    rawEmails = await fetchOutlookEmails(
      input.credentials.token,
      EMAIL_DISCOVERY_CONFIG.outlookSubjectTokens,
    )
  }

  if (rawEmails.length === 0) {
    return {
      subscriptions: [],
      emailCount: 0,
      email,
      usage: { inputTokens: 0, outputTokens: 0 },
      chargeCount: 0,
      unitCount: 0,
      verdicts: [],
      failedUnits: [],
      rejectedCount: 0,
      creditPurchases: 0,
      truncated: false,
    }
  }

  // The fetchers stop at the cap, so hitting it exactly means the mailbox held
  // more. Worth surfacing: the cap keeps the NEWEST matches, so a heavy inbox
  // silently loses its older history and every start date shifts forward.
  const truncated = rawEmails.length >= EMAIL_DISCOVERY_CONFIG.maxEmailsPerProvider
  const oldestEmailDate = earliestDate(rawEmails.map((mail) => mail.date))

  const {
    subscriptions: discovered,
    verdicts,
    chargeCount,
    unitCount,
    failedUnits,
    rejectedCount,
    creditPurchases,
    totalUsage,
  } = await analyzeEmailsBatch(
    rawEmails,
    input.byokConfig ? { byokConfig: input.byokConfig } : undefined,
  )

  const consolidated = consolidateSubscriptionPeriods(discovered)
  const sorted = consolidated.sort((a, b) => {
    const nameCompare = a.service_name.localeCompare(b.service_name)
    return nameCompare !== 0 ? nameCompare : a.price - b.price
  })

  return {
    subscriptions: sorted,
    emailCount: rawEmails.length,
    email,
    usage: totalUsage,
    chargeCount,
    unitCount,
    verdicts,
    failedUnits,
    rejectedCount,
    creditPurchases,
    truncated,
    oldestEmailDate,
  }
}
