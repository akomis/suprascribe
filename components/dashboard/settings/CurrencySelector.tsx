'use client'

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrency, CURRENCIES, CurrencyCode } from '@/lib/hooks/useCurrency'
import { cn } from '@/lib/utils'

type CurrencySelectorProps = {
  triggerClassName?: string
}

export function CurrencySelector({ triggerClassName }: CurrencySelectorProps) {
  const { currency, setCurrency } = useCurrency()

  return (
    <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
      <SelectTrigger className={cn('w-fit hover:cursor-pointer', triggerClassName)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
          <SelectItem key={code} value={code} className="hover:cursor-pointer">
            <span className="flex items-center gap-2">
              <span className="font-medium">{symbol}</span>
              <span className="text-xs text-muted-foreground">{code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
