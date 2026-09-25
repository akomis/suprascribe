import { describe, expect, it } from 'vitest'
import { buildSearchQuery, EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'

describe('buildSearchQuery', () => {
  const keywords = ['receipt', 'invoice']
  const senders = ['stripe.com']
  const mixedSenders = ['paypal.com']

  describe('gmail', () => {
    it('ORs subject keywords with dedicated billing senders', () => {
      const q = buildSearchQuery(keywords, 'gmail', { senders })

      expect(q).toContain('subject:"receipt" OR subject:"invoice"')
      expect(q).toContain('from:stripe.com')
    })

    it('requires a mixed sender to also match the subject', () => {
      const q = buildSearchQuery(keywords, 'gmail', { senders, mixedSenders })

      // Adjacency is AND in Gmail, so the mixed clause must be its own group
      // holding both conditions - never a bare "OR from:paypal.com", which
      // would pull the user's whole PayPal history into the scan.
      expect(q).toContain('(from:paypal.com (subject:"receipt" OR subject:"invoice"))')
      expect(q).not.toMatch(/OR from:paypal\.com\)/)
    })

    it('applies the date window across the whole expression', () => {
      const q = buildSearchQuery(keywords, 'gmail', {
        senders,
        mixedSenders,
        since: new Date('2025-01-15T00:00:00Z'),
      })

      expect(q.endsWith('after:2025/1/15')).toBe(true)
    })

    it('falls back to a usable query when given nothing', () => {
      expect(buildSearchQuery([], 'gmail', {})).toBe('subject:receipt')
    })
  })

  describe('outlook', () => {
    it('returns one KQL expression wrapped in exactly one pair of quotes', () => {
      const q = buildSearchQuery(keywords, 'outlook', { senders, mixedSenders })

      expect(q.startsWith('"')).toBe(true)
      expect(q.endsWith('"')).toBe(true)
      // Graph accepts a malformed $search and silently free-text-searches it,
      // so a stray inner quote reads as "this inbox has no receipts".
      expect(q.slice(1, -1)).not.toContain('"')
    })

    it('spells the mixed-sender AND explicitly', () => {
      const q = buildSearchQuery(keywords, 'outlook', { senders, mixedSenders })

      expect(q).toContain('(from:paypal.com AND (subject:receipt OR subject:invoice))')
    })
  })

  describe('config', () => {
    it('does not fetch order confirmations', () => {
      // The prompt labels these as retail orders and the classifier drops them,
      // so fetching them only spends tokens and crowds the scan cap.
      expect(EMAIL_DISCOVERY_CONFIG.subjectKeywords).not.toContain('order confirmation')
    })

    it('keeps consumer firehose senders out of the unconditional list', () => {
      for (const domain of ['paypal.com', 'apple.com', 'google.com']) {
        expect(EMAIL_DISCOVERY_CONFIG.dedicatedBillingSenders).not.toContain(domain)
        expect(EMAIL_DISCOVERY_CONFIG.mixedSenders).toContain(domain)
      }
    })
  })
})
