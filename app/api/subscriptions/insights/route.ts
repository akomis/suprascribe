import { CurrencyCode } from '@/lib/hooks/useCurrency'
import { createClient } from '@/lib/supabase/server'
import { mergeSubscriptionsByService } from '@/lib/utils'
import { convertCurrency } from '@/lib/utils/currency'
import { NextRequest, NextResponse } from 'next/server'

export type GroupByOption = 'service' | 'category' | 'paymentMethod'
export type InsightMode = 'spent' | 'forecast'
export type InsightTab = 'active' | 'past'

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

type PieDataItem = {
  name: string
  value: number
  fill: string
}

type InsightData = {
  totalMonthly: number
  yearly: number
  nextExpiring: Array<{
    name: string
    url?: string
    endDate: string
  }>
  pieData: PieDataItem[]
}

type RawSub = {
  start_date: string | null
  end_date: string | null
  price: number | null
  currency: string
  auto_renew: boolean
}

function sumMonthly(subs: Subscription[]) {
  return subs.reduce((sum, s) => sum + s.monthlyCost, 0)
}

function _mostExpensive(subs: Subscription[]) {
  if (subs.length === 0) return null
  return subs.reduce((max, s) => (s.monthlyCost > max.monthlyCost ? s : max), subs[0])
}

function _leastExpensive(subs: Subscription[]) {
  if (subs.length === 0) return null
  return subs.reduce((min, s) => (s.monthlyCost < min.monthlyCost ? s : min), subs[0])
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

function calculateGroupSpentThisYear(subs: RawSub[], targetCurrency: CurrencyCode): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const jan1st = new Date(today.getFullYear(), 0, 1)

  return subs
    .filter((sub) => {
      if (!sub.start_date) return false
      const startDate = new Date(sub.start_date)
      return startDate >= jan1st && startDate <= today
    })
    .reduce(
      (sum, sub) =>
        sum + convertCurrency(sub.price || 0, sub.currency as CurrencyCode, targetCurrency),
      0,
    )
}

function calculateGroupForecastForYear(
  subs: RawSub[],
  autoRenew: boolean,
  monthlyCost: number,
  targetCurrency: CurrencyCode,
): number {
  if (!autoRenew) return calculateGroupSpentThisYear(subs, targetCurrency)

  const currentYear = new Date().getFullYear()
  const jan1st = new Date(currentYear, 0, 1)
  const dec31st = new Date(currentYear, 11, 31)

  const earliestStart = subs.reduce<Date | null>((earliest, sub) => {
    if (!sub.start_date) return earliest
    const d = new Date(sub.start_date)
    return earliest === null || d < earliest ? d : earliest
  }, null)

  if (!earliestStart) return 0

  const effectiveStart = earliestStart < jan1st ? jan1st : earliestStart
  const monthsInYear =
    (dec31st.getFullYear() - effectiveStart.getFullYear()) * 12 +
    (dec31st.getMonth() - effectiveStart.getMonth()) +
    1

  return monthlyCost * Math.max(0, monthsInYear)
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

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const targetCurrency = (searchParams.get('currency') || 'USD') as CurrencyCode
    const groupBy = (searchParams.get('groupBy') || 'service') as GroupByOption
    const mode = (searchParams.get('mode') || 'forecast') as InsightMode
    const tab = (searchParams.get('tab') || 'active') as InsightTab
    const yearParam = searchParams.get('year')
    const year = yearParam ? parseInt(yearParam, 10) : undefined

    const { data, error } = await supabase
      .from('USER_SUBSCRIPTIONS')
      .select(
        `
        *,
        subscription_service:SUBSCRIPTION_SERVICES!subscription_service_id(name, url, category)
        `,
      )
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const mergedMap = mergeSubscriptionsByService(data || [], true)

    const mergedSubscriptionsList: Subscription[] = Array.from(mergedMap.values()).map(
      ({ merged, subscriptions: subs }) => {
        const sortedByEndDate = [...subs].sort(
          (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
        )
        const mostRecent = sortedByEndDate[0]
        const normalizedPrice = convertCurrency(
          mostRecent.price || 0,
          mostRecent.currency as CurrencyCode,
          targetCurrency,
        )
        return {
          id: mostRecent.id.toString(),
          name: mostRecent.subscription_service?.name || 'Unknown Service',
          url: mostRecent.subscription_service?.url || undefined,
          monthlyCost: normalizedPrice,
          currency: targetCurrency,
          startDate: merged.startDate,
          endDate: merged.endDate,
          category: mostRecent.subscription_service?.category || null,
          paymentMethod: mostRecent.payment_method || null,
          autoRenew: Boolean(mostRecent.auto_renew),
        }
      },
    )

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
      const activeServiceGroups = Array.from(mergedMap.values()).filter(({ merged }) => {
        const startDate = new Date(merged.startDate)
        const endDate = new Date(merged.endDate)
        return startDate <= dec31st && endDate >= jan1st
      })

      if (mode === 'spent') {
        yearly = activeServiceGroups.reduce((sum, { subscriptions: subs }) => {
          return sum + calculateGroupSpentThisYear(subs as RawSub[], targetCurrency)
        }, 0)
      } else {
        yearly = activeServiceGroups.reduce((sum, { subscriptions: subs }) => {
          const sortedByEndDate = [...subs].sort(
            (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
          )
          const mostRecent = sortedByEndDate[0]
          const autoRenew = Boolean(mostRecent?.auto_renew)
          const monthlyCost = convertCurrency(
            mostRecent?.price || 0,
            mostRecent?.currency as CurrencyCode,
            targetCurrency,
          )
          return (
            sum +
            calculateGroupForecastForYear(subs as RawSub[], autoRenew, monthlyCost, targetCurrency)
          )
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

    const insightData: InsightData = {
      totalMonthly,
      yearly,
      nextExpiring: expiring.map((sub) => ({
        name: sub.name,
        url: sub.url,
        endDate: sub.endDate,
      })),
      pieData,
    }

    return NextResponse.json({ data: insightData })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
