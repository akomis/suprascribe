'use client'

import { GroupByOption, InsightMode } from '@/lib/hooks/useInsights'
import * as React from 'react'

interface InsightsSettingsContextValue {
  mode: InsightMode
  setMode: (mode: InsightMode) => void
  groupBy: GroupByOption
  setGroupBy: (groupBy: GroupByOption) => void
}

const InsightsSettingsContext = React.createContext<InsightsSettingsContextValue | undefined>(
  undefined,
)

export function InsightsSettingsProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = React.useState<InsightMode>('forecast')
  const [groupBy, setGroupBy] = React.useState<GroupByOption>('service')

  const value = React.useMemo(() => ({ mode, setMode, groupBy, setGroupBy }), [mode, groupBy])

  return (
    <InsightsSettingsContext.Provider value={value}>{children}</InsightsSettingsContext.Provider>
  )
}

export function useInsightsSettings() {
  const context = React.useContext(InsightsSettingsContext)
  if (context === undefined) {
    throw new Error('useInsightsSettings must be used within an InsightsSettingsProvider')
  }
  return context
}
