'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Check, Layers } from 'lucide-react'
import * as React from 'react'

export type GroupByValue = 'service' | 'sourceEmail' | 'category' | 'paymentMethod'

export const groupByOptions: { value: GroupByValue; label: string }[] = [
  { value: 'service', label: 'Service' },
  { value: 'sourceEmail', label: 'Source Email' },
  { value: 'category', label: 'Category' },
  { value: 'paymentMethod', label: 'Payment Method' },
]

interface SubscriptionGroupByProps {
  groupBy: GroupByValue
  onGroupByChange: (value: GroupByValue) => void
  disabled?: boolean
}

export function SubscriptionGroupBy({
  groupBy,
  onGroupByChange,
  disabled = false,
}: SubscriptionGroupByProps) {
  const isActive = groupBy !== 'service'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isActive ? 'default' : 'outline'}
          size="icon"
          disabled={disabled}
          className="h-8 w-8 shrink-0"
          aria-label="Group by"
        >
          <Layers className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={5}>
        <DropdownMenuLabel>Group By</DropdownMenuLabel>
        {groupByOptions.map((opt) => (
          <DropdownMenuItem
            key={opt.value}
            onClick={() => !disabled && onGroupByChange(opt.value)}
            className="flex items-center justify-between gap-4"
          >
            {opt.label}
            {groupBy === opt.value && <Check className="h-3 w-3" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
