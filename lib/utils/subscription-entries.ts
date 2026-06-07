import { addWeeks, addMonths, addYears } from 'date-fns'
import type { BillingPeriod, CreateSubscriptionFormData } from '@/lib/types/forms'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import { toDateString } from '@/lib/utils/date'

type BillingCycleType = 'weekly' | 'monthly' | 'annually'

const CYCLE_TO_PERIOD: Record<BillingCycleType, BillingPeriod> = {
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  annually: 'YEARLY',
}

type GenerateEntriesParams = {
  serviceName: string
  serviceUrl?: string
  price: number
  currency: CurrencyCode
  startDate: string // 'YYYY-MM-DD'
  billingCycle: BillingCycleType
  mode: { type: 'count'; count: number } | { type: 'upUntilToday' }
  autoRenew: boolean
}

function advancePeriod(date: Date, cycle: BillingCycleType): Date {
  if (cycle === 'weekly') return addWeeks(date, 1)
  if (cycle === 'monthly') return addMonths(date, 1)
  return addYears(date, 1)
}

export function generateEntries(params: GenerateEntriesParams): CreateSubscriptionFormData[] {
  const { startDate, billingCycle, mode, autoRenew, ...baseFields } = params
  const period = CYCLE_TO_PERIOD[billingCycle]
  const entries: CreateSubscriptionFormData[] = []

  // Parse startDate in local time to avoid UTC offset shifting
  const [y, m, d] = startDate.split('-').map(Number)
  let periodStart = new Date(y, m - 1, d)

  if (mode.type === 'count') {
    for (let i = 0; i < mode.count; i++) {
      const periodEnd = advancePeriod(periodStart, billingCycle)
      entries.push({
        ...baseFields,
        period,
        startDate: toDateString(periodStart),
        endDate: toDateString(periodEnd),
        autoRenew: false,
      })
      periodStart = periodEnd
    }
  } else {
    // upUntilToday: include current active period
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    if (periodStart > today) {
      throw new Error('Start date cannot be in the future when using "Up until today"')
    }

    while (true) {
      const periodEnd = advancePeriod(periodStart, billingCycle)
      entries.push({
        ...baseFields,
        period,
        startDate: toDateString(periodStart),
        endDate: toDateString(periodEnd),
        autoRenew: false,
      })
      // Stop when this period contains today (periodStart <= today < periodEnd)
      if (periodStart <= today && today < periodEnd) break
      periodStart = periodEnd
    }
  }

  // Last entry gets user's autoRenew choice
  if (entries.length > 0) {
    entries[entries.length - 1] = { ...entries[entries.length - 1], autoRenew }
  }

  return entries
}

export function computePreview(
  params: GenerateEntriesParams,
): { count: number; from: string; to: string } | null {
  try {
    const entries = generateEntries(params)
    if (entries.length === 0) return null
    return {
      count: entries.length,
      from: entries[0].startDate,
      to: entries[entries.length - 1].endDate,
    }
  } catch {
    return null
  }
}
