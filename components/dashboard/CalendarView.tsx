'use client'

import { type MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import { buildSubscriptionDateMap } from '@/lib/utils/calendar-calculations'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { createCustomDayButton } from '@/components/dashboard/CustomDayButton'
import * as React from 'react'

interface CalendarViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptions: MergedSubscriptionResponse[]
  onSubscriptionClick?: (subscriptionId: string) => void
}

export function CalendarView({
  open,
  onOpenChange,
  subscriptions,
  onSubscriptionClick,
}: CalendarViewProps) {
  const { formatCurrency } = useCurrency()
  const [month, setMonth] = React.useState<Date>(new Date())

  const subscriptionsByDate = React.useMemo(
    () => buildSubscriptionDateMap(subscriptions),
    [subscriptions],
  )

  const CustomDayButton = React.useMemo(
    () => createCustomDayButton(subscriptionsByDate, formatCurrency, onSubscriptionClick),
    [subscriptionsByDate, formatCurrency, onSubscriptionClick],
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full h-[100dvh] max-w-full max-h-[100dvh] p-0 gap-0 md:w-[70vw] md:h-auto md:max-w-[70vw] md:max-h-[90vh] md:p-6 md:gap-6 md:rounded-lg rounded-none">
        <DialogHeader className="px-4 pt-4 pb-2 md:p-0">
          <DialogTitle className="text-lg md:text-xl">Subscription Calendar</DialogTitle>
        </DialogHeader>

        <div className="overflow-auto flex-1 pb-4 md:pb-0">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            className="flex flex-col"
            components={{
              DayButton: CustomDayButton,
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}
