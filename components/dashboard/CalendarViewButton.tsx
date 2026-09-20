'use client'

import * as React from 'react'
import { CalendarDays } from 'lucide-react'
import { CalendarView } from './CalendarView'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { Feature } from '@/lib/config/features'
import { Spinner } from '@/components/ui/spinner'
import { ProGate } from '@/components/shared/ProGate'
import { type MergedSubscriptionResponse } from '@/lib/types/subscriptions'

interface CalendarViewButtonProps {
  subscriptions: MergedSubscriptionResponse[]
  isLoading?: boolean
  onSubscriptionClick?: (subscriptionId: string) => void
}

export function CalendarViewButton({
  subscriptions,
  isLoading = false,
  onSubscriptionClick,
}: CalendarViewButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { hasAccess, isLoading: isCheckingAccess } = useFeatureAccess(Feature.CALENDAR_VIEW)

  // Only reachable with access: ProGate takes the click for everyone else.
  const handleClick = () => setIsOpen(true)

  const handleSubscriptionClick = React.useCallback(
    (subscriptionId: string) => {
      setIsOpen(false)
      onSubscriptionClick?.(subscriptionId)
    },
    [onSubscriptionClick],
  )

  if (isCheckingAccess) {
    return null
  }

  return (
    <>
      <ProGate feature="calendar_view">
        <button
          onClick={handleClick}
          disabled={isLoading}
          aria-label="Open Calendar View"
          className="rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:cursor-pointer p-2 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {isLoading ? (
            <Spinner className="h-4 w-4" />
          ) : (
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </ProGate>

      {hasAccess && !isLoading && subscriptions && (
        <CalendarView
          open={isOpen}
          onOpenChange={setIsOpen}
          subscriptions={subscriptions}
          onSubscriptionClick={handleSubscriptionClick}
        />
      )}
    </>
  )
}
