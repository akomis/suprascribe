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

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] =
    React.useState<DemoMergedSubscription[]>(SAMPLE_SUBSCRIPTIONS)

  const value = React.useMemo(
    () => ({
      subscriptions,
      setSubscriptions,
    }),
    [subscriptions],
  )

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}
