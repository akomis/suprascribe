'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CurrencyCode } from '@/lib/hooks/useCurrency'
import { InsightMode } from '@/lib/hooks/useInsights'
import { formatDateDisplay } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'

type SubscriptionCardProps = {
  name: string
  serviceUrl?: string
  price: number
  currency: CurrencyCode
  startDate: string
  endDate: string
  autoRenew?: boolean
  onClick?: () => void
  mode?: InsightMode
  spentThisYear?: number
  forecastThisYear?: number
  totalSpent?: number
}

function formatDate(date: string) {
  return formatDateDisplay(date)
}

function CalendarBadge({ date, autoRenew: _autoRenew }: { date: string; autoRenew: boolean }) {
  const dateObj = new Date(date)
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (daysUntil > 0 && daysUntil <= 7) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg overflow-hidden border-2 border-gray-200 dark:border-border"
        style={{ width: '50px', height: '50px' }}
      >
        <div className="w-full text-center text-[10px] font-semibold py-1 bg-gray-200 dark:bg-border text-gray-700 dark:text-gray-200">
          in
        </div>
        <div className="flex-1 flex items-center justify-center w-full">
          <span className="text-md font-medium text-gray-900 dark:text-gray-100">{daysUntil}d</span>
        </div>
      </div>
    )
  }

  const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
  const day = dateObj.getDate()

  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg overflow-hidden border-2 border-gray-200 dark:border-border"
      style={{ width: '54px', height: '54px' }}
    >
      <div className="w-full text-center text-[10px] font-semibold py-1 bg-gray-200 dark:bg-border text-gray-700 dark:text-gray-200">
        {month}
      </div>
      <div className="flex-1 flex items-center justify-center w-full">
        <span className="text-md font-medium text-gray-900 dark:text-gray-100">{day}</span>
      </div>
    </div>
  )
}

export function SubscriptionCard({
  name,
  serviceUrl,
  price,
  currency,
  startDate,
  endDate,
  autoRenew = false,
  onClick,
  mode = 'forecast',
  spentThisYear,
  forecastThisYear,
  totalSpent,
}: SubscriptionCardProps) {
  const monthlyCost = price || 0

  const isPast = new Date(endDate) < new Date()

  let yearlyCost: number
  let yearlyLabel: string

  if (isPast) {
    yearlyCost = totalSpent ?? monthlyCost
    yearlyLabel = ' total'
  } else if (mode === 'spent') {
    yearlyCost = spentThisYear ?? 0
    yearlyLabel = ' ytd'
  } else {
    yearlyCost = forecastThisYear ?? 0
    yearlyLabel = '/yr'
  }

  return (
    <Card
      className="bg-white dark:bg-neutral-900 cursor-pointer transition-all hover:shadow-md hover:border-gray-300 fade-on-mount pb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onClick={onClick}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault()
          onClick()
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`View details for ${name} subscription`}
    >
      <CardContent className="flex flex-col sm:flex-row sm:gap-4 w-full items-start sm:items-center justify-between">
        <div className={'flex items-center gap-3 sm:gap-4 min-w-0 flex-1'}>
          <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
            <ServiceLogo
              name={name}
              serviceUrl={serviceUrl}
              size={64}
              className="size-full rounded-lg"
              fallbackClassName="size-4 sm:size-5"
            />
          </div>

          <div className="flex flex-col self-center">
            <div className="font-medium leading-tight text-sm sm:text-base break-words">{name}</div>
            <div className="mt-1 text-xs text-muted-foreground whitespace-nowrap">
              <span>since {formatDate(startDate)}</span>
            </div>
          </div>
        </div>

        <div className="flex w-full md:w-fit justify-end md:justify-between items-center gap-2">
          <div className="flex flex-col items-end gap-1 w-full md:w-auto sm:w-auto">
            <div className="flex items-end gap-1 flex-wrap justify-end">
              <Badge variant="outline" className="gap-1 text-sm sm:text-md px-2 sm:px-3 py-1">
                <span className="font-mono">{formatCurrencyAmount(monthlyCost, currency)}</span>
              </Badge>
            </div>

            <span className="text-[10px] sm:text-[12px] leading-none text-muted-foreground font-mono ml-1">
              {formatCurrencyAmount(yearlyCost, currency)}
              {yearlyLabel}
            </span>
          </div>

          <div className="flex w-fit justify-end flex-col items-center gap-1 mb-4">
            <span className="text-xs font-regular text-muted-foreground">
              {autoRenew ? 'Renews' : isPast ? 'Ended' : 'Ends'}
            </span>
            <CalendarBadge date={endDate} autoRenew={autoRenew} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
