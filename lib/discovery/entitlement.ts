import { decryptApiKey, encryptApiKey } from '@/lib/utils/server-crypto'

// Proof-of-payment for the anonymous one-time discovery funnel. The payload is
// AES-256-GCM encrypted (tamper-proof + opaque) and stored in an httpOnly cookie.
export const ENTITLEMENT_COOKIE = 'discovery_entitlement'
const TTL_MS = 15 * 60 * 1000

interface EntitlementPayload {
  v: 1
  pi: string // Stripe payment_intent id
  sid: string // Stripe checkout session id
  exp: number // epoch ms
}

export function mintEntitlement(pi: string, sid: string): string {
  const payload: EntitlementPayload = { v: 1, pi, sid, exp: Date.now() + TTL_MS }
  return encryptApiKey(JSON.stringify(payload))
}

// Returns the payload if the cookie is valid and unexpired, otherwise null.
// Never throws - a tampered/garbage cookie decrypts with a failure and is rejected.
export function readEntitlement(cookieValue: string | undefined): EntitlementPayload | null {
  if (!cookieValue) return null
  try {
    const parsed = JSON.parse(decryptApiKey(cookieValue)) as EntitlementPayload
    if (parsed.v !== 1 || !parsed.pi || typeof parsed.exp !== 'number') return null
    if (parsed.exp <= Date.now()) return null
    return parsed
  } catch {
    return null
  }
}

export const ENTITLEMENT_TTL_SECONDS = TTL_MS / 1000
