export const EMAIL_DISCOVERY_CONFIG = {
  subjectKeywords: [
    'receipt',
    'invoice',
    'payment confirmation',
    'billing statement',
    'subscription',
    'renewal',
    'membership',
    'monthly charge',
    'auto-renewal',
    'recurring payment',
    'order confirmation',
  ],

  // Microsoft Graph's $search takes ONE KQL expression wrapped in a single pair
  // of quotes, so a multi-word value like "payment confirmation" would need
  // quotes nested inside that quoted string - a case Graph does not document.
  // Single tokens sidestep the escaping question entirely and match strictly
  // more: `subject:payment` already covers every subject containing "payment
  // confirmation". Kept as its own list rather than derived from subjectKeywords
  // so the noisiest fragments ("order", "confirmation") can be left out.
  outlookSubjectTokens: [
    'receipt',
    'invoice',
    'payment',
    'billing',
    'statement',
    'subscription',
    'renewal',
    'membership',
    'recurring',
    'charge',
  ],

  // Senders whose mail is billing mail regardless of what the subject says.
  // A receipt routed through a checkout host often carries the merchant's own
  // subject line ("Your Acme order"), which no keyword list would match.
  billingSenderDomains: [
    'stripe.com',
    'paddle.com',
    'paddle.net',
    'chargebee.com',
    'recurly.com',
    'lemonsqueezy.com',
    'gumroad.com',
    'fastspring.com',
    'creem.io',
    'polar.sh',
    'paypal.com',
    'apple.com',
    'google.com',
  ],

  // How far back to search. Without a window the cap below truncates at an
  // arbitrary point in history rather than bounding a period, so two scans of
  // the same inbox could cover different spans.
  lookbackMonths: 24,

  maxEmailsPerProvider: 1_500,

  analysisModel: {
    provider: 'OpenRouter',
    modelName: 'google/gemini-2.5-flash-lite',
    temperature: 0,
    inputCostPerMillion: 0.1,
    outputCostPerMillion: 0.4,
    // This model's documented output ceiling. Keep in step with modelName:
    // set too low it truncates mid-JSON, and a provider rejects it if too high.
    maxOutputTokens: 65_535,
  },

  batch: {
    // Chunking exists only to stay inside the model's context window. Sender
    // groups are never split, so a single oversized sender may exceed this.
    maxInputTokensPerChunk: 100_000,
    // Token budget for a single email body, or null to send bodies in full.
    // Trimming risks cutting the billing details out of a long receipt; not
    // trimming means far more input tokens and more chunks per scan.
    maxBodyTokensPerEmail: null as number | null,
  },
} as const

export interface SearchQueryOptions {
  /** Sender domains treated as billing mail whatever the subject says. */
  senders?: readonly string[]
  /** Oldest message to consider. Omit to search all history. */
  since?: Date
}

/** Gmail wants YYYY/MM/DD; Outlook KQL and IMAP want ISO or a Date. */
function toGmailDate(date: Date): string {
  return `${date.getUTCFullYear()}/${date.getUTCMonth() + 1}/${date.getUTCDate()}`
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/** The date `lookbackMonths` before now, which bounds every provider search. */
export function searchWindowStart(now: Date = new Date()): Date {
  const since = new Date(now)
  since.setMonth(since.getMonth() - EMAIL_DISCOVERY_CONFIG.lookbackMonths)
  return since
}

/**
 * Builds the provider-native search expression.
 *
 * Gmail and Outlook disagree about quoting, and getting Outlook's wrong is
 * silent: Graph accepts the request and free-text-searches for the literal
 * string rather than erroring, so a malformed query reads as "this inbox has no
 * receipts". The Outlook branch therefore returns the whole KQL expression
 * already wrapped in its single pair of quotes, ready to be URL-encoded as the
 * $search value - callers must not add quotes of their own.
 *
 * Subject and sender clauses are OR-ed together, then the date window is AND-ed
 * across the lot, so a receipt qualifies on either signal but never falls
 * outside the window.
 */
export function buildSearchQuery(
  keywords: readonly string[],
  provider: 'gmail' | 'outlook' | 'imap',
  options: SearchQueryOptions = {},
): string {
  const { senders = [], since } = options

  switch (provider) {
    case 'gmail': {
      const clauses = [
        ...keywords.map((kw) => `subject:"${kw}"`),
        ...senders.map((domain) => `from:${domain}`),
      ]
      if (clauses.length === 0) return 'subject:receipt'

      const grouped = clauses.length > 1 ? `(${clauses.join(' OR ')})` : clauses[0]

      return since ? `${grouped} after:${toGmailDate(since)}` : grouped
    }
    case 'outlook': {
      const clauses = [
        ...keywords.map((kw) => `subject:${kw}`),
        ...senders.map((domain) => `from:${domain}`),
      ]
      if (clauses.length === 0) return '"subject:receipt"'

      const grouped = clauses.length > 1 ? `(${clauses.join(' OR ')})` : clauses[0]
      const withWindow = since ? `${grouped} AND received>=${toIsoDate(since)}` : grouped

      return `"${withWindow}"`
    }
    case 'imap':
      return keywords.map((kw) => `SUBJECT "${kw}"`).join(' OR ')
    default:
      return keywords[0] || 'receipt'
  }
}

/**
 * Placeholder written into a teaser row's NOT NULL text columns while its scan
 * is still running. A row carrying this is a reservation rather than a result:
 * it holds the user's single free-scan slot for the length of the scan, so two
 * concurrent scans cannot both see "no teaser yet" and then collide on
 * DISCOVERY_TEASERS_user_id_key once they finish.
 */
export const TEASER_RESERVED = '__reserved__'

/**
 * How long a reservation is honoured. A scan killed mid-flight (function
 * timeout, deploy) leaves its row behind, and without an expiry the user would
 * lose their free scan for good. Comfortably longer than the slowest scan.
 */
export const TEASER_RESERVATION_TIMEOUT_MS = 15 * 60 * 1000
