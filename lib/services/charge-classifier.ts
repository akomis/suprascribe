import type { Charge } from '@/lib/schemas/charge'
import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'
import { planBucket, serviceKey } from '@/lib/utils/service-key'
import { CYCLE_DAYS } from '@/lib/utils/subscription-period-extension'
import { toDateString } from '@/lib/utils/date'

/**
 * Decides which merchants are actually subscriptions.
 *
 * This is the half of discovery that used to live inside the prompt, where it
 * could not work: recurrence is a property of a set of receipts over time, and
 * a language model shown one email at a time can only guess at it. A guess is
 * neither accurate - a parking ticket became a $50/month plan - nor repeatable:
 * two scans of the same mailbox returned 156 and 149 subscriptions.
 *
 * Pure, no I/O, no model. Same charges in, same subscriptions out.
 */

// Asymmetric on purpose. Months run 28-31 days, and receipts land late far more
// often than early (payment retries, weekend batching, timezone edges), so the
// upper bound is the looser one.
const CYCLE_WINDOW: Record<BillingPeriod, [number, number]> = {
  WEEKLY: [5, 10],
  MONTHLY: [26, 36],
  QUARTERLY: [80, 100],
  YEARLY: [330, 400],
}

const ORDERED_PERIODS: BillingPeriod[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']

// A gap may be a whole number of cycles rather than one, because retrieval only
// ever sees the receipts that matched the search query. Allowing up to three
// absorbs the ordinary case of a missed renewal email; beyond that the
// subscription genuinely lapsed and consolidateSubscriptionPeriods will split
// the run.
const MAX_SKIPPED_CYCLES = 3

// Robust coefficient of variation above which the amounts look like shopping
// rather than a plan. See the amount-variance note in classifyGroup.
const MAX_AMOUNT_VARIATION = 0.25

const BNPL_NAME =
  /\bpay\s*in\s*(4|four|3|three)\b|\b(klarna|afterpay|clearpay|sezzle|zip\s?pay|affirm)\b/i

// Buying a balance is not buying a period. The model reports this as
// is_credit_purchase; this is the backstop for when it does not, the same way
// BNPL_NAME backstops installment_total. Deliberately narrow - "credit card"
// and "credit note" are excluded, and a plain "usage" is not enough on its own,
// because an invoice line reading "usage" is ordinary metered billing.
const CREDIT_NAME =
  /\b(credits?|tokens?|top[\s-]?up|topup|prepaid|refill|recharge|add\s+funds|pay[\s-]?as[\s-]?you[\s-]?go)\b/i

/**
 * Discards recurrence the source email never mentioned.
 *
 * A single charge is admitted on the strength of the email's own words, so an
 * invented word is enough to create a subscription out of a one-off purchase -
 * which is exactly what happened to a Uneed receipt whose body says "Skip the
 * waiting line, Units 1" and nothing else. The claim is dropped, not the charge:
 * the money did move, and if the same merchant bills again next month the
 * cadence will find it without needing the email to say anything at all.
 */
function groundEvidence(charge: Charge): Charge {
  if (charge.recurrence_language) return charge

  return {
    ...charge,
    stated_period: undefined,
    next_billing_date: undefined,
    renewal_evidence: charge.renewal_evidence === 'cancellation' ? 'cancellation' : 'none',
  }
}

function isCreditPurchase(charge: Charge): boolean {
  if (charge.is_credit_purchase) return true
  if (/\bcredit\s+(card|note|memo)\b/i.test(`${charge.merchant} ${charge.plan ?? ''}`)) {
    return false
  }
  return CREDIT_NAME.test(charge.merchant) || CREDIT_NAME.test(charge.plan ?? '')
}

export type DropReason =
  | 'refund'
  | 'zero_amount'
  | 'order_confirmation'
  | 'installment_plan'
  | 'amount_variance'
  | 'single_charge_no_evidence'
  | 'no_cycle'
  | 'irregular_cadence'

/**
 * Which rule let a subscription through.
 *
 * Recorded because a false positive is only actionable once you know which
 * branch admitted it. "Uneed, kept on stated_period alone" says tighten that
 * branch; "kept on cadence" says the emails really did look like a plan.
 */
export type KeepEvidence = 'cadence' | 'two_charges' | 'stated_period' | 'next_billing_date'

export interface ClassificationVerdict {
  merchant_key: string
  display_name: string
  charge_count: number
  outcome: 'recurring' | 'dropped'
  reason?: DropReason
  /** Set on a kept group: the rule that carried it. */
  evidence?: KeepEvidence
  period?: BillingPeriod
  median_gap_days?: number
  total_amount: number
}

export interface ClassificationResult {
  /** One segment per charge. Spans are never merged here - that is run-splitting's job. */
  subscriptions: DiscoveredSubscription[]
  /** Every group's outcome, including the drops and why. Feeds telemetry and the review UI. */
  verdicts: ClassificationVerdict[]
  /**
   * Charges discarded as balance top-ups before grouping. Counted rather than
   * given verdicts, because they never form a group - but a mailbox where this
   * dominates is one where the rule needs looking at.
   */
  creditPurchases: number
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000)
}

function addDays(date: string, days: number): string {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

function periodForGap(gap: number): BillingPeriod | undefined {
  return ORDERED_PERIODS.find((p) => gap >= CYCLE_WINDOW[p][0] && gap <= CYCLE_WINDOW[p][1])
}

/** Half the width of a cycle's acceptance window, which is its per-cycle slack. */
function cycleSlack(period: BillingPeriod): number {
  const [low, high] = CYCLE_WINDOW[period]
  return (high - low) / 2
}

/**
 * The cycle that explains every gap, allowing a gap to span several cycles.
 *
 * Tested against each candidate cycle rather than against the median gap. The
 * median is not a cycle: a run with gaps of 30 and 60 days - one renewal email
 * the mailbox search never matched, which is the common case, not the edge one
 * - has a median of 45, and 45 is neither monthly nor anything else. Slack
 * grows with the number of cycles skipped, since two missed months accumulate
 * two months of drift.
 */
function fitPeriod(gaps: number[]): BillingPeriod | undefined {
  return ORDERED_PERIODS.find((period) => {
    const cycle = CYCLE_DAYS[period]
    return gaps.every((gap) => {
      const cycles = Math.round(gap / cycle)
      if (cycles < 1 || cycles > MAX_SKIPPED_CYCLES) return false
      return Math.abs(gap - cycles * cycle) <= cycles * cycleSlack(period)
    })
  })
}

/** Nearest cycle to an arbitrary span, used when only a next_billing_date is known. */
function snapToPeriod(gap: number): BillingPeriod | undefined {
  if (gap <= 0) return undefined
  const exact = periodForGap(gap)
  if (exact) return exact
  // Outside every window, fall back to the closest cycle length, but only when
  // it is within half a cycle - otherwise the span means nothing.
  let best: BillingPeriod | undefined
  let bestDistance = Infinity
  for (const p of ORDERED_PERIODS) {
    const distance = Math.abs(gap - CYCLE_DAYS[p])
    if (distance < bestDistance && distance <= CYCLE_DAYS[p] / 2) {
      best = p
      bestDistance = distance
    }
  }
  return best
}

/**
 * Whether the email itself says this charge recurs.
 *
 * stated_period counts. The prompt only sets it when the email names a cycle in
 * so many words - "$12/month", "billed annually" - which is the email saying it
 * recurs just as plainly as "your subscription renews". Leaving it out made the
 * lone-charge gate reject receipts it would then have happily taken a period
 * from, and single_charge_no_evidence became the top drop reason on every
 * mailbox measured.
 *
 * A renewal notice counts for the same reason: announcing an upcoming charge is
 * what recurring means.
 */
function hasRenewalEvidence(charge: Charge): boolean {
  return (
    charge.renewal_evidence === 'recurring_wording' ||
    charge.renewal_evidence === 'next_date_stated' ||
    charge.doc_type === 'renewal_notice' ||
    Boolean(charge.next_billing_date) ||
    Boolean(charge.stated_period)
  )
}

/**
 * Buy-now-pay-later split into equal instalments.
 *
 * Four equal payments a fortnight apart is a textbook consistent cadence, so
 * cadence alone cannot reject it. Each signal below is individually too weak to
 * act on - a real product could be called "Pay in 4 Weekly Planner", and a
 * genuine biweekly subscription also has even spacing - so two are required.
 * "Payment 2 of 4" read verbatim off the email is worth two on its own.
 */
function installmentScore(charges: Charge[]): number {
  let score = 0

  if (charges.some((c) => BNPL_NAME.test(c.merchant) || BNPL_NAME.test(c.plan ?? ''))) score += 1

  if (charges.some((c) => c.installment_total != null && c.installment_total <= 6)) score += 2

  const amounts = charges.map((c) => c.amount)
  const spread = Math.max(...amounts) - Math.min(...amounts)
  const gaps = consecutiveGaps(charges)
  const gap = median(gaps)
  // Exact to the cent across several charges: BNPL splits a total into equal
  // quarters, whereas real price drift is never that precise.
  if (charges.length >= 3 && charges.length <= 6 && spread <= 0.02 && gap >= 12 && gap <= 16) {
    score += 1
  }

  return score
}

function consecutiveGaps(charges: Charge[]): number[] {
  const dates = [...new Set(charges.map((c) => c.charge_date))].sort()
  const gaps: number[] = []
  for (let i = 1; i < dates.length; i++) gaps.push(daysBetween(dates[i - 1], dates[i]))
  return gaps
}

/**
 * Whether the amounts look like one plan rather than a shopping history.
 *
 * Median absolute deviation, not standard deviation: a single annual add-on on
 * an otherwise monthly plan would dominate a stddev and kill a real
 * subscription, while MAD ignores it. A price rise is a step, not noise - half
 * the points sit at each level - so even a 50% mid-run increase stays well
 * under the threshold, whereas a retailer's amounts ($2 to $165) land far above
 * it. The two populations are separated by a wide empty gap, which is why the
 * exact threshold does not need to be precise.
 */
function amountVariation(charges: Charge[]): number {
  const amounts = charges.map((c) => c.amount)
  const med = median(amounts)
  if (med === 0) return 0
  return median(amounts.map((a) => Math.abs(a - med))) / med
}

/**
 * Usage-based plans (API credits, metered hosting) are genuinely recurring with
 * genuinely variable amounts, so they need a way past the variance gate - but
 * only on explicit evidence, never on the amounts alone.
 */
function looksMeteredButRecurring(charges: Charge[]): boolean {
  // Two separate emails naming the same cycle. Spelled out rather than reusing
  // hasRenewalEvidence so widening that gate cannot quietly widen this one.
  const stated = charges.map((c) => c.stated_period).filter(Boolean)
  return stated.length >= 2 && new Set(stated).size === 1
}

/**
 * The cycle a group is on.
 *
 * Gaps come from `segments` - the charges that actually moved money - while
 * evidence is read from the whole `group`. A renewal notice dated a week before
 * the receipt it announces is a real timeline point but not a payment, and
 * counting it as one turns a monthly plan's 30-day rhythm into gaps of 23 and 7,
 * which fits WEEKLY and nothing else.
 */
function detectCadence(
  segments: Charge[],
  group: Charge[],
): {
  period?: BillingPeriod
  medianGap?: number
  reason?: DropReason
  evidence?: KeepEvidence
} {
  const gaps = consecutiveGaps(segments)
  const statedInGroup = group.find((c) => c.stated_period)?.stated_period

  if (gaps.length === 0) {
    // A lone charge. Only the emails' own words can make it a subscription -
    // including a renewal notice sitting alongside the receipt.
    const [only] = segments
    if (!group.some(hasRenewalEvidence)) return { reason: 'single_charge_no_evidence' }

    if (statedInGroup) return { period: statedInGroup, evidence: 'stated_period' }

    const nextDate =
      only.next_billing_date ?? group.find((c) => c.next_billing_date)?.next_billing_date
    if (nextDate) {
      const period = snapToPeriod(daysBetween(only.charge_date, nextDate))
      if (period) return { period, evidence: 'next_billing_date' }
    }
    // Recurring, but on an unknown cycle - which cannot be put on a dashboard.
    return { reason: 'no_cycle' }
  }

  if (gaps.length === 1) {
    const corroborated = group.some(hasRenewalEvidence)
    const period = periodForGap(gaps[0])

    // Two charges roughly a year apart are weak evidence on their own: annual
    // fees, permit renewals and anniversary purchases all look like this, and
    // two parking tickets twelve months apart would otherwise become a yearly
    // subscription. Sub-annual cadences are far harder to produce by accident,
    // so only the yearly case needs the email to actually say something.
    if (period === 'YEARLY' && !corroborated) return { reason: 'single_charge_no_evidence' }
    if (period) return { period, medianGap: gaps[0], evidence: 'two_charges' }

    // A spacing that matches no cycle. The printed word still counts: a plan
    // billed annually can be collected in two instalments.
    if (statedInGroup)
      return { period: statedInGroup, medianGap: gaps[0], evidence: 'stated_period' }
    return { reason: 'irregular_cadence' }
  }

  const period = fitPeriod(gaps)
  if (!period) return { reason: 'irregular_cadence' }

  return { period, medianGap: median(gaps), evidence: 'cadence' }
}

// A merchant string the sender's own system cut short, e.g. a bank statement
// descriptor. Reported verbatim by the model and repaired here, never guessed at.
const TRUNCATED_NAME = /(\.{2,}|…)\s*$/

/** The fullest name seen for a group, so a truncated stub never wins over a complete one. */
function fullestName(names: (string | undefined)[]): string {
  const trimmed = names.map((n) => n?.trim()).filter((n): n is string => Boolean(n))
  const untruncated = trimmed.filter((n) => !TRUNCATED_NAME.test(n))
  const pool = untruncated.length > 0 ? untruncated : trimmed
  return pool.sort((a, b) => b.length - a.length)[0] ?? ''
}

function words(value: string): string[] {
  return value.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []
}

/**
 * What the card should read: the product plus its tier.
 *
 * The tier belongs in the name, not just in the grouping key. Without it
 * "Netflix Premium" and "Netflix Standard" are two cards both saying "Netflix"
 * at two different prices, which reads as a duplicate rather than as two plans.
 *
 * Every charge in a group shares a plan bucket, so any member's plan string
 * describes all of them. The shortest is taken because it is the one least
 * likely to carry billing prose - "Pro" rather than "Pro plan, billed monthly".
 */
function displayNameFor(charges: Charge[]): string {
  const merchant = fullestName(charges.map((c) => c.merchant))
  const plan = charges
    .map((c) => c.plan?.trim())
    .filter((p): p is string => Boolean(p))
    .sort((a, b) => a.length - b.length)[0]

  if (!plan) return merchant

  // Whole words, not a substring test: "Proton" contains "pro" without being
  // the Pro tier, and suppressing the tier there would lose it entirely.
  const merchantWords = new Set(words(merchant))
  const planWords = words(plan)
  if (planWords.length > 0 && planWords.every((word) => merchantWords.has(word))) return merchant

  return `${merchant} ${plan}`
}

function firstDefined<T>(charges: Charge[], pick: (c: Charge) => T | undefined): T | undefined {
  for (const charge of charges) {
    const value = pick(charge)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return undefined
}

function groupKey(charge: Charge): string {
  const currency = (charge.currency ?? '').toUpperCase()
  return `${serviceKey(charge.merchant)}::${planBucket(charge.plan)}::${currency}`
}

/**
 * Folds a group whose every name was cut short into its unabbreviated sibling.
 *
 * "Ancestry.com Operati..." and "Ancestry.com Operations" cannot match by
 * equality, because the bank really did delete those characters. Prefix
 * matching would be reckless in general - "Apple" would swallow "Apple TV" -
 * so it is gated twice: the group must consist entirely of visibly truncated
 * names, and exactly one untruncated key may match. Anything ambiguous is left
 * alone rather than guessed at.
 */
function absorbTruncatedKeys(groups: Map<string, Charge[]>): void {
  const truncatedKeys = [...groups.entries()]
    .filter(([, charges]) => charges.every((c) => TRUNCATED_NAME.test(c.merchant.trim())))
    .map(([key]) => key)

  for (const key of truncatedKeys) {
    const [name, plan, currency] = key.split('::')
    if (!name) continue

    const candidates = [...groups.keys()].filter((other) => {
      if (other === key) return false
      const [otherName, otherPlan, otherCurrency] = other.split('::')
      return (
        otherPlan === plan &&
        otherCurrency === currency &&
        otherName.length > name.length &&
        otherName.startsWith(name)
      )
    })

    if (candidates.length !== 1) continue

    const source = groups.get(key)
    const target = groups.get(candidates[0])
    if (!source || !target) continue

    target.push(...source)
    groups.delete(key)
  }
}

export function classifyCharges(charges: Charge[]): ClassificationResult {
  const groups = new Map<string, Charge[]>()

  let creditPurchases = 0

  for (const raw of charges) {
    const charge = groundEvidence(raw)
    // A refund reverses money rather than moving it, and an order confirmation
    // that says nothing about renewing is a retail purchase. Neither is a
    // charge, and neither may contribute to a cadence.
    if (charge.is_refund || charge.doc_type === 'refund') continue
    if (charge.doc_type === 'order_confirmation' && charge.renewal_evidence === 'none') continue
    if (charge.amount <= 0 && !charge.is_trial) continue

    // Credits are the hardest false positive the classifier faces, because they
    // come from companies that genuinely do sell subscriptions and often arrive
    // on a regular cadence. Buying 20 credits monthly is a habit, not a plan.
    // Dropped here rather than in a verdict so they never form a group, never
    // supply a gap, and can never be mistaken for the plan sold alongside them.
    if (isCreditPurchase(charge)) {
      creditPurchases += 1
      continue
    }

    const key = groupKey(charge)
    const existing = groups.get(key)
    if (existing) existing.push(charge)
    else groups.set(key, [charge])
  }

  absorbTruncatedKeys(groups)

  const subscriptions: DiscoveredSubscription[] = []
  const verdicts: ClassificationVerdict[] = []

  for (const [key, group] of groups) {
    const sorted = [...group].sort((a, b) => a.charge_date.localeCompare(b.charge_date))
    const displayName = displayNameFor(sorted)
    const totalAmount = sorted.reduce((sum, c) => sum + c.amount, 0)

    const drop = (reason: DropReason, period?: BillingPeriod, medianGap?: number) => {
      verdicts.push({
        merchant_key: key,
        display_name: displayName,
        charge_count: sorted.length,
        outcome: 'dropped',
        reason,
        period,
        median_gap_days: medianGap,
        total_amount: totalAmount,
      })
    }

    if (installmentScore(sorted) >= 2) {
      drop('installment_plan')
      continue
    }

    if (amountVariation(sorted) > MAX_AMOUNT_VARIATION && !looksMeteredButRecurring(sorted)) {
      drop('amount_variance')
      continue
    }

    // A renewal notice proves recurrence but moves no money, so it informs the
    // verdict without becoming a segment or a gap. When notices are the only
    // thing the mailbox held, though, dropping the group loses a subscription
    // the email explicitly says is live and even prices - so the notice becomes
    // the segment instead.
    const receipts = sorted.filter((c) => c.doc_type !== 'renewal_notice')
    const paid = receipts.length > 0 ? receipts : sorted.filter((c) => c.amount > 0)
    if (paid.length === 0) {
      drop('zero_amount')
      continue
    }

    const { period, medianGap, reason, evidence } = detectCadence(paid, sorted)
    if (!period) {
      drop(reason ?? 'irregular_cadence', undefined, medianGap)
      continue
    }

    verdicts.push({
      merchant_key: key,
      display_name: displayName,
      charge_count: sorted.length,
      outcome: 'recurring',
      evidence,
      period,
      median_gap_days: medianGap,
      total_amount: totalAmount,
    })

    const currency = firstDefined(sorted, (c) => c.currency)
    const category = firstDefined(sorted, (c) => c.category)
    const serviceUrl = firstDefined(sorted, (c) => c.service_url)
    const unsubscribeUrl = firstDefined(sorted, (c) => c.list_unsubscribe)
    const receiptUrl = firstDefined(sorted, (c) => c.receipt_url)

    for (const charge of paid) {
      subscriptions.push({
        service_name: displayName,
        price: charge.amount,
        period,
        currency,
        start_date: charge.charge_date,
        // One cycle from the charge date. Emitting a segment per charge and
        // never a merged span is what keeps this layer out of the business of
        // deciding where a run starts and stops.
        end_date: addDays(charge.charge_date, CYCLE_DAYS[period]),
        category,
        service_url: serviceUrl,
        unsubscribe_url: unsubscribeUrl,
        receipt_url: receiptUrl,
        is_trial: charge.is_trial || undefined,
        // Owned by consolidateSubscriptionPeriods, which sets it from whether
        // the finished run still covers today.
        auto_renew: false,
      })
    }
  }

  return { subscriptions, verdicts, creditPurchases }
}
