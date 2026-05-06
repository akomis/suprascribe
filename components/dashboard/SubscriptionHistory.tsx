'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CURRENCIES, CurrencyCode } from '@/lib/hooks/useCurrency'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import * as React from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'

type SubscriptionHistoryProps = {
  subscriptions: UserSubscriptionWithDetails[]
  onEdit: (subscription: UserSubscriptionWithDetails) => void
}

function formatPeriod(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  })
}

function subscriptionToChartData(subscription: UserSubscriptionWithDetails) {
  const startDate = new Date(subscription.start_date!)
  const price = subscription.price || 0

  const period = formatPeriod(startDate)

  return {
    period,
    cost: price,
    startDate: subscription.start_date,
    endDate: subscription.end_date,
    subscription: subscription,
    isEndDate: false,
  }
}

function getPeriodFromDate(date: Date | string) {
  return formatPeriod(date)
}

function getCurrentMonthPeriod() {
  return formatPeriod(new Date())
}

export function SubscriptionHistory({ subscriptions, onEdit }: SubscriptionHistoryProps) {
  const mostRecentSubscription = React.useMemo(() => {
    return [...subscriptions].sort(
      (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
    )[0]
  }, [subscriptions])

  const currencySymbol = React.useMemo(() => {
    const currency = mostRecentSubscription?.currency as CurrencyCode
    return currency ? CURRENCIES[currency].symbol : '$'
  }, [mostRecentSubscription?.currency])

  const currentMonthPeriod = React.useMemo(() => getCurrentMonthPeriod(), [])

  const endDateData = React.useMemo(() => {
    if (!mostRecentSubscription?.end_date) return null
    const endDate = new Date(mostRecentSubscription.end_date)
    const period = getPeriodFromDate(endDate)
    return {
      period,
      cost: mostRecentSubscription.price || 0,
      startDate: mostRecentSubscription.end_date, // Use end_date for correct sorting
      endDate: mostRecentSubscription.end_date,
      subscription: mostRecentSubscription,
      isEndDate: true,
    }
  }, [mostRecentSubscription])

  const chartData = React.useMemo(() => {
    let data = subscriptions
      .map((sub) => subscriptionToChartData(sub))
      .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())

    if (endDateData && endDateData.endDate) {
      const endDate = new Date(endDateData.endDate)
      data = data.filter((d) => {
        if (!d.startDate) return true
        const pointDate = new Date(d.startDate)
        return pointDate <= endDate
      })
    }

    if (endDateData) {
      data.push(endDateData)
    }

    return data
  }, [subscriptions, endDateData])

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props
    const [isHovered, setIsHovered] = React.useState(false)

    const isEndDate = payload?.isEndDate === true
    const shouldShow = payload?.subscription !== null && payload?.subscription !== undefined
    const paymentMethod: string | undefined = payload?.subscription?.payment_method || undefined

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation()
      if (!isEndDate && payload?.subscription) {
        onEdit(payload.subscription)
      }
    }

    if (!shouldShow) {
      return null
    }

    return (
      <g className="fade-on-mount">
        {paymentMethod && !isEndDate ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <circle
                cx={cx}
                cy={cy}
                r={11}
                fill="transparent"
                stroke="transparent"
                onClick={handleClick}
                onMouseEnter={() => !isEndDate && setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                  cursor: isEndDate ? 'default' : 'pointer',
                  pointerEvents: 'all',
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="top" align="center" className="flex flex-col gap-2">
              <div className="text-xs text-muted-foreground">{paymentMethod}</div>
            </TooltipContent>
          </Tooltip>
        ) : (
          <circle
            cx={cx}
            cy={cy}
            r={11}
            fill="transparent"
            stroke="transparent"
            onClick={handleClick}
            onMouseEnter={() => !isEndDate && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              cursor: isEndDate ? 'default' : 'pointer',
              pointerEvents: 'all',
            }}
          />
        )}
        <circle
          cx={cx}
          cy={cy}
          r={isEndDate ? 4 : isHovered ? 6 : 4}
          className={
            isEndDate
              ? 'fill-neutral-300 stroke-neutral-200 dark:fill-gray-700 dark:stroke-gray-500'
              : 'fill-gray-700 stroke-gray-700 dark:fill-white dark:stroke-white'
          }
          strokeWidth={2}
          style={{
            pointerEvents: 'none',
            transition: isEndDate ? 'none' : 'all 0.2s ease-in-out',
          }}
        />
      </g>
    )
  }

  return (
    <div className="w-full overflow-hidden">
      <ChartContainer
        config={{
          cost: {
            label: 'Cost',
            color: 'hsl(var(--chart-1))',
          },
        }}
        className="h-[150px] sm:h-[250px] md:h-[320px] pt-1 sm:pt-6 w-full [&_.recharts-wrapper]:w-full! [&_.recharts-surface]:w-full!"
      >
        <ResponsiveContainer width="99%" height="100%" debounce={50}>
          <LineChart data={chartData} margin={{ left: 5, right: 5, top: 5, bottom: 0 }}>
            <CartesianGrid strokeWidth={1} stroke="hsl(var(--border))" horizontal vertical />
            <XAxis
              dataKey="period"
              type="category"
              tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
              tickLine={false}
              axisLine={false}
              allowDuplicatedCategory={false}
              angle={0}
              textAnchor="middle"
              height={50}
              interval="preserveStart"
            />
            <YAxis
              tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${currencySymbol}${value}`}
              width={35}
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value) => {
                if (value === null || value === undefined) return ['']
                return [`${currencySymbol}${value}`]
              }}
            />
            {currentMonthPeriod && (
              <ReferenceLine
                x={currentMonthPeriod}
                stroke="#6b7280"
                strokeWidth={2}
                strokeDasharray="3 3"
                ifOverflow="extendDomain"
              />
            )}
            <Line
              type="natural"
              dataKey="cost"
              stroke="lightgray"
              strokeWidth={2}
              dot={<CustomDot />}
              activeDot={false}
              connectNulls={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export default SubscriptionHistory
