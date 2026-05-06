import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import type {
  GroupByOption,
  InsightData,
  InsightMode,
  InsightTab,
  PieDataItem,
  Subscription,
} from '@/lib/types/subscriptions'
import { convertCurrency } from '@/lib/utils/currency'
import { getMostRecent } from '@/lib/utils/subscription-aggregation'

// Inclusive month count between two dates (e.g. Jan 1 → Jan 31 = 1, not 0)
function monthsInclusive(start: Date, end: Date): number {
  return Math.max(
    0,
    (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1,
  )
}

export function sumMonthly(subs: Subscription[]): number {
  return subs.reduce((sum, s) => sum + s.monthlyCost, 0)
}

export function nextExpiring(subs: Subscription[], today = new Date()): Subscription[] {
  if (subs.length === 0) return []
  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  return subs
    .filter((s) => {
      const endDate = new Date(s.endDate)
      return s.autoRenew && endDate >= today && endDate <= sevenDaysFromNow
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
}

function isActiveOnDate(sub: Subscription, date: Date): boolean {
  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)
  return startDate <= date && date <= endDate
}

export function getActiveSubscriptionsForMonth(
  subs: Subscription[],
  today = new Date(),
): Subscription[] {
  const day = new Date(today)
  day.setHours(0, 0, 0, 0)
  return subs.filter((s) => isActiveOnDate(s, day))
}

export function getPastSubscriptionsForYear(
  subs: Subscription[],
  year: number,
  today = new Date(),
): Subscription[] {
  const day = new Date(today)
  day.setHours(0, 0, 0, 0)
  return subs.filter((s) => {
    const endDate = new Date(s.endDate)
    return endDate < day && endDate.getFullYear() === year
  })
}

// Does not clamp to today - use for historical/full-year calculations
function getActiveMonthsInYearFull(sub: Subscription, year: number): number {
  const effectiveStart = new Date(
    Math.max(new Date(sub.startDate).getTime(), new Date(year, 0, 1).getTime()),
  )
  const effectiveEnd = new Date(
    Math.min(new Date(sub.endDate).getTime(), new Date(year, 11, 31).getTime()),
  )
  if (effectiveEnd < effectiveStart) return 0
  return monthsInclusive(effectiveStart, effectiveEnd)
}

// Clamps to today - use for YTD spent calculations
export function getActiveMonthsInYear(sub: Subscription, year: number, today = new Date()): number {
  const effectiveStart = new Date(
    Math.max(new Date(sub.startDate).getTime(), new Date(year, 0, 1).getTime()),
  )
  const effectiveEnd = new Date(
    Math.min(new Date(sub.endDate).getTime(), new Date(year, 11, 31).getTime(), today.getTime()),
  )
  if (effectiveEnd < effectiveStart) return 0
  return monthsInclusive(effectiveStart, effectiveEnd)
}

export function calculateSpentInYear(sub: Subscription, year: number): number {
  return sub.monthlyCost * getActiveMonthsInYearFull(sub, year)
}

export function calculateSpentThisYear(sub: Subscription, today = new Date()): number {
  return sub.monthlyCost * getActiveMonthsInYear(sub, today.getFullYear(), today)
}

export function calculateForecastThisYear(sub: Subscription, today = new Date()): number {
  const currentYear = today.getFullYear()
  const jan1st = new Date(currentYear, 0, 1)
  const dec31st = new Date(currentYear, 11, 31)

  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)

  if (startDate > dec31st || endDate < jan1st) return 0

  const spentMonths = getActiveMonthsInYear(sub, currentYear, today)

  if (endDate > today && sub.autoRenew) {
    const remainingStart = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    const effectiveEnd = new Date(Math.min(endDate.getTime(), dec31st.getTime()))

    if (effectiveEnd >= remainingStart) {
      const remainingMonths =
        (effectiveEnd.getFullYear() - remainingStart.getFullYear()) * 12 +
        (effectiveEnd.getMonth() - remainingStart.getMonth()) +
        1
      return sub.monthlyCost * (spentMonths + Math.max(0, remainingMonths))
    }
  }

  return sub.monthlyCost * spentMonths
}

export function calculateServiceSpentThisYear(
  subs: { start_date: string | null; end_date: string | null; price: number | null }[],
  monthlyPrice: number,
  today = new Date(),
): number {
  const day = new Date(today)
  day.setHours(0, 0, 0, 0)
  const jan1st = new Date(day.getFullYear(), 0, 1)

  const recordsThisYear = subs.filter((s) => {
    if (!s.start_date) return false
    const d = new Date(s.start_date)
    return d >= jan1st && d <= day
  })

  if (recordsThisYear.length > 0) {
    return recordsThisYear.reduce((sum, s) => sum + (s.price || 0), 0)
  }

  const activeRecord = subs.find((s) => {
    if (!s.start_date || !s.end_date) return false
    const start = new Date(s.start_date)
    const end = new Date(s.end_date)
    return start <= day && end >= jan1st
  })

  if (activeRecord) {
    const effectiveStart =
      new Date(activeRecord.start_date!) < jan1st ? jan1st : new Date(activeRecord.start_date!)
    const monthsElapsed =
      (day.getFullYear() - effectiveStart.getFullYear()) * 12 +
      (day.getMonth() - effectiveStart.getMonth()) +
      1
    return monthlyPrice * Math.max(0, monthsElapsed)
  }

  return 0
}

export function calculateServiceForecastThisYear(
  subs: { start_date: string | null; end_date: string | null; price: number | null }[],
  monthlyPrice: number,
  autoRenew: boolean,
  today = new Date(),
): number {
  const day = new Date(today)
  day.setHours(0, 0, 0, 0)

  const spent = calculateServiceSpentThisYear(subs, monthlyPrice, today)

  if (!autoRenew) return spent

  const jan1st = new Date(day.getFullYear(), 0, 1)
  const dec31st = new Date(day.getFullYear(), 11, 31)

  const earliestStart = subs.reduce<Date | null>((earliest, s) => {
    if (!s.start_date) return earliest
    const d = new Date(s.start_date)
    return earliest === null || d < earliest ? d : earliest
  }, null)

  if (!earliestStart) return 0

  const effectiveStart = earliestStart < jan1st ? jan1st : earliestStart
  return monthlyPrice * monthsInclusive(effectiveStart, dec31st)
}

type RawServiceSub = {
  start_date: string | null
  end_date: string | null
  price: number | null
  currency: string
  auto_renew: boolean | null
}

type ServiceGroup = {
  subscriptions: RawServiceSub[]
  merged: { startDate: string; endDate: string }
}

function prepareServiceGroup(
  subs: RawServiceSub[],
  targetCurrency: CurrencyCode,
): { convertedSubs: RawServiceSub[]; monthlyCost: number; autoRenew: boolean } {
  const mostRecent = getMostRecent(subs)
  const monthlyCost = convertCurrency(
    mostRecent?.price || 0,
    mostRecent?.currency as CurrencyCode,
    targetCurrency,
  )
  const convertedSubs = subs.map((s) => ({
    ...s,
    price: convertCurrency(s.price || 0, s.currency as CurrencyCode, targetCurrency),
  }))
  return { convertedSubs, monthlyCost, autoRenew: Boolean(mostRecent?.auto_renew) }
}

export function buildInsights(
  mergedSubscriptionsList: Subscription[],
  serviceGroups: Iterable<ServiceGroup>,
  opts: {
    targetCurrency: CurrencyCode
    groupBy: GroupByOption
    mode: InsightMode
    tab: InsightTab
    year?: number
  },
): InsightData {
  const { targetCurrency, groupBy, mode, tab, year } = opts

  let totalMonthly: number
  let yearly: number
  let expiring: Subscription[]
  let pieData: PieDataItem[]

  if (tab === 'active') {
    const activeThisMonth = getActiveSubscriptionsForMonth(mergedSubscriptionsList)
    totalMonthly = sumMonthly(activeThisMonth)

    const currentYear = new Date().getFullYear()
    const jan1st = new Date(currentYear, 0, 1)
    const dec31st = new Date(currentYear, 11, 31)

    const activeGroups = Array.from(serviceGroups).filter(({ merged }) => {
      const startDate = new Date(merged.startDate)
      const endDate = new Date(merged.endDate)
      return startDate <= dec31st && endDate >= jan1st
    })

    if (mode === 'spent') {
      yearly = activeGroups.reduce((sum, { subscriptions: subs }) => {
        const { convertedSubs, monthlyCost } = prepareServiceGroup(subs, targetCurrency)
        return sum + calculateServiceSpentThisYear(convertedSubs, monthlyCost)
      }, 0)
    } else {
      yearly = activeGroups.reduce((sum, { subscriptions: subs }) => {
        const { convertedSubs, monthlyCost, autoRenew } = prepareServiceGroup(subs, targetCurrency)
        return sum + calculateServiceForecastThisYear(convertedSubs, monthlyCost, autoRenew)
      }, 0)
    }

    expiring = nextExpiring(mergedSubscriptionsList)
    pieData = generatePieData(activeThisMonth, groupBy)
  } else {
    const targetYear = year || new Date().getFullYear() - 1
    const pastSubs = getPastSubscriptionsForYear(mergedSubscriptionsList, targetYear)

    totalMonthly = sumMonthly(pastSubs)
    yearly = pastSubs.reduce((sum, sub) => sum + calculateSpentInYear(sub, targetYear), 0)

    expiring = []
    pieData = generatePieData(pastSubs, groupBy)
  }

  return {
    totalMonthly,
    yearly,
    mostExpensive: null,
    leastExpensive: null,
    nextExpiring: expiring.map((sub) => ({ name: sub.name, url: sub.url, endDate: sub.endDate })),
    pieData,
  }
}

export function generatePieData(subs: Subscription[], groupBy: GroupByOption): PieDataItem[] {
  if (groupBy === 'service') {
    return subs.map((s) => ({ name: s.name, value: s.monthlyCost, fill: '' }))
  }

  if (groupBy === 'category') {
    const grouped = new Map<string, number>()
    subs.forEach((s) => {
      const category = s.category || 'Other'
      grouped.set(category, (grouped.get(category) || 0) + s.monthlyCost)
    })
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value, fill: '' }))
  }

  if (groupBy === 'paymentMethod') {
    const grouped = new Map<string, number>()
    subs.forEach((s) => {
      const method = s.paymentMethod || 'Unknown'
      grouped.set(method, (grouped.get(method) || 0) + s.monthlyCost)
    })
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value, fill: '' }))
  }

  if (groupBy === 'sourceEmail') {
    const grouped = new Map<string, number>()
    subs.forEach((s) => {
      const email = s.sourceEmail || 'Manually Added'
      grouped.set(email, (grouped.get(email) || 0) + s.monthlyCost)
    })
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value, fill: '' }))
  }

  return []
}
