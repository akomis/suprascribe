/**
 * The single source of truth for the limited-time PRO discount.
 * Two knobs: how long it runs, and what PRO costs while it does.
 *
 * It drives three things at once, so they can never drift apart:
 *   - the countdown badge on the landing page pricing card
 *   - the prices shown on the landing page and the SEO calculator page
 *   - the amount actually charged by Stripe (see `getProPriceCents` in ./stripe)
 *
 * To run the offer for another month, move `endsOn` to that month's last day.
 * Set it to `null` to end the offer immediately: every surface falls back to
 * PRO_FULL_PRICE_CENTS with no badge and no struck-through original price.
 */
export const DISCOUNT = {
  /** Last day the offer is honoured, inclusive, in YYYY-MM-DD. `null` disables the offer. */
  endsOn: null as string | null,
  /** What PRO costs while the offer runs, in cents. Discount percentage is derived from it. */
  priceCents: 1000,
}

export interface DiscountStatus {
  active: boolean
  /** Month the offer runs in, e.g. "August". Empty when the offer is disabled. */
  month: string
  /** Whole days left including today. 0 once the offer has ended. */
  daysLeft: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const INACTIVE: DiscountStatus = { active: false, month: '', daysLeft: 0 }

/**
 * Resolve the offer against a point in time. Dates are interpreted in the
 * runtime's local timezone, so the countdown matches the visitor's own calendar.
 */
export function getDiscountStatus(now: Date = new Date()): DiscountStatus {
  if (!DISCOUNT.endsOn) return INACTIVE

  const [year, month, day] = DISCOUNT.endsOn.split('-').map(Number)
  if (!year || !month || !day) return INACTIVE

  const endsAt = new Date(year, month - 1, day, 23, 59, 59, 999)
  const msLeft = endsAt.getTime() - now.getTime()
  if (msLeft <= 0) return INACTIVE

  return {
    active: true,
    month: endsAt.toLocaleString('en-US', { month: 'long' }),
    daysLeft: Math.ceil(msLeft / MS_PER_DAY),
  }
}

/**
 * Badge text, e.g. "50% - August Offer · 16 days left". Null when the offer is over.
 * The percentage is dropped if the offer price is not actually cheaper.
 */
export function formatDiscountLabel(
  status: DiscountStatus,
  discountPercent: number,
): string | null {
  if (!status.active) return null
  const unit = status.daysLeft === 1 ? 'day' : 'days'
  const countdown = `${status.month} Offer (${status.daysLeft} ${unit} left)`
  return discountPercent > 0 ? `${discountPercent}% - ${countdown}` : countdown
}
