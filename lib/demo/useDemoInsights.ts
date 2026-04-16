import { useMemo } from 'react'
import type { DemoMergedSubscription } from '@/lib/demo/sampleData'
import type {
  InsightData,
  GroupByOption,
  InsightMode,
  InsightTab,
  PieDataItem,
} from '@/lib/hooks/useInsights'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import { convertCurrency } from '@/lib/utils/currency'
import { useDemoContext } from '@/components/demo/DemoProvider'

type Subscription = {
  id: string
  name: string
  url?: string
  monthlyCost: number
  currency: CurrencyCode
  startDate: string
  endDate: string
  category?: string | null
  paymentMethod?: string | null
  autoRenew: boolean
}

function sumMonthly(subs: Subscription[]) {
  return subs.reduce((sum, s) => sum + s.monthlyCost, 0)
}

function nextExpiring(subs: Subscription[]) {
  if (subs.length === 0) return []
  const now = new Date()
  const sevenDaysFromNow = new Date(now)
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  return subs
    .filter((s) => {
      const endDate = new Date(s.endDate)
      return s.autoRenew && endDate >= now && endDate <= sevenDaysFromNow
    })
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
}

function isActiveOnDate(sub: Subscription, date: Date): boolean {
  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)
  return startDate <= date && date <= endDate
}

function getActiveSubscriptionsForMonth(subs: Subscription[]): Subscription[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return subs.filter((s) => isActiveOnDate(s, today))
}

function getActiveSubscriptionsForYear(subs: Subscription[]): Subscription[] {
  const currentYear = new Date().getFullYear()
  const jan1st = new Date(currentYear, 0, 1)
  const dec31st = new Date(currentYear, 11, 31)
  return subs.filter((s) => {
    const startDate = new Date(s.startDate)
    const endDate = new Date(s.endDate)
    return startDate <= dec31st && endDate >= jan1st
  })
}

function getPastSubscriptionsForYear(subs: Subscription[], year: number): Subscription[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return subs.filter((s) => {
    const endDate = new Date(s.endDate)
    return endDate < today && endDate.getFullYear() === year
  })
}

function getActiveMonthsInYearFull(sub: Subscription, year: number): number {
  const jan1st = new Date(year, 0, 1)
  const dec31st = new Date(year, 11, 31)

  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)

  const effectiveStart = new Date(Math.max(startDate.getTime(), jan1st.getTime()))
  const effectiveEnd = new Date(Math.min(endDate.getTime(), dec31st.getTime()))

  if (effectiveEnd < effectiveStart) return 0

  const monthsDiff =
    (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12 +
    (effectiveEnd.getMonth() - effectiveStart.getMonth()) +
    1

  return Math.max(0, monthsDiff)
}

function calculateSpentInYear(sub: Subscription, year: number): number {
  const activeMonths = getActiveMonthsInYearFull(sub, year)
  return sub.monthlyCost * activeMonths
}

function getActiveMonthsInYear(sub: Subscription, year: number): number {
  const jan1st = new Date(year, 0, 1)
  const dec31st = new Date(year, 11, 31)
  const today = new Date()

  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)

  const effectiveStart = new Date(Math.max(startDate.getTime(), jan1st.getTime()))
  const effectiveEnd = new Date(Math.min(endDate.getTime(), dec31st.getTime(), today.getTime()))

  if (effectiveEnd < effectiveStart) return 0

  const monthsDiff =
    (effectiveEnd.getFullYear() - effectiveStart.getFullYear()) * 12 +
    (effectiveEnd.getMonth() - effectiveStart.getMonth()) +
    1

  return Math.max(0, monthsDiff)
}

function calculateSpentThisYear(sub: Subscription): number {
  const currentYear = new Date().getFullYear()
  const activeMonths = getActiveMonthsInYear(sub, currentYear)
  return sub.monthlyCost * activeMonths
}

function calculateForecastForYear(sub: Subscription): number {
  const currentYear = new Date().getFullYear()
  const today = new Date()
  const jan1st = new Date(currentYear, 0, 1)
  const dec31st = new Date(currentYear, 11, 31)

  const startDate = new Date(sub.startDate)
  const endDate = new Date(sub.endDate)

  if (startDate > dec31st || endDate < jan1st) return 0

  const spentMonths = getActiveMonthsInYear(sub, currentYear)

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

function generatePieData(subs: Subscription[], groupBy: GroupByOption): PieDataItem[] {
  if (groupBy === 'service') {
    return subs.map((s) => ({
      name: s.name,
      value: s.monthlyCost,
      fill: '',
    }))
  }

  if (groupBy === 'category') {
    const grouped = new Map<string, number>()
    subs.forEach((s) => {
      const category = s.category || 'Other'
      grouped.set(category, (grouped.get(category) || 0) + s.monthlyCost)
    })
    return Array.from(grouped.entries()).map(([name, value]) => ({
      name,
      value,
      fill: '',
    }))
  }

  if (groupBy === 'paymentMethod') {
    const grouped = new Map<string, number>()
    subs.forEach((s) => {
      const method = s.paymentMethod || 'Unknown'
      grouped.set(method, (grouped.get(method) || 0) + s.monthlyCost)
    })
    return Array.from(grouped.entries()).map(([name, value]) => ({
      name,
      value,
      fill: '',
    }))
  }

  return []
}

function transformSubscriptions(
  subscriptions: DemoMergedSubscription[],
  targetCurrency: CurrencyCode,
): Subscription[] {
  return subscriptions.map((sub, index) => {
    const normalizedPrice = convertCurrency(sub.price, sub.currency as CurrencyCode, targetCurrency)
    return {
      id: index.toString(),
      name: sub.name,
      url: sub.serviceUrl,
      monthlyCost: normalizedPrice,
      currency: targetCurrency,
      startDate: sub.startDate,
      endDate: sub.endDate,
      category: sub.category || sub.subscriptions[0]?.category || null,
      paymentMethod: sub.subscriptions[0]?.payment_method || null,
      autoRenew: Boolean(sub.autoRenew),
    }
  })
}

export function calculateInsights(
  subscriptions: DemoMergedSubscription[],
  currency: CurrencyCode,
  groupBy: GroupByOption,
  mode: InsightMode,
  tab: InsightTab = 'active',
  year?: number,
): InsightData {
  const transformed = transformSubscriptions(subscriptions, currency)

  let totalMonthly: number
  let yearly: number
  let expiring: Subscription[]
  let pieData: PieDataItem[]

  if (tab === 'active') {
    const activeThisMonth = getActiveSubscriptionsForMonth(transformed)
    const activeThisYear = getActiveSubscriptionsForYear(transformed)

    totalMonthly = sumMonthly(activeThisMonth)

    if (mode === 'spent') {
      yearly = activeThisYear.reduce((sum, sub) => sum + calculateSpentThisYear(sub), 0)
    } else {
      yearly = activeThisYear.reduce((sum, sub) => sum + calculateForecastForYear(sub), 0)
    }

    expiring = nextExpiring(transformed)
    pieData = generatePieData(activeThisMonth, groupBy)
  } else {
    const targetYear = year || new Date().getFullYear() - 1
    const pastSubs = getPastSubscriptionsForYear(transformed, targetYear)

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
    nextExpiring: expiring.map((sub) => ({
      name: sub.name,
      url: sub.url,
      endDate: sub.endDate,
    })),
    pieData,
  }
}

export function useDemoInsights(
  currency: CurrencyCode,
  groupBy: GroupByOption = 'service',
  mode: InsightMode = 'forecast',
  tab: InsightTab = 'active',
  year?: number,
) {
  const { subscriptions } = useDemoContext()

  const data = useMemo(() => {
    return calculateInsights(subscriptions, currency, groupBy, mode, tab, year)
  }, [subscriptions, currency, groupBy, mode, tab, year])

  return {
    data,
    error: null,
    isLoading: false,
  }
}
