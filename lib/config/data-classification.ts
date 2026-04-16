export const DataProtectionLevel = {
  PUBLIC: 'PUBLIC',
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const

export type DataProtectionLevel = (typeof DataProtectionLevel)[keyof typeof DataProtectionLevel]

export interface DataClassification {
  level: DataProtectionLevel
  description: string
  storageLocation: string
  protectionMechanism: string
}

export const DATA_CLASSIFICATION = {
  OAUTH_CLIENT_SECRETS: {
    level: DataProtectionLevel.CRITICAL,
    description: 'OAuth client secrets for Google, Microsoft, and Apple sign-in',
    storageLocation: 'Server-only environment variables (no NEXT_PUBLIC_ prefix)',
    protectionMechanism: 'Restricted to server runtime; never serialised or returned in responses',
  },

  STRIPE_KEYS: {
    level: DataProtectionLevel.CRITICAL,
    description: 'Stripe secret key and webhook signing secret for payment processing',
    storageLocation: 'Server-only environment variables',
    protectionMechanism: 'Webhook payloads verified with HMAC-SHA256; keys never logged or exposed',
  },

  ENCRYPTION_SECRET: {
    level: DataProtectionLevel.CRITICAL,
    description: 'Master key used to encrypt and decrypt user BYOK API keys at rest',
    storageLocation: 'Server-only environment variable (ENCRYPTION_SECRET)',
    protectionMechanism: 'Used only inside lib/utils/server-crypto.ts; never leaves server memory',
  },

  SUPABASE_SERVICE_ROLE_KEY: {
    level: DataProtectionLevel.CRITICAL,
    description: 'Supabase service role key that bypasses Row Level Security',
    storageLocation: 'Server-only environment variable',
    protectionMechanism: 'Used only in server-side route handlers; never sent to the client',
  },

  USER_API_KEYS_ENCRYPTED: {
    level: DataProtectionLevel.CRITICAL,
    description: 'User-provided LLM provider API keys (BYOK) stored encrypted in the database',
    storageLocation: 'USER_API_KEYS.encrypted_key column',
    protectionMechanism:
      'AES-256-GCM encryption via lib/utils/server-crypto.ts; only the last 4 characters (key_hint) are exposed in the UI',
  },

  MODEL_API_KEY: {
    level: DataProtectionLevel.CRITICAL,
    description: 'Default OpenRouter API key used when the user has no BYOK key configured',
    storageLocation: 'Server-only environment variable (MODEL_API_KEY)',
    protectionMechanism: 'Never returned in API responses or logged',
  },

  SESSION_TOKENS: {
    level: DataProtectionLevel.HIGH,
    description: 'Supabase JWT session tokens that authenticate the current user',
    storageLocation: 'httpOnly, Secure, SameSite=Lax cookies managed by Supabase middleware',
    protectionMechanism:
      'httpOnly prevents JS access; validated on every request via auth.getUser()',
  },

  OAUTH_ACCESS_TOKENS: {
    level: DataProtectionLevel.HIGH,
    description: 'Short-lived OAuth access tokens used during the email discovery flow',
    storageLocation: 'httpOnly cookies with a 60-second TTL',
    protectionMechanism:
      'Never placed in URLs or response bodies; cleared immediately after the OAuth callback',
  },

  OAUTH_STATE_PARAM: {
    level: DataProtectionLevel.HIGH,
    description: 'CSRF state parameter for OAuth flows',
    storageLocation: 'httpOnly cookie, single-use',
    protectionMechanism:
      'Validated with crypto.timingSafeEqual() to prevent timing attacks; deleted after use',
  },

  EMAIL_CONTENT: {
    level: DataProtectionLevel.HIGH,
    description:
      'Raw email subjects and bodies fetched during discovery; may contain PII and financial data',
    storageLocation: 'In-memory only during a single discovery request',
    protectionMechanism:
      'Never written to the database; fetched over TLS; IMAP hostnames validated against an SSRF blocklist; bodies truncated before AI processing',
  },

  IMAP_CREDENTIALS: {
    level: DataProtectionLevel.HIGH,
    description: 'IMAP email and password supplied by the user for custom mail server discovery',
    storageLocation: 'Request body only; never persisted',
    protectionMechanism:
      'Accepted per-request, used once, then discarded; server hostname SSRF-validated before connection',
  },

  USER_SUBSCRIPTION_FINANCIAL: {
    level: DataProtectionLevel.MEDIUM,
    description:
      'Subscription price, currency, payment method, and billing dates in USER_SUBSCRIPTIONS',
    storageLocation:
      'USER_SUBSCRIPTIONS table (price, currency, payment_method, start_date, end_date)',
    protectionMechanism: 'Every query is filtered by user_id; no bulk exposure endpoints',
  },

  USER_SETTINGS: {
    level: DataProtectionLevel.MEDIUM,
    description: 'User tier (BASIC/PRO), active API key reference, and notification preferences',
    storageLocation: 'USER_SETTINGS table',
    protectionMechanism: 'Filtered by user_id; tier field gated behind server-side auth checks',
  },

  STRIPE_WEBHOOK_EVENTS: {
    level: DataProtectionLevel.MEDIUM,
    description: 'Stripe event IDs and customer email used for idempotent tier upgrades',
    storageLocation: 'stripe_webhook_events table',
    protectionMechanism: 'Written only after HMAC-SHA256 signature verification passes',
  },

  DISCOVERY_RUN_AUDIT: {
    level: DataProtectionLevel.LOW,
    description:
      'Audit log of discovery runs: timestamp, provider, email address scanned, subscription count',
    storageLocation: 'DISCOVERY_RUNS table',
    protectionMechanism: 'Filtered by user_id; no email body or token data retained',
  },

  SUBSCRIPTION_SERVICES_CATALOG: {
    level: DataProtectionLevel.PUBLIC,
    description: 'Global catalog of known subscription services: names, URLs, categories, logos',
    storageLocation: 'SUBSCRIPTION_SERVICES table',
    protectionMechanism: 'None required; data is intentionally public',
  },

  FEATURE_FLAGS: {
    level: DataProtectionLevel.PUBLIC,
    description: 'Tier-based feature flag definitions',
    storageLocation: 'lib/config/features.ts (compile-time constants)',
    protectionMechanism: 'None required',
  },
} as const satisfies Record<string, DataClassification>
