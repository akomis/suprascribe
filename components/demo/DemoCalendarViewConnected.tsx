'use client'

import { useDemoContext } from './DemoProvider'
import { DemoCalendarViewButton } from './DemoCalendarViewButton'

export function DemoCalendarViewConnected() {
  const { subscriptions } = useDemoContext()
  return <DemoCalendarViewButton subscriptions={subscriptions} />
}
