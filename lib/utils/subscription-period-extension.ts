import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'
import { toDateString } from '@/lib/utils/date'

// Tolerate a slightly late or missed receipt, both when judging whether two
// periods are consecutive and when judging whether the newest one is still live.
const GRACE_BUFFER_DAYS = 10

// Approximate length of one billing cycle in days, keyed by billing period.
const CYCLE_DAYS: Record<BillingPeriod, number> = {
  WEEKLY: 7,
  MONTHLY: 30,
  QUARTERLY: 90,
  YEARLY: 365,
}

function getCycleDays(period?: BillingPeriod): number {
  return period ? CYCLE_DAYS[period] : 30
}

function endOf(sub: DiscoveredSubscription): string {
  return sub.end_date || sub.start_date
}

function daysBetween(from: string, to: string): number {
  return Math.round((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24))
}

function todayString(): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return toDateString(today)
}

// A period is spent once its end date is today or earlier, matching how
// isSubscriptionActive classifies it in the UI. Compared as YYYY-MM-DD strings
// so a local-midnight Date never gets measured against a UTC-midnight one.
function hasElapsed(dateStr: string): boolean {
  return dateStr <= todayString()
}

function laterDate(a: string, b: string): string {
  return a && b ? (a > b ? a : b) : a || b
}

// A single charge with no recurrence: credits, one-off purchases. Identified by
// the absence of a billing period alone - a recurring receipt whose end_date the
// model omitted also collapses to end === start, and must not be mistaken for
// one of these or it shows up as a separate one-time row for every month.
export function isOneTimePayment(sub: Pick<DiscoveredSubscription, 'period'>): boolean {
  return !sub.period
}

// Heading of the discovery-results section that collects the one-time charges,
// kept apart from the active/past split, which only describes a recurring one.
export const ONE_TIME_SECTION_LABEL = 'Recurring'

// Restores the span of a recurring receipt that arrived without an end_date:
// one billing cycle from the charge date. Without this the segment cannot join
// its timeline, because it looks like a zero-length period.
function withDerivedEnd(sub: DiscoveredSubscription): DiscoveredSubscription {
  if (endOf(sub) > sub.start_date) return sub

  const end = new Date(sub.start_date)
  end.setDate(end.getDate() + getCycleDays(sub.period))

  return { ...sub, end_date: toDateString(end) }
}

// One timeline per service + billing period. Price is deliberately excluded:
// a price change mid-subscription is still the same continuous subscription.
// A different billing period is a different plan and gets its own timeline.
function timelineKey(sub: DiscoveredSubscription): string {
  return `${sub.service_name.toLowerCase().trim()}|${sub.period ?? 'MONTHLY'}`
}

// Two segments belong to the same run if the newer one starts within a billing
// cycle (plus grace for a late receipt) of the older one ending. A longer gap
// means the subscription actually lapsed and was restarted later.
function isContinuous(earlier: DiscoveredSubscription, later: DiscoveredSubscription): boolean {
  const gap = daysBetween(endOf(earlier), later.start_date)
  return gap <= getCycleDays(later.period ?? earlier.period) + GRACE_BUFFER_DAYS
}

// Later receipts win on price and payment details (they reflect the current
// state); earlier ones fill gaps the newer receipt did not mention.
function mergeIntoRun(
  run: DiscoveredSubscription,
  next: DiscoveredSubscription,
): DiscoveredSubscription {
  return {
    ...run,
    price: next.price,
    currency: next.currency || run.currency,
    start_date: run.start_date,
    end_date: laterDate(endOf(run), endOf(next)),
    category: run.category || next.category,
    service_url: run.service_url || next.service_url,
    unsubscribe_url: next.unsubscribe_url || run.unsubscribe_url,
    payment_method: next.payment_method || run.payment_method,
    auto_renew: run.auto_renew || next.auto_renew,
  }
}

/**
 * Whether a run that is past its next-billing date is still probably running.
 *
 * end_date is the next billing date from the LAST receipt we captured, which is
 * not the same as the last receipt that exists. A renewal email can easily go
 * unseen: it may not match the subject keywords, it may have landed after the
 * scan, or it may have fallen outside the fetch window. So a run sitting less
 * than one cycle past its end means exactly one expected receipt is missing,
 * which is ordinary. Only past a full cycle have two or more consecutive
 * receipts gone missing, and that genuinely suggests the subscription ended.
 *
 * This is the same tolerance isContinuous applies between two segments, with
 * today standing in for the next segment's start - the tail of a timeline gets
 * judged by the same rule as its middle.
 *
 * The window used to be a flat 10 days, which marked a monthly subscription
 * "Past" a week and a half after a single missed receipt. For a tracker that is
 * the worst way to be wrong: the user stops seeing money they are still paying.
 * Showing a cancelled subscription as active is visible and one click to fix.
 */
function isRecentlyLapsed(sub: DiscoveredSubscription): boolean {
  if (isOneTimePayment(sub)) return false
  const end = endOf(sub)
  if (!hasElapsed(end)) return false
  return daysBetween(end, todayString()) <= getCycleDays(sub.period) + GRACE_BUFFER_DAYS
}

// Advances the run's own end date by whole cycles until it covers today. This
// extends the existing period in place rather than appending a projected one -
// the renewal edge function owns every period after this.
function extendToCoverToday(sub: DiscoveredSubscription): DiscoveredSubscription {
  const cycleDays = getCycleDays(sub.period)
  const end = new Date(endOf(sub))

  // Runs past today rather than up to it, since a period ending today already
  // counts as spent. Bounded: callers only pass runs that ended within one
  // cycle + grace, so this advances at most twice.
  while (hasElapsed(toDateString(end))) {
    end.setDate(end.getDate() + cycleDays)
  }

  return { ...sub, end_date: toDateString(end) }
}

/**
 * Collapses each service's receipts into continuous runs.
 *
 * Consecutive billing periods for one service are a single subscription, so
 * they merge into one entry spanning the first receipt to the latest period
 * end. A run is only broken into a separate entry when there is a real gap in
 * the timeline - the subscription lapsed and was started again later - which
 * surfaces as a PAST entry alongside the ACTIVE one.
 *
 * The most recent run is stretched to cover today when its last period ended
 * within the previous cycle, so a subscription whose renewal receipt has not
 * arrived yet still reads as ACTIVE. Nothing is ever appended as a separate
 * projected period - the renewal edge function handles everything beyond the
 * current one. Runs that lapsed longer ago stay in the past.
 *
 * One-time payments are passed through untouched.
 */
export function consolidateSubscriptionPeriods(
  subscriptions: DiscoveredSubscription[],
): DiscoveredSubscription[] {
  const timelines = new Map<string, DiscoveredSubscription[]>()
  const result: DiscoveredSubscription[] = []

  for (const sub of subscriptions) {
    if (isOneTimePayment(sub)) {
      result.push(sub)
      continue
    }
    const key = timelineKey(sub)
    const existing = timelines.get(key) || []
    existing.push(withDerivedEnd(sub))
    timelines.set(key, existing)
  }

  for (const segments of timelines.values()) {
    const sorted = [...segments].sort((a, b) => a.start_date.localeCompare(b.start_date))
    const runs: DiscoveredSubscription[] = []

    for (const segment of sorted) {
      const currentRun = runs[runs.length - 1]

      if (currentRun && isContinuous(currentRun, segment)) {
        runs[runs.length - 1] = mergeIntoRun(currentRun, segment)
      } else {
        runs.push({ ...segment, end_date: endOf(segment) })
      }
    }

    // Only the most recent run can still be live. Earlier runs are lapsed
    // subscriptions and stay where they are.
    const lastIndex = runs.length - 1
    if (lastIndex >= 0 && isRecentlyLapsed(runs[lastIndex])) {
      runs[lastIndex] = extendToCoverToday(runs[lastIndex])
    }

    // A run covering today is one we expect to renew, and the edge function
    // will append the next period on its own. An elapsed run must never stay
    // flagged, or that same function would revive a subscription that ended.
    result.push(...runs.map((run) => ({ ...run, auto_renew: !hasElapsed(endOf(run)) })))
  }

  return result
}
