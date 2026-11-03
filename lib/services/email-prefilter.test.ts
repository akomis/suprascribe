import { describe, expect, it, vi } from 'vitest'
import type { Charge } from '@/lib/schemas/charge'
import type { EmailData } from '@/lib/types/email'
import { classifyCharges } from '@/lib/services/charge-classifier'
import {
  measurePrefilterLoss,
  prefilterEmails,
  resolvePrefilterMode,
  type EmailKind,
  type PrefilterOptions,
  type SourcedCharge,
} from '@/lib/services/email-prefilter'

function email(subject: string, from = 'store@shop.example'): EmailData {
  return { subject, from, date: '2026-09-01', body: `${subject}. Thanks for your business.` }
}

/** A choice answer putting `p` on `kind` and the rest on not_billing. */
function answer(kind: EmailKind, p = 1, status = 200): Response {
  const probabilities: Record<EmailKind, number> = {
    subscription_charge: 0,
    renewal: 0,
    cancellation: 0,
    usage_charge: 0,
    one_off_purchase: 0,
    not_billing: 0,
  }
  probabilities[kind] += p
  probabilities.not_billing += 1 - p
  return new Response(
    JSON.stringify({
      model: 'typesafe/jev-1.13-20260917',
      answers: { email_kind: { type: 'choice', choice: kind, probabilities, confidence: p } },
      usage: { input_tokens: 100, output_tokens: 5, cost: 0.0000042 },
    }),
    { status },
  )
}

function options(fetchImpl: typeof fetch, overrides: Partial<PrefilterOptions> = {}) {
  return {
    // The analyzer's reducer imports server-only code; the host is enough here.
    senderDomain: (from: string | undefined) => from?.split('@')[1] ?? 'unknown',
    maxBodyChars: 10_000,
    apiKey: 'test-key',
    hardKeeps: false,
    fetchImpl,
    sleep: async () => {},
    ...overrides,
  } satisfies PrefilterOptions
}

const sent = (fetchImpl: typeof fetch, call = 0) =>
  JSON.parse(String(vi.mocked(fetchImpl).mock.calls[call][1]?.body))

describe('prefilterEmails', () => {
  it('keeps the subscription kinds and rejects the rest', async () => {
    const kinds: Record<string, EmailKind> = {
      'Your receipt': 'subscription_charge',
      'Renews tomorrow': 'renewal',
      'Plan cancelled': 'cancellation',
      'Platform usage': 'usage_charge',
      'Order shipped': 'one_off_purchase',
      'Big sale': 'not_billing',
    }
    const emails = Object.keys(kinds).map((subject) => email(subject))
    const fetchImpl = vi.fn(async (_url: unknown, init?: RequestInit) =>
      answer(kinds[JSON.parse(String(init?.body)).state.subject]),
    ) as unknown as typeof fetch

    const result = await prefilterEmails(emails, options(fetchImpl))

    expect(result.kept.map((e) => e.subject)).toEqual([
      'Your receipt',
      'Renews tomorrow',
      'Plan cancelled',
    ])
    expect([...result.rejected].map((e) => e.subject)).toEqual([
      'Platform usage',
      'Order shipped',
      'Big sale',
    ])
    expect(result.byKind).toEqual({
      subscription_charge: 1,
      renewal: 1,
      cancellation: 1,
      usage_charge: 1,
      one_off_purchase: 1,
      not_billing: 1,
    })
    expect(result.inputTokens).toBe(600)
    expect(result.costUsd).toBeCloseTo(0.0000252)
  })

  it('keeps an email whose subscription kinds add up to the threshold', async () => {
    // Top answer is one_off_purchase, but 0.2 sits on subscription_charge.
    const fetchImpl = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            answers: {
              email_kind: {
                choice: 'one_off_purchase',
                probabilities: {
                  subscription_charge: 0.2,
                  renewal: 0,
                  cancellation: 0,
                  usage_charge: 0,
                  one_off_purchase: 0.8,
                  not_billing: 0,
                },
              },
            },
          }),
        ),
    ) as unknown as typeof fetch

    const result = await prefilterEmails([email('Receipt')], options(fetchImpl))

    expect(result.kept).toHaveLength(1)
    expect(result.byKind.one_off_purchase).toBe(1)
  })

  it('keeps every email when there is no API key, without calling out', async () => {
    const fetchImpl = vi.fn() as unknown as typeof fetch
    const emails = [email('Big sale'), email('Daily digest')]

    const result = await prefilterEmails(emails, options(fetchImpl, { apiKey: '' }))

    expect(result.kept).toEqual(emails)
    expect(result.errored).toBe(2)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('keeps the email on a non-retryable error', async () => {
    const fetchImpl = vi.fn(async () => answer('not_billing', 1, 500)) as unknown as typeof fetch

    const result = await prefilterEmails([email('Big sale')], options(fetchImpl))

    expect(result.kept).toHaveLength(1)
    expect(result.errored).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('keeps the email when the request throws', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('aborted')
    }) as unknown as typeof fetch

    const result = await prefilterEmails([email('Big sale')], options(fetchImpl))

    expect(result.kept).toHaveLength(1)
    expect(result.errored).toBe(1)
  })

  it('keeps the email when the answer is unreadable', async () => {
    const fetchImpl = vi.fn(
      async () =>
        new Response(JSON.stringify({ answers: { email_kind: { choice: 'something_else' } } })),
    ) as unknown as typeof fetch

    const result = await prefilterEmails([email('Big sale')], options(fetchImpl))

    expect(result.kept).toHaveLength(1)
    expect(result.errored).toBe(1)
  })

  it('retries when rate limited, then uses the answer', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(answer('not_billing', 1, 429))
      .mockResolvedValueOnce(answer('not_billing')) as unknown as typeof fetch

    const result = await prefilterEmails([email('Big sale')], options(fetchImpl))

    expect(result.rejected.size).toBe(1)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('keeps whatever is unanswered once the deadline has passed', async () => {
    const fetchImpl = vi.fn(async () => answer('not_billing')) as unknown as typeof fetch
    let calls = 0
    // The first read sets the deadline; every read after it is past it.
    const now = () => (calls++ === 0 ? 0 : 10_000_000)

    const result = await prefilterEmails(
      [email('Big sale'), email('Digest')],
      options(fetchImpl, { now }),
    )

    expect(result.kept).toHaveLength(2)
    expect(result.errored).toBe(2)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('asks about every email when hard keeps are off', async () => {
    const fetchImpl = vi.fn(async () => answer('not_billing')) as unknown as typeof fetch
    const renewal = email('Your plan renews tomorrow')
    const stripe = email('Your Acme order', 'receipts+acct@stripe.com')

    const result = await prefilterEmails([renewal, stripe], options(fetchImpl))

    expect(result.rejected.size).toBe(2)
    expect(fetchImpl).toHaveBeenCalledTimes(2)
  })

  it('never asks about recurrence wording or dedicated senders when hard keeps are on', async () => {
    const fetchImpl = vi.fn(async () => answer('not_billing')) as unknown as typeof fetch
    const renewal = email('Your plan renews tomorrow')
    const stripe = email('Your Acme order', 'receipts+acct@stripe.com')

    const result = await prefilterEmails([renewal, stripe], options(fetchImpl, { hardKeeps: true }))

    expect(result.kept).toEqual([renewal, stripe])
    expect(result.hardKept).toBe(2)
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('sends the body cut to the configured length as a choice question', async () => {
    const long = { ...email('Receipt'), body: 'x'.repeat(500) }
    const fetchImpl = vi.fn(async () => answer('subscription_charge')) as unknown as typeof fetch

    await prefilterEmails([long], options(fetchImpl, { maxBodyChars: 50 }))

    const body = sent(fetchImpl)
    expect(body.state.body).toHaveLength(50)
    expect(body.questions.email_kind.type).toBe('choice')
    expect(Object.keys(body.questions.email_kind.criteria)).toHaveLength(6)
  })
})

describe('resolvePrefilterMode', () => {
  it('is always off for BYOK scans', () => {
    expect(resolvePrefilterMode('enforce', true)).toBe('off')
    expect(resolvePrefilterMode('shadow', true)).toBe('off')
  })

  it('uses the configured mode otherwise', () => {
    expect(resolvePrefilterMode('enforce', false)).toBe('enforce')
    expect(resolvePrefilterMode('shadow', false)).toBe('shadow')
    expect(resolvePrefilterMode('off', false)).toBe('off')
  })
})

describe('measurePrefilterLoss', () => {
  function charge(merchant: string, charge_date: string): Charge {
    return {
      email_index: 1,
      merchant,
      amount: 9.99,
      currency: 'USD',
      charge_date,
      doc_type: 'receipt',
      renewal_evidence: 'none',
      is_refund: false,
      is_trial: false,
      is_credit_purchase: false,
      recurrence_language: true,
      sender_domain: `${merchant.toLowerCase()}.com`,
    }
  }

  function monthly(merchant: string): SourcedCharge[] {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date('2026-01-05')
      d.setDate(d.getDate() + i * 30)
      return { charge: charge(merchant, d.toISOString().slice(0, 10)), email: email(merchant) }
    })
  }

  function keptKeys(sourced: SourcedCharge[]): string[] {
    return classifyCharges(sourced.map((s) => s.charge))
      .verdicts.filter((v) => v.outcome === 'recurring')
      .map((v) => v.merchant_key)
  }

  it('counts a subscription whose every receipt was rejected as lost', () => {
    const netflix = monthly('Netflix')
    const spotify = monthly('Spotify')
    const sourced = [...netflix, ...spotify]
    const rejected = new Set(spotify.map((s) => s.email))

    expect(keptKeys(sourced)).toHaveLength(2)
    expect(measurePrefilterLoss(keptKeys(sourced), sourced, rejected)).toEqual({
      lostSubscriptions: 1,
      lostCharges: 6,
    })
  })

  it('loses nothing when a rejected receipt is not needed to keep the plan', () => {
    const netflix = monthly('Netflix')
    const rejected = new Set([netflix[2].email])

    expect(measurePrefilterLoss(keptKeys(netflix), netflix, rejected)).toEqual({
      lostSubscriptions: 0,
      lostCharges: 1,
    })
  })
})
