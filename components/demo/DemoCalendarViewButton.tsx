'use client'

import * as React from 'react'
import { CalendarDays } from 'lucide-react'
import { CalendarView } from '@/components/dashboard/CalendarView'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { type MergedSubscriptionResponse } from '@/app/api/subscriptions/route'

interface DemoCalendarViewButtonProps {
  subscriptions: MergedSubscriptionResponse[]
}

export function DemoCalendarViewButton({ subscriptions }: DemoCalendarViewButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open Calendar View"
            className="rounded-md outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:cursor-pointer p-2 hover:bg-accent"
          >
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>Calendar view</span>
        </TooltipContent>
      </Tooltip>

      <CalendarView open={isOpen} onOpenChange={setIsOpen} subscriptions={subscriptions} />
    </>
  )
}
