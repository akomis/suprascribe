'use client'

import { type MergedSubscriptionResponse } from '@/app/api/subscriptions/route'
import { Calendar } from '@/components/ui/calendar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useCurrency } from '@/lib/hooks/useCurrency'
import { createCustomDayButton } from '@/components/dashboard/CustomDayButton'
import * as React from 'react'

interface CalendarViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscriptions: MergedSubscriptionResponse[]
}

interface DaySubscription {
  name: string
  serviceUrl?: string
  price: number
  autoRenew: boolean
}

export function CalendarView({ open, onOpenChange, subscriptions }: CalendarViewProps) {
  const { formatCurrency } = useCurrency()
  const [month, setMonth] = React.useState<Date>(new Date())

  const subscriptionsByDate = React.useMemo(() => {
    const map = new Map<string, DaySubscription[]>()

    subscriptions.forEach((sub) => {
      const endDate = new Date(sub.endDate)
      const day = endDate.getDate()

      if (sub.autoRenew) {
        for (let year = 2020; year <= 2030; year++) {
          for (let monthIdx = 0; monthIdx < 12; monthIdx++) {
            const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
            if (day <= daysInMonth) {
              const dateKey = `${year}-${monthIdx + 1}-${day}`
              if (!map.has(dateKey)) {
                map.set(dateKey, [])
              }
              map.get(dateKey)!.push({
                name: sub.name,
                serviceUrl: sub.serviceUrl,
                price: sub.price,
                autoRenew: sub.autoRenew,
              })
            }
          }
        }
      } else {
        const dateKey = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
        if (!map.has(dateKey)) {
          map.set(dateKey, [])
        }
        map.get(dateKey)!.push({
          name: sub.name,
          serviceUrl: sub.serviceUrl,
          price: sub.price,
          autoRenew: sub.autoRenew,
        })
      }
    })

    return map
  }, [subscriptions])

  const CustomDayButton = React.useMemo(
    () => createCustomDayButton(subscriptionsByDate, formatCurrency),
    [subscriptionsByDate, formatCurrency],
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
