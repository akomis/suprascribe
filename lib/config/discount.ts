/**
 * The single source of truth for limited-time PRO discounts.
 * Each window is one named offer: what it is called and which days it runs.
 * Every window sells PRO at the same offer price (`priceCents`).
 *
 * It drives three things at once, so they can never drift apart:
 *   - the countdown badge on the landing page pricing card
 *   - the prices shown on the landing page and the SEO calculator page
 *   - the amount actually charged by Stripe (see `getProPriceCents` in ./pricing)
 *
 * `priceCents` here is the euro offer price; ./pricing holds its counterpart in
 * every other currency we sell in.
 *
 * To run a new offer, add a window. To end one early, move its `endsOn` or remove it.
 * Outside every window every surface falls back to the full price with no badge
 * and no struck-through original price.
 */
export interface DiscountWindow {
  /** Offer name shown in the pricing card badge. */
  name: string
  /** First day the offer is honoured, inclusive, in YYYY-MM-DD. */
  startsOn: string
  /** Last day the offer is honoured, inclusive, in YYYY-MM-DD. */
  endsOn: string
}

export const DISCOUNT = {
  /** Windows must not overlap; the first one matching wins. */
  windows: [
    { name: 'Black Friday', startsOn: '2026-11-27', endsOn: '2026-11-29' },
    { name: 'Cyber Monday', startsOn: '2026-11-30', endsOn: '2026-11-30' },
  ] as DiscountWindow[],
  /** What PRO costs while any window runs, in cents. Discount percentage is derived from it. */
  priceCents: 1000,
}

export interface DiscountStatus {
  active: boolean
  /** Name of the running offer, e.g. "Black Friday". Null when no offer runs. */
  name: string | null
  /** Whole days left in the running offer, including today. 0 when no offer runs. */
  daysLeft: number
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

const INACTIVE: DiscountStatus = { active: false, name: null, daysLeft: 0 }

/** Local-time Date for a YYYY-MM-DD day at the given time, or null if malformed. */
function localDay(value: string, hours: number, minutes: number, seconds: number, ms: number) {
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day, hours, minutes, seconds, ms)
}

/**
 * Resolve the offers against a point in time. Dates are interpreted in the
 * runtime's local timezone, so the countdown matches the visitor's own calendar.
 */
export function getDiscountStatus(now: Date = new Date()): DiscountStatus {
  for (const window of DISCOUNT.windows) {
    const startsAt = localDay(window.startsOn, 0, 0, 0, 0)
    const endsAt = localDay(window.endsOn, 23, 59, 59, 999)
    if (!startsAt || !endsAt) continue
    if (now < startsAt || now > endsAt) continue

    return {
      active: true,
      name: window.name,
      daysLeft: Math.ceil((endsAt.getTime() - now.getTime()) / MS_PER_DAY),
    }
  }
  return INACTIVE
}

/**
 * Badge text, e.g. "50% - Black Friday (3 days left)". Null when no offer runs.
 * The percentage is dropped if the offer price is not actually cheaper.
 */
export function formatDiscountLabel(
  status: DiscountStatus,
  discountPercent: number,
): string | null {
  if (!status.active || !status.name) return null
  const unit = status.daysLeft === 1 ? 'day' : 'days'
  const countdown = `${status.name} (${status.daysLeft} ${unit} left)`
  return discountPercent > 0 ? `${discountPercent}% - ${countdown}` : countdown
}
