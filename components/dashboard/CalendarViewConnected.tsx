'use client'

import { isFeatureEnabled } from '@/lib/config/features'
import { useSubscriptions } from '@/lib/hooks/useSubscriptions'
import { CalendarViewButton } from './CalendarViewButton'

export function CalendarViewConnected() {
  const { data: subscriptions = [], isLoading } = useSubscriptions()

  if (!isFeatureEnabled('calendar_view')) return null

  return <CalendarViewButton subscriptions={subscriptions} isLoading={isLoading} />
}
