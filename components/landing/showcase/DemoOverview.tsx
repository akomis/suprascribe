'use client'

import { ClientOnly } from '@/components/shared/ClientOnly'
import DemoInsights from '@/components/demo/DemoInsights'
import { DemoProvider } from '@/components/demo/DemoProvider'
import { CurrencySelector } from '@/components/dashboard/settings/CurrencySelector'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { GroupByOption } from '@/lib/types/subscriptions'
import { InsightsSettingsProvider, useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import { ChevronDown } from 'lucide-react'

const groupByOptions: { value: GroupByOption; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'category', label: 'Category' },
  { value: 'paymentMethod', label: 'Payment Method' },
]

function DemoControls() {
  const { mode, setMode, groupBy, setGroupBy } = useInsightsSettings()
  const currentGroupByLabel = groupByOptions.find((opt) => opt.value === groupBy)?.label

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Calculate</span>
        <ClientOnly>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-7 sm:h-8 px-2 sm:px-3">
                {mode === 'spent' ? 'Current' : 'Forecast'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => setMode('spent')}>Current</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setMode('forecast')}>Forecast</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ClientOnly>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Group by</span>
        <ClientOnly>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs h-7 sm:h-8 px-2 sm:px-3">
                {currentGroupByLabel}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {groupByOptions
                .filter((option) => option.value !== groupBy)
                .map((option) => (
                  <DropdownMenuItem key={option.value} onClick={() => setGroupBy(option.value)}>
                    {option.label}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </ClientOnly>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">Currency</span>
        <ClientOnly>
          <CurrencySelector triggerClassName="text-xs !h-7 sm:!h-8 px-2 sm:px-3" />
        </ClientOnly>
      </div>
    </div>
  )
}

export default function DemoOverview() {
  return (
    <DemoProvider>
      <InsightsSettingsProvider>
        <div className="p-3 sm:p-4 rounded-2xl border bg-background overflow-hidden">
          <DemoControls />
          <div className="-mx-3 sm:-mx-4 -mb-3 sm:-mb-4">
            <DemoInsights />
          </div>
        </div>
      </InsightsSettingsProvider>
    </DemoProvider>
  )
}
