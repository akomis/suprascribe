'use client'

import * as React from 'react'
import { SAMPLE_SUBSCRIPTIONS, type DemoMergedSubscription } from '@/lib/demo/sampleData'

interface DemoContextValue {
  subscriptions: DemoMergedSubscription[]
  setSubscriptions: React.Dispatch<React.SetStateAction<DemoMergedSubscription[]>>
}

const DemoContext = React.createContext<DemoContextValue | undefined>(undefined)

export function useDemoContext() {
  const context = React.useContext(DemoContext)
  if (!context) {
    throw new Error('useDemoContext must be used within a DemoProvider')
  }
  return context
}

export function DemoProvider({
  children,
  initialSubscriptions = SAMPLE_SUBSCRIPTIONS,
}: {
  children: React.ReactNode
  initialSubscriptions?: DemoMergedSubscription[]
}) {
  const [subscriptions, setSubscriptions] =
    React.useState<DemoMergedSubscription[]>(initialSubscriptions)

  const value = React.useMemo(
    () => ({
      subscriptions,
      setSubscriptions,
    }),
    [subscriptions],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
