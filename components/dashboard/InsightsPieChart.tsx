'use client'

import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useCurrency } from '@/lib/hooks/useCurrency'
import type { InsightMode, InsightTab, PieDataItem } from '@/lib/types/subscriptions'
import { useIsMobile } from '@/lib/hooks/useIsMobile'
import { useTheme } from 'next-themes'
import { useMemo } from 'react'
import { Label, Pie, PieChart } from 'recharts'

const lightModeColors = [
  '#1F2937', // gray-800
  '#374151', // gray-700
  '#4B5563', // gray-600
  '#6B7280', // gray-500
  '#64748B', // slate-500
  '#475569', // slate-600
  '#52525B', // zinc-600
  '#57534E', // stone-600
  '#525252', // neutral-600
  '#44403C', // stone-700
]

const darkModeColors = [
  '#4B5563', // medium-dark gray
  '#6B7280', // medium gray
  '#9CA3AF', // medium-light gray
  '#B4B4B8', // light-medium gray
  '#CBD5E1', // light gray
  '#D1D5DB', // lighter gray
  '#D4D4D8', // lighter gray
  '#E5E7EB', // very light gray
  '#F3F4F6', // off-white
  '#FFFFFF', // white
]

interface InsightsPieChartProps {
  pieData: PieDataItem[]
  totalMonthly: number
  yearly: number
  mode: InsightMode
  tab?: InsightTab
  year?: number
}

export default function InsightsPieChart({
  pieData,
  totalMonthly,
  yearly,
  mode,
  tab = 'active',
  year,
}: InsightsPieChartProps) {
  const { formatCurrency } = useCurrency()
  const { theme, systemTheme } = useTheme()
  const isMobile = useIsMobile()

  const currentTheme = theme === 'system' ? systemTheme : theme
  const pieColors = currentTheme === 'dark' ? darkModeColors : lightModeColors

  const themedPieData = useMemo(() => {
    if (!pieData) return []
    return pieData.map((item, index) => ({
      ...item,
      fill: pieColors[index % pieColors.length],
    }))
  }, [pieData, pieColors])

  const pieTotal = useMemo(
    () => themedPieData.reduce((sum, item) => sum + item.value, 0),
    [themedPieData],
  )

  return (
    <div
      className="w-full overflow-x-auto"
      role="img"
      aria-label={`Subscription spending breakdown: ${formatCurrency(totalMonthly)} per month, ${formatCurrency(yearly)} ${tab === 'past' ? `in ${year}` : mode === 'spent' ? 'year to date' : 'per year'}`}
    >
      <ChartContainer
        id="insights-pie-chart"
        config={{}}
        className="mx-auto h-50 sm:h-62.5 w-full min-w-0 max-w-full aspect-auto"
      >
        <PieChart
          margin={{ top: 30, right: isMobile ? 5 : 80, bottom: 30, left: isMobile ? 5 : 80 }}
        >
          <ChartTooltip
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value) => {
                  if (typeof value === 'number') {
                    const pct = pieTotal > 0 ? ((value / pieTotal) * 100).toFixed(1) : '0.0'
                    return `${formatCurrency(value)} (${pct}%)`
                  }
                  return value
                }}
              />
            }
          />
          <Pie
            data={themedPieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? '55%' : '90%'}
            outerRadius={isMobile ? '78%' : '110%'}
            stroke="currentColor"
            className="text-border"
            strokeWidth={0.2}
            labelLine={false}
            label={({
              cx,
              cy,
              outerRadius,
              midAngle,
              name,
              index,
            }: {
              cx?: number
              cy?: number
              outerRadius?: number
              midAngle?: number
              name?: string
              index?: number
            }) => {
              if (!name || cx == null || cy == null || outerRadius == null || midAngle == null)
                return null
              const RADIAN = Math.PI / 180
              const offset = 8
              const x = cx + (outerRadius + offset) * Math.cos(-midAngle * RADIAN)
              const y = cy + (outerRadius + offset) * Math.sin(-midAngle * RADIAN)
              const textAnchor = x > cx + 1 ? 'start' : x < cx - 1 ? 'end' : 'middle'
              const delay = (index ?? 0) * 80
              return (
                <text
                  x={x}
                  y={y}
                  textAnchor={textAnchor}
                  dominantBaseline="central"
                  fontSize={10}
                  className="hidden sm:block fill-muted-foreground dark:fill-white"
                  style={{
                    animation: `pie-label-fade-in 0.4s ease-out ${delay}ms forwards`,
                    opacity: 0,
                  }}
                >
                  {name}
                </text>
              )
            }}
          >
            <Label
              content={({ viewBox }) => {
                if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                  return (
                    <text
                      x={viewBox.cx}
                      y={viewBox.cy}
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-sm sm:text-2xl font-semibold font-mono"
                      >
                        {formatCurrency(totalMonthly)}/mo
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy || 0) + 16}
                        className="fill-muted-foreground text-[8px] sm:text-sm font-mono"
                      >
                        {formatCurrency(yearly)}
                        {tab === 'past' ? ` in ${year}` : mode === 'spent' ? ' ytd' : '/yr'}
                      </tspan>
                    </text>
                  )
                }
                return null
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>
    </div>
  )
}
