import { describe, expect, it } from 'vitest'
import type { Charge } from '@/lib/schemas/charge'
import { classifyCharges } from '@/lib/services/charge-classifier'

function charge(
  overrides: Partial<Charge> & Pick<Charge, 'merchant' | 'amount' | 'charge_date'>,
): Charge {
  return {
    email_index: 0,
    doc_type: 'receipt',
    renewal_evidence: 'none',
    is_refund: false,
    is_trial: false,
    is_credit_purchase: false,
    // The default is "the email did say something about recurring", so a test
    // that sets stated_period is testing the classifier and not the grounding
    // check. The cases that turn this off do so explicitly.
    recurrence_language: true,
    currency: 'USD',
    sender_domain: 'example.com',
    ...overrides,
  }
}

/** n monthly receipts for one merchant, starting at `from`. */
function monthly(merchant: string, amount: number, from: string, count: number): Charge[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(from)
    d.setDate(d.getDate() + i * 30)
    return charge({ merchant, amount, charge_date: d.toISOString().slice(0, 10) })
  })
}

const only = (r: ReturnType<typeof classifyCharges>) => r.verdicts[0]

describe('classifyCharges', () => {
  describe('recognises real subscriptions', () => {
    it('keeps a year of monthly receipts as one MONTHLY subscription', () => {
      const result = classifyCharges(monthly('Netflix', 15.49, '2026-01-05', 12))

      expect(result.verdicts).toHaveLength(1)
      expect(only(result).outcome).toBe('recurring')
      expect(only(result).period).toBe('MONTHLY')
      // One segment per charge - spans are never merged at this layer.
      expect(result.subscriptions).toHaveLength(12)
      expect(result.subscriptions[0].period).toBe('MONTHLY')
    })

    it('survives a receipt the mailbox search never matched', () => {
      // Gaps of 30 and 60 days: the middle renewal email was simply not found.
      // The median gap here is 45, which is no cycle at all - this is why gaps
      // are fitted against candidate cycles rather than against their median.
      const result = classifyCharges([
        charge({ merchant: 'Spotify', amount: 11.99, charge_date: '2026-01-10' }),
        charge({ merchant: 'Spotify', amount: 11.99, charge_date: '2026-02-09' }),
        charge({ merchant: 'Spotify', amount: 11.99, charge_date: '2026-04-10' }),
      ])

      expect(only(result).outcome).toBe('recurring')
      expect(only(result).period).toBe('MONTHLY')
    })

    it('keeps a subscription through a mid-run price rise', () => {
      const charges = [
        ...monthly('Netflix', 15.49, '2026-01-05', 6),
        ...monthly('Netflix', 17.99, '2026-07-04', 6),
      ]

      const result = classifyCharges(charges)
      expect(result.verdicts).toHaveLength(1)
      expect(only(result).outcome).toBe('recurring')
    })

    it('keeps an annual plan seen once when the email states the next date', () => {
      const result = classifyCharges([
        charge({
          merchant: 'Dropbox',
          plan: 'Plus',
          amount: 190.99,
          charge_date: '2026-03-01',
          renewal_evidence: 'next_date_stated',
          next_billing_date: '2027-03-01',
        }),
      ])

      expect(only(result).outcome).toBe('recurring')
      expect(only(result).period).toBe('YEARLY')
    })

    it('keeps an annual plan seen once when the email names the cycle', () => {
      const result = classifyCharges([
        charge({
          merchant: 'Reddit',
          plan: 'Premium',
          amount: 49.99,
          charge_date: '2026-04-17',
          renewal_evidence: 'recurring_wording',
          stated_period: 'YEARLY',
        }),
      ])

      expect(only(result).period).toBe('YEARLY')
    })

    it('keeps a metered plan whose amounts vary but whose cycle is stated', () => {
      // Usage-based billing is genuinely recurring with genuinely variable
      // amounts, so it needs a route past the variance gate - on evidence only.
      const result = classifyCharges([
        charge({
          merchant: 'Twilio',
          amount: 12.4,
          charge_date: '2026-01-01',
          stated_period: 'MONTHLY',
          renewal_evidence: 'recurring_wording',
        }),
        charge({
          merchant: 'Twilio',
          amount: 88.15,
          charge_date: '2026-01-31',
          stated_period: 'MONTHLY',
          renewal_evidence: 'recurring_wording',
        }),
        charge({
          merchant: 'Twilio',
          amount: 41.02,
          charge_date: '2026-03-02',
          stated_period: 'MONTHLY',
          renewal_evidence: 'recurring_wording',
        }),
      ])

      expect(only(result).outcome).toBe('recurring')
    })
  })

  describe('drops what is not a subscription', () => {
    it('drops a lone charge with nothing said about renewing', () => {
      // The 74-row failure class: one receipt inflated into a monthly plan.
      const result = classifyCharges([
        charge({ merchant: 'New Balance Athletic Shoe', amount: 55.12, charge_date: '2026-06-12' }),
      ])

      expect(result.subscriptions).toHaveLength(0)
      expect(only(result).reason).toBe('single_charge_no_evidence')
    })

    it('drops a retailer whose amounts swing wildly', () => {
      // Real amounts from the reported account.
      const result = classifyCharges(
        [2.0, 17.77, 46.45, 62.02, 165.74].map((amount, i) =>
          charge({
            merchant: 'DoorDash',
            amount,
            charge_date: `2026-0${i + 1}-11`,
          }),
        ),
      )

      expect(result.subscriptions).toHaveLength(0)
      expect(only(result).reason).toBe('amount_variance')
    })

    it('drops a Pay in 4 instalment plan despite its perfect fortnightly cadence', () => {
      const result = classifyCharges(
        ['2026-03-27', '2026-04-10', '2026-04-24', '2026-05-08'].map((charge_date, i) =>
          charge({
            merchant: 'Back Market Pay in 4',
            amount: 46.33,
            charge_date,
            installment_index: i + 1,
            installment_total: 4,
          }),
        ),
      )

      expect(result.subscriptions).toHaveLength(0)
      expect(only(result).reason).toBe('installment_plan')
    })

    it('drops two annual-looking charges with nothing to corroborate them', () => {
      // Two parking tickets twelve months apart are not a yearly subscription.
      const result = classifyCharges([
        charge({
          merchant: 'City of Chicago Parking Ticket',
          amount: 50,
          charge_date: '2025-06-25',
        }),
        charge({
          merchant: 'City of Chicago Parking Ticket',
          amount: 50,
          charge_date: '2026-07-20',
        }),
      ])

      expect(result.subscriptions).toHaveLength(0)
      expect(only(result).outcome).toBe('dropped')
    })

    it('ignores refunds entirely', () => {
      const result = classifyCharges([
        charge({ merchant: 'Figma', amount: 15, charge_date: '2026-01-01', is_refund: true }),
      ])

      expect(result.verdicts).toHaveLength(0)
      expect(result.subscriptions).toHaveLength(0)
    })

    it('ignores a retail order confirmation that says nothing about renewing', () => {
      const result = classifyCharges([
        charge({
          merchant: 'Etsy',
          amount: 33.08,
          charge_date: '2025-10-16',
          doc_type: 'order_confirmation',
        }),
      ])

      expect(result.verdicts).toHaveLength(0)
    })

    it('drops a merchant that recurs on no recognisable cycle', () => {
      const result = classifyCharges([
        charge({ merchant: 'Instacart', amount: 189.21, charge_date: '2026-01-02' }),
        charge({ merchant: 'Instacart', amount: 191.4, charge_date: '2026-01-05' }),
        charge({ merchant: 'Instacart', amount: 188.0, charge_date: '2026-02-27' }),
      ])

      expect(only(result).reason).toBe('irregular_cadence')
    })
  })

  describe('grouping', () => {
    it('keeps two tiers of one vendor as separate subscriptions', () => {
      const result = classifyCharges([
        ...monthly('Claude', 20, '2026-01-02', 3).map((c) => ({ ...c, plan: 'Pro' })),
        ...monthly('Claude', 200, '2026-01-02', 3).map((c) => ({ ...c, plan: 'Max' })),
      ])

      expect(result.verdicts).toHaveLength(2)
      expect(result.verdicts.every((v) => v.outcome === 'recurring')).toBe(true)
    })

    it('treats catalog spelling variants as one merchant', () => {
      const result = classifyCharges([
        charge({
          merchant: 'Etsy',
          amount: 12,
          charge_date: '2026-01-04',
          renewal_evidence: 'recurring_wording',
        }),
        charge({
          merchant: 'ETSY',
          amount: 12,
          charge_date: '2026-02-03',
          renewal_evidence: 'recurring_wording',
        }),
        charge({
          merchant: 'Etsy, Inc.',
          amount: 12,
          charge_date: '2026-03-05',
          renewal_evidence: 'recurring_wording',
        }),
      ])

      expect(result.verdicts).toHaveLength(1)
      expect(only(result).charge_count).toBe(3)
    })

    it('prefers the fullest spelling as the display name', () => {
      const result = classifyCharges(
        monthly('Ancestry.com Operations', 17.72, '2026-01-07', 3).map((c, i) =>
          i === 0 ? { ...c, merchant: 'Ancestry.com Operati...' } : c,
        ),
      )

      expect(only(result).display_name).toBe('Ancestry.com Operations')
    })

    it('does not merge the same merchant billed in two currencies', () => {
      const result = classifyCharges([
        ...monthly('Setapp', 9.99, '2026-01-03', 3),
        ...monthly('Setapp', 9.99, '2026-01-03', 3).map((c) => ({ ...c, currency: 'EUR' })),
      ])

      expect(result.verdicts).toHaveLength(2)
    })
  })

  it('is deterministic for the same input', () => {
    const charges = [
      ...monthly('Netflix', 15.49, '2026-01-05', 5),
      ...monthly('Spotify', 11.99, '2026-01-10', 4),
      charge({ merchant: 'Parking', amount: 50, charge_date: '2026-02-02' }),
    ]

    expect(JSON.stringify(classifyCharges(charges))).toBe(JSON.stringify(classifyCharges(charges)))
  })
})

describe('what the card is called', () => {
  const named = (merchant: string, plan?: string) =>
    classifyCharges(monthly(merchant, 20, '2026-01-05', 3).map((c) => ({ ...c, plan })))
      .subscriptions[0].service_name

  // The tier is part of the name. Without it these are two cards both reading
  // "Netflix", at two prices, which reads as a duplicate rather than two plans.
  it('carries the tier into the name', () => {
    expect(named('Netflix', 'Premium')).toBe('Netflix Premium')
    expect(named('Apple', 'iCloud+ 2TB')).toBe('Apple iCloud+ 2TB')
  })

  it('leaves a plainly named service alone', () => {
    expect(named('Railway')).toBe('Railway')
  })

  // The product is what the user recognises. The prompt asks for merchant
  // "Claude" on an "Anthropic, PBC" invoice; this is the half that renders it.
  it('reads as the product, not the biller', () => {
    expect(named('Claude', 'Pro')).toBe('Claude Pro')
  })

  it('does not repeat a tier the model already put in the merchant', () => {
    expect(named('Claude Pro', 'Pro')).toBe('Claude Pro')
  })

  // Whole words, not substrings: "Proton" contains "pro" without being the Pro
  // tier, and a substring test would silently drop the tier here.
  it('keeps a tier whose letters happen to appear inside the merchant', () => {
    expect(named('Proton', 'Pro')).toBe('Proton Pro')
  })

  it('prefers the complete merchant name over a truncated sibling', () => {
    const charges = [
      charge({ merchant: 'Ancestry.com Operations', amount: 20, charge_date: '2026-01-05' }),
      charge({ merchant: 'Ancestry.com Operati...', amount: 20, charge_date: '2026-02-04' }),
    ]

    expect(classifyCharges(charges).subscriptions[0].service_name).toBe('Ancestry.com Operations')
  })

  // Billing prose is not a tier. Every charge in a group shares a plan bucket,
  // so the shortest spelling describes the group just as well and reads better.
  it('takes the tersest spelling of the tier', () => {
    const charges = monthly('Claude', 21.42, '2026-01-05', 3).map((c, i) => ({
      ...c,
      plan: i === 0 ? 'Pro plan, billed monthly' : 'Pro',
    }))

    expect(classifyCharges(charges).subscriptions[0].service_name).toBe('Claude Pro')
  })
})

// Measured on two real mailboxes: single_charge_no_evidence was the top drop
// reason on both (3 of 6 drops on one, 8 of 12 on the other), and the inbox that
// produced it visibly contained subscriptions. These are the three reasons why.
describe('recall gaps found by running against real mailboxes', () => {
  describe('a lone receipt that names its own cycle', () => {
    // "SocialClaw (SocialClaw Starter Monthly) receipt" - one Lemon Squeezy
    // receipt, no second charge yet, but the email states the cycle. The gate
    // used to reject it before reaching the line that reads stated_period off
    // the very same charge.
    it('is kept on the stated period alone', () => {
      const result = classifyCharges([
        charge({
          merchant: 'SocialClaw',
          plan: 'Starter',
          amount: 20,
          charge_date: '2026-07-10',
          stated_period: 'MONTHLY',
        }),
      ])

      expect(only(result).outcome).toBe('recurring')
      expect(only(result).period).toBe('MONTHLY')
    })

    // The precision half of the same rule: silence is still not evidence.
    it('is still dropped when the email says nothing about a cycle', () => {
      const result = classifyCharges([
        charge({ merchant: 'City of Chicago', amount: 50, charge_date: '2026-07-10' }),
      ])

      expect(only(result).outcome).toBe('dropped')
      expect(only(result).reason).toBe('single_charge_no_evidence')
    })
  })

  describe('a renewal notice alongside its receipt', () => {
    // A notice dated a week before the charge it announces is a real timeline
    // point but not a payment. Counting it as one turned a monthly plan's
    // 30-day rhythm into gaps of 23 and 7 - which fits WEEKLY and nothing else.
    it('does not bend the cadence it announces', () => {
      const result = classifyCharges([
        charge({ merchant: 'Linear', amount: 8, charge_date: '2026-06-01' }),
        charge({
          merchant: 'Linear',
          amount: 8,
          charge_date: '2026-06-24',
          doc_type: 'renewal_notice',
        }),
        charge({ merchant: 'Linear', amount: 8, charge_date: '2026-07-01' }),
      ])

      expect(only(result).outcome).toBe('recurring')
      expect(only(result).period).toBe('MONTHLY')
      // The notice moved no money, so it is not one of the billing segments.
      expect(result.subscriptions).toHaveLength(2)
    })

    it('still supplies the evidence a lone receipt lacks', () => {
      const result = classifyCharges([
        charge({ merchant: 'Gologin', amount: 24, charge_date: '2026-07-02' }),
        charge({
          merchant: 'Gologin',
          amount: 24,
          charge_date: '2026-07-28',
          doc_type: 'renewal_notice',
          stated_period: 'MONTHLY',
        }),
      ])

      expect(only(result).outcome).toBe('recurring')
      expect(only(result).period).toBe('MONTHLY')
    })
  })

  describe('a group holding nothing but renewal notices', () => {
    // Two of these were dropped as "zero_amount" on a live mailbox. A notice
    // names the service, the price and the next date - everything a card needs.
    it('is kept and priced from the notice', () => {
      const result = classifyCharges([
        charge({
          merchant: 'Figma',
          amount: 15,
          charge_date: '2026-09-01',
          doc_type: 'renewal_notice',
          stated_period: 'MONTHLY',
          renewal_evidence: 'next_date_stated',
          next_billing_date: '2026-10-01',
        }),
      ])

      expect(only(result).outcome).toBe('recurring')
      expect(result.subscriptions).toHaveLength(1)
      expect(result.subscriptions[0].price).toBe(15)
    })

    it('never reaches a verdict when the notice carries no amount', () => {
      // Filtered before grouping: a zero amount that is not a trial is not a
      // charge, so there is nothing to judge and no verdict to record.
      const result = classifyCharges([
        charge({
          merchant: 'Figma',
          amount: 0,
          charge_date: '2026-09-01',
          doc_type: 'renewal_notice',
          renewal_evidence: 'recurring_wording',
        }),
      ])

      expect(result.verdicts).toHaveLength(0)
      expect(result.subscriptions).toHaveLength(0)
    })

    it('is dropped when a free trial notice is all there is', () => {
      // is_trial lets a zero amount past the intake filter, so this one does
      // reach a verdict - and there is still no price to put on a card.
      const result = classifyCharges([
        charge({
          merchant: 'Figma',
          amount: 0,
          charge_date: '2026-09-01',
          doc_type: 'renewal_notice',
          renewal_evidence: 'recurring_wording',
          is_trial: true,
        }),
      ])

      expect(only(result).outcome).toBe('dropped')
      expect(only(result).reason).toBe('zero_amount')
    })
  })

  // The widened gate must not reach the cases precision was bought with.
  describe('precision the wider gate must not undo', () => {
    it('still refuses two yearly charges that say nothing', () => {
      const result = classifyCharges([
        charge({ merchant: 'City of Chicago', amount: 50, charge_date: '2025-03-04' }),
        charge({ merchant: 'City of Chicago', amount: 50, charge_date: '2026-03-01' }),
      ])

      expect(only(result).outcome).toBe('dropped')
    })

    it('still refuses a shopping history that happens to be monthly', () => {
      const amounts = [2.0, 17.77, 46.45, 62.02, 165.74]
      const result = classifyCharges(
        amounts.map((amount, i) =>
          charge({
            merchant: 'DoorDash',
            amount,
            charge_date: `2026-0${i + 1}-05`,
          }),
        ),
      )

      expect(only(result).outcome).toBe('dropped')
      expect(only(result).reason).toBe('amount_variance')
    })
  })
})

// Three false positives from one real scan, all the same mistake: a company
// that genuinely sells subscriptions also sold the user a balance. Credits
// arrive on a regular cadence from a familiar brand at a steady price, so every
// signal the classifier trusts points the wrong way.
describe('buying a balance is not buying a subscription', () => {
  it('drops a credit purchase the model flagged', () => {
    const result = classifyCharges(
      monthly('Claude', 11.9, '2025-11-03', 3).map((c) => ({
        ...c,
        plan: 'Individual',
        is_credit_purchase: true,
        stated_period: 'MONTHLY' as const,
      })),
    )

    expect(result.verdicts).toHaveLength(0)
    expect(result.subscriptions).toHaveLength(0)
    expect(result.creditPurchases).toBe(3)
  })

  // The backstop, for when the model reports the flag as false. Same shape as
  // BNPL_NAME backing up installment_total.
  const byName: [string, string | undefined][] = [
    ['SocialClaw', '20 credits'],
    ['Apify', 'Prepaid usage'],
    ['OpenAI', 'Token top-up'],
    ['Midjourney', 'Refill'],
    ['Railway', 'Add funds'],
  ]

  it.each(byName)('drops %s / %s on the name alone', (merchant, plan) => {
    const charges = monthly(merchant, 25, '2026-01-05', 3).map((c) => ({ ...c, plan }))

    expect(classifyCharges(charges).subscriptions).toHaveLength(0)
  })

  // "Credit card" is how the receipt names the payment method, not what was
  // bought, and it appears on an enormous number of perfectly ordinary receipts.
  it('is not fooled by the words "credit card"', () => {
    const charges = monthly('Netflix', 15.49, '2026-01-05', 3).map((c) => ({
      ...c,
      plan: 'Premium (credit card)',
    }))

    expect(classifyCharges(charges).subscriptions).toHaveLength(3)
  })

  // The case that matters most: Apify bills a $29 Starter plan AND sells
  // credits. Merging the two into one card was the wrong answer - so was
  // showing both. The plan survives on its own and the credits go.
  it('keeps the plan and drops the credits when a merchant sells both', () => {
    const result = classifyCharges([
      ...monthly('Apify', 29.0, '2026-06-29', 3).map((c) => ({ ...c, plan: 'Starter' })),
      ...monthly('Apify', 25.09, '2026-07-02', 2).map((c) => ({
        ...c,
        plan: 'Credits',
        is_credit_purchase: true,
      })),
    ])

    expect(result.verdicts).toHaveLength(1)
    expect(only(result).outcome).toBe('recurring')
    expect(result.subscriptions[0].service_name).toBe('Apify Starter')
    expect(result.creditPurchases).toBe(2)
  })
})

// Recorded so a reported false positive names the branch that admitted it,
// rather than starting a hunt. "Uneed, kept on stated_period" is a finding;
// "Uneed, kept" is not.
describe('verdicts say which rule kept a subscription', () => {
  it('reports cadence when the receipts really did arrive on a cycle', () => {
    expect(only(classifyCharges(monthly('Netflix', 15.49, '2026-01-05', 6))).evidence).toBe(
      'cadence',
    )
  })

  it('reports two_charges for a pair spaced like a cycle', () => {
    const result = classifyCharges(monthly('Notion', 10, '2026-01-05', 2))

    expect(only(result).evidence).toBe('two_charges')
  })

  it('reports stated_period when one email carried the whole verdict', () => {
    const result = classifyCharges([
      charge({
        merchant: 'Uneed',
        amount: 35.69,
        charge_date: '2026-04-14',
        stated_period: 'MONTHLY',
      }),
    ])

    expect(only(result).evidence).toBe('stated_period')
  })

  it('reports next_billing_date when the email printed the next charge', () => {
    const result = classifyCharges([
      charge({
        merchant: 'Figma',
        amount: 15,
        charge_date: '2026-04-14',
        next_billing_date: '2026-05-14',
        renewal_evidence: 'next_date_stated',
      }),
    ])

    expect(only(result).evidence).toBe('next_billing_date')
  })

  it('leaves evidence unset on a drop', () => {
    const result = classifyCharges([
      charge({ merchant: 'City of Chicago', amount: 50, charge_date: '2026-07-10' }),
    ])

    expect(only(result).evidence).toBeUndefined()
  })
})

// The Uneed receipt: "Skip the waiting line, Units 1", an order number and a
// VAT line, with no recurrence wording anywhere - and Stage A returned MONTHLY
// for it anyway. A single charge is admitted on the strength of the email's own
// words, so one invented word turned a one-off purchase into a standing cost.
describe('recurrence the email never mentioned', () => {
  const ungrounded = (overrides: Partial<Charge> = {}) =>
    charge({
      merchant: 'Uneed',
      amount: 35.69,
      charge_date: '2026-04-14',
      recurrence_language: false,
      ...overrides,
    })

  it('does not let an invented period carry a lone charge', () => {
    const result = classifyCharges([ungrounded({ stated_period: 'MONTHLY' })])

    expect(only(result).outcome).toBe('dropped')
    expect(only(result).reason).toBe('single_charge_no_evidence')
  })

  it('does not let invented renewal wording carry one either', () => {
    const result = classifyCharges([
      ungrounded({ renewal_evidence: 'recurring_wording', next_billing_date: '2026-05-14' }),
    ])

    expect(only(result).outcome).toBe('dropped')
    expect(only(result).reason).toBe('single_charge_no_evidence')
  })

  // The claim is discarded, not the charge. Cadence is measured from dates, not
  // from what the emails say, so a real subscription whose receipts happen to
  // be silent about renewing is still found.
  it('still finds a subscription from its cadence alone', () => {
    const result = classifyCharges(
      monthly('Linear', 8, '2026-01-05', 4).map((c) => ({ ...c, recurrence_language: false })),
    )

    expect(only(result).outcome).toBe('recurring')
    expect(only(result).period).toBe('MONTHLY')
    expect(only(result).evidence).toBe('cadence')
  })

  // A cancellation notice is a statement about a subscription that existed, and
  // the wording that proves it is the wording being checked for - so it is kept
  // rather than blanked, to avoid a circular test.
  it('keeps a cancellation on the record', () => {
    const result = classifyCharges([
      ungrounded({ renewal_evidence: 'cancellation' }),
      ungrounded({ charge_date: '2026-05-14', renewal_evidence: 'cancellation' }),
    ])

    expect(only(result).outcome).toBe('recurring')
  })
})
