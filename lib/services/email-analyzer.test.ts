import { APICallError, NoObjectGeneratedError, RetryError } from 'ai'
import { describe, expect, it, vi } from 'vitest'

// The analyzer builds its model through ai-provider, which is marked server-only.
vi.mock('server-only', () => ({}))

const { isTransientFailure } = await import('@/lib/services/email-analyzer')

const rateLimited = () =>
  new APICallError({
    message: 'google/gemini-2.5-flash-lite is temporarily rate-limited upstream',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    requestBodyValues: {},
    statusCode: 429,
    isRetryable: true,
  })

describe('isTransientFailure', () => {
  it('retries a unit whose SDK retries ran out on a rate limit', () => {
    const error = new RetryError({
      message: 'Failed after 3 attempts.',
      reason: 'maxRetriesExceeded',
      errors: [rateLimited(), rateLimited(), rateLimited()],
    })
    expect(isTransientFailure(error)).toBe(true)
  })

  it('retries a retryable provider error and a timeout', () => {
    expect(isTransientFailure(rateLimited())).toBe(true)
    expect(isTransientFailure(new Error('Timeout after 60000ms: unit analysis'))).toBe(true)
  })

  it('does not retry a request the provider rejected outright', () => {
    const badRequest = new APICallError({
      message: 'invalid schema',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      requestBodyValues: {},
      statusCode: 400,
      isRetryable: false,
    })
    expect(isTransientFailure(badRequest)).toBe(false)
  })

  it('does not retry output that already failed to parse on every attempt', () => {
    expect(
      isTransientFailure(new Error('Unit x produced unparseable output on all 3 attempts')),
    ).toBe(false)
    expect(
      isTransientFailure(
        new NoObjectGeneratedError({
          message: 'no object',
          text: '{',
          response: { id: '1', timestamp: new Date(), modelId: 'm' },
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 } as never,
          finishReason: 'stop',
        }),
      ),
    ).toBe(false)
  })
})

const { exclusionFor } = await import('@/lib/services/email-analyzer')

describe('exclusionFor', () => {
  const email = (from: string, subject: string, body = '') => ({
    from,
    subject,
    body,
    date: '2026-10-27',
  })

  it('sets aside our own reminders and contact-form mail', () => {
    expect(
      exclusionFor(
        email('"Suprascribe" <reminders@suprascribe.com>', 'Renewal Reminder: 1 subscription'),
      ),
    ).toBe('own_product')
    expect(exclusionFor(email('contact@suprascribe.com', '[CONTACT] Cancel kukufm'))).toBe(
      'own_product',
    )
  })

  it('sets aside a reply that quotes our mail, but not a forward of a real receipt', () => {
    const quoted = 'Please unsubscribe\n> Suprascribe <reminders@suprascribe.com> wrote:'
    expect(exclusionFor(email('a@gmail.com', 'Re: Renewal Reminder', quoted))).toBe('own_product')
    expect(
      exclusionFor(email('me@gmail.com', 'Fwd: Your receipt from Railway', 'Receipt from Railway')),
    ).toBeNull()
  })

  it('sets aside Stripe telling a seller it was paid, not a buyer receipt', () => {
    expect(
      exclusionFor(email('notifications@stripe.com', 'Payment of €10.00 from Jane Doe for Acme')),
    ).toBe('seller_notification')
    expect(exclusionFor(email('notifications@stripe.com', 'Payment of €9.00 for Acme'))).toBe(
      'seller_notification',
    )
    expect(
      exclusionFor(email('invoice+statements@stripe.com', 'Your receipt from Railway #2155-1084')),
    ).toBeNull()
  })
})
