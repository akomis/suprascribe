'use client'

import { Button } from '@/components/ui/button'
import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { cn } from '@/lib/utils'
import * as React from 'react'
import { DayButton } from 'react-day-picker'

interface DaySubscription {
  name: string
  serviceUrl?: string
  price: number
  autoRenew: boolean
}

export function createCustomDayButton(
  subscriptionsByDate: Map<string, DaySubscription[]>,
  formatCurrency: (amount: number) => string,
) {
  return function CustomDayButton(props: React.ComponentProps<typeof DayButton>) {
    const { day, modifiers, ...restProps } = props
    const dateKey = `${day.date.getFullYear()}-${day.date.getMonth() + 1}-${day.date.getDate()}`
    const daySubs = subscriptionsByDate.get(dateKey) || []
    const totalCost = daySubs.filter((s) => s.autoRenew).reduce((sum, s) => sum + s.price, 0)

    return (
      <Button
        {...restProps}
        onClick={(e) => e.preventDefault()}
        variant="ghost"
        className={cn(
          'w-full justify-start h-[70px] md:h-[90px] flex flex-col gap-0.5 sm:gap-1 p-1 sm:p-2 font-normal border border-border overflow-hidden',
          modifiers.today && 'bg-accent',
          modifiers.outside && 'text-muted-foreground opacity-50',
        )}
      >
        <div className="text-xs sm:text-sm font-medium">{day.date.getDate()}</div>

        {daySubs.length > 0 && (
          <div className="w-full">
            {/* Service logos */}
            <div className="flex flex-wrap gap-0.5 sm:gap-1 justify-center items-center min-h-[16px] sm:min-h-[20px]">
              <div className="flex gap-0.5 sm:gap-1 flex-wrap justify-center">
                {daySubs.slice(0, 6).map((sub, idx) => (
                  <ServiceLogo key={idx} name={sub.name} serviceUrl={sub.serviceUrl} size={16} />
                ))}
              </div>

              {daySubs.length > 6 && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  +{daySubs.length - 6}
                </span>
              )}
            </div>

            {/* Total cost */}
            {totalCost > 0 && (
              <div className="text-[10px] sm:text-xs font-semibold text-center text-primary mt-0.5 sm:mt-1">
                {formatCurrency(totalCost)}
              </div>
            )}
          </div>
        )}
      </Button>
    )
  }
}
