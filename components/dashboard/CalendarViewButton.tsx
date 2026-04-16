'use client'

import * as React from 'react'
import { CalendarDays } from 'lucide-react'
import { CalendarView } from './CalendarView'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { Feature } from '@/lib/config/features'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { type MergedSubscriptionResponse } from '@/app/api/subscriptions/route'

interface CalendarViewButtonProps {
  subscriptions: MergedSubscriptionResponse[]
  isLoading?: boolean
}

export function CalendarViewButton({ subscriptions, isLoading = false }: CalendarViewButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const { hasAccess, isLoading: isCheckingAccess } = useFeatureAccess(Feature.CALENDAR_VIEW)

  const handleClick = () => {
    if (!hasAccess) {
      toast.error('Calendar View is a Pro feature', {
        description: 'Upgrade to Pro to access the calendar view.',
      })
      return
    }
    setIsOpen(true)
  }

  if (isCheckingAccess) {
    return null
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        aria-label={hasAccess ? 'Open Calendar View' : 'Calendar View (Pro Feature)'}
        className="rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:cursor-pointer p-2 hover:bg-accent disabled:pointer-events-none disabled:opacity-50"
      >
        {isLoading ? (
          <Spinner className="h-4 w-4" />
        ) : (
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {hasAccess && !isLoading && subscriptions && (
        <CalendarView open={isOpen} onOpenChange={setIsOpen} subscriptions={subscriptions} />
      )}
    </>
  )
}
