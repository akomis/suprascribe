import type { QueryClient } from '@tanstack/react-query'
import type { CurrencyCode } from './useCurrency'
import type { GroupByOption, InsightMode, InsightTab } from '@/lib/types/subscriptions'

export const STALE_TIME = {
  default: 5 * 60 * 1000,
  short: 60 * 1000,
} as const

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
}

export const insightKeys = {
  all: ['insights'] as const,
  lists: () => [...insightKeys.all, 'list'] as const,
  byCurrency: (
    currency: CurrencyCode,
    groupBy: GroupByOption,
    mode: InsightMode,
    tab: InsightTab,
    year?: number,
  ) => [...insightKeys.all, 'list', currency, groupBy, mode, tab, year] as const,
}

export const discoveryRunKeys = {
  all: ['discoveryRuns'] as const,
  list: () => [...discoveryRunKeys.all, 'list'] as const,
}

export const byokKeys = {
  all: ['byok'] as const,
  keys: () => [...byokKeys.all, 'keys'] as const,
}

export const accountKeys = {
  all: ['account'] as const,
  tier: () => [...accountKeys.all, 'tier'] as const,
}

export const reminderKeys = {
  all: ['reminder-settings'] as const,
  settings: () => [...reminderKeys.all, 'settings'] as const,
}

export function invalidateSubscriptionDependents(queryClient: QueryClient): void {
  queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
  queryClient.invalidateQueries({ queryKey: insightKeys.lists() })
}
