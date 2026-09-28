import { describe, expect, it } from 'vitest'
import { mentionsRecurrence } from '@/lib/utils/recurrence-language'

// The receipt that made this check necessary, copied from the mailbox that
// produced the false positive. Stage A returned a MONTHLY period for it. There
// is not one word about recurring anywhere in the text.
const UNEED_RECEIPT = `Receipt from Uneed

$35.69

Paid on April 14, 2026

Order numberORD-19D8D2C18F196A16Payment methodCARD

Order #ORD-19D8D2C1...

APR 14, 2026

Skip the waiting line$29.99Units 1

Subtotal$29.99

VAT (19%)$5.70

Amount paid$35.69

View Order https://creem.io/my-orders/login/JDJhJDE1JHNnc3FFUGtzZjl5S09CU3Z1SWg2Rk8

Have a question about your purchase?
For support, refunds, or any questions about the product, please contact us
at thomas@uneed.best or visit https://uneed.best.

Creem is the Merchant of Record for this purchase and securely processes your
payment for Uneed.

Need an invoice for your records? Generate one here https://creem.io/my-orders/login/JDJhJDE1JHNnc3FFUGtzZjl5S09CU3Z1SWg2Rk8.

Creem

(c) 2025 Creem, Armitage Labs OU.
Telliskivi tn 57b/1, Tallinn, Estonia`

describe('mentionsRecurrence', () => {
  it('finds nothing in the Uneed receipt', () => {
    expect(mentionsRecurrence(UNEED_RECEIPT)).toBe(false)
  })

  const recurring: [string, string][] = [
    ['a price with a cycle', 'Claude Pro $21.42/month'],
    ['a spelled-out cycle', 'You will be billed annually.'],
    ['renewal wording', 'Your plan renews on the 14th.'],
    ['auto-renew, hyphenated', 'Auto-renew is on.'],
    ['a next-charge line', 'Next payment: 14 May 2026'],
    ['a billing cycle line', 'Your billing cycle starts today.'],
    ['a bare mention of the word', 'Thanks for your subscription!'],
    ['a membership', 'Your membership is active.'],
    ['a cancel-anytime footer', 'Charged until you cancel.'],
  ]

  it.each(recurring)('finds %s', (_label, text) => {
    expect(mentionsRecurrence(text)).toBe(true)
  })

  // Deliberately generous: this is a necessary condition, never a sufficient
  // one, and a false negative here would delete a real subscription.
  it('passes an ordinary receipt that merely mentions a month in passing', () => {
    expect(mentionsRecurrence('Your order shipped. Returns accepted within 1 month.')).toBe(true)
  })

  // Quoted-printable wraps long lines mid-word. A split "monthly" reading as
  // "no recurrence language" would discard a real subscription's period.
  it('sees through a quoted-printable soft line break', () => {
    expect(mentionsRecurrence('Your plan is billed mont=\nhly.')).toBe(true)
    expect(mentionsRecurrence('Charged $9 per mon=\r\nth.')).toBe(true)
  })

  const oneOffs: string[] = [
    'Receipt for your order. Total $19.99. Thanks for shopping with us.',
    'Your ticket for the 14 April show. Order #1234.',
    'Payment received: $50.00. Reference PKG-9981.',
  ]

  it.each(oneOffs)('finds nothing in %s', (text) => {
    expect(mentionsRecurrence(text)).toBe(false)
  })
})
