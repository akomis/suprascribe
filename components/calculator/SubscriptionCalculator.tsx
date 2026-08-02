'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CURRENCIES, type CurrencyCode, useCurrency } from '@/lib/hooks/useCurrency'
import { toMonthlyCost } from '@/lib/utils'
import { Info, Plus, RotateCcw, Sparkles, X } from 'lucide-react'
import * as React from 'react'

type Period = 'MONTHLY' | 'YEARLY' | 'QUARTERLY' | 'WEEKLY'

const PERIOD_LABELS: Record<Period, string> = {
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly',
  QUARTERLY: 'Quarterly',
  WEEKLY: 'Weekly',
}

const PRESETS = [
  { name: 'Netflix', logo: '/logos/netflix.svg' },
  { name: 'Spotify', logo: '/logos/spotify.svg' },
  { name: 'Disney+', logo: '/logos/disneyplus.svg' },
  { name: 'YouTube Premium', logo: '/logos/youtube.svg' },
  { name: 'Amazon Prime', logo: '/logos/amazon.svg' },
  { name: 'Adobe', logo: '/logos/adobe.svg' },
  { name: 'iCloud', logo: '/logos/apple.svg' },
  { name: 'Microsoft 365', logo: '/logos/microsoft.svg' },
  { name: 'Notion', logo: '/logos/notion.svg' },
  { name: 'GitHub', logo: '/logos/github.svg' },
  { name: 'Figma', logo: '/logos/figma.svg' },
  { name: 'Dropbox', logo: '/logos/dropbox.svg' },
]

interface Row {
  id: string
  name: string
  price: string
  period: Period
}

// Fixed ids so the server-rendered markup matches the first client render.
const INITIAL_ROWS: Row[] = [{ id: 'row-1', name: '', price: '', period: 'MONTHLY' }]

// Only ever incremented from event handlers, so it never runs during SSR.
let nextRowId = INITIAL_ROWS.length + 1

function createRow(name = ''): Row {
  nextRowId += 1
  return { id: `row-${nextRowId}`, name, price: '', period: 'MONTHLY' }
}

/** Never returns NaN or a negative - empty and malformed input counts as zero. */
function parsePrice(value: string): number {
  const parsed = Number.parseFloat(value.replace(',', '.'))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function SubscriptionCalculator() {
  const [rows, setRows] = React.useState<Row[]>(INITIAL_ROWS)
  const [isPresetDialogOpen, setPresetDialogOpen] = React.useState(false)
  const { currency, setCurrency, currencySymbol, formatCurrency } = useCurrency()
  const hasTrackedTotal = React.useRef(false)

  const usedNames = new Set(rows.map((row) => row.name.trim().toLowerCase()))
  const availablePresets = PRESETS.filter((preset) => !usedNames.has(preset.name.toLowerCase()))

  const monthlyTotal = rows.reduce(
    (sum, row) => sum + toMonthlyCost(parsePrice(row.price), row.period),
    0,
  )
  const yearlyTotal = monthlyTotal * 12
  const weeklyTotal = (monthlyTotal * 12) / 52
  const pricedCount = rows.filter((row) => parsePrice(row.price) > 0).length

  React.useEffect(() => {
    if (hasTrackedTotal.current || monthlyTotal <= 0) return
    hasTrackedTotal.current = true
    import('posthog-js').then(({ default: posthog }) =>
      posthog.capture('calculator_total_viewed', {
        subscription_count: pricedCount,
        monthly_total: Math.round(monthlyTotal * 100) / 100,
        currency,
      }),
    )
  }, [monthlyTotal, pricedCount, currency])

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)))
  }

  const removeRow = (id: string) => {
    setRows((current) => current.filter((row) => row.id !== id))
  }

  const addPreset = (name: string) => {
    setRows((current) => {
      const emptyIndex = current.findIndex((row) => row.name.trim() === '')
      if (emptyIndex === -1) return [...current, createRow(name)]
      return current.map((row, index) => (index === emptyIndex ? { ...row, name } : row))
    })
    setPresetDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">You spend</p>
            <p className="text-4xl sm:text-5xl font-bold tracking-tight tabular-nums">
              {formatCurrency(yearlyTotal)}
            </p>
            <p className="text-sm text-muted-foreground">
              per year across {pricedCount} {pricedCount === 1 ? 'subscription' : 'subscriptions'}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t pt-4 text-center">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Per month</p>
              <p className="text-xl font-semibold tabular-nums">{formatCurrency(monthlyTotal)}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Per week</p>
              <p className="text-xl font-semibold tabular-nums">{formatCurrency(weeklyTotal)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {availablePresets.length > 0 && (
          <Dialog open={isPresetDialogOpen} onOpenChange={setPresetDialogOpen}>
            <DialogTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Sparkles /> Quick add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Quick add a subscription</DialogTitle>
                <DialogDescription>
                  Pick a service to add it to the list. You still set the price and billing period.
                </DialogDescription>
              </DialogHeader>
              <div className="grid max-h-[60vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
                {availablePresets.map((preset) => (
                  <Button
                    key={preset.name}
                    type="button"
                    variant="outline"
                    className="justify-start gap-2"
                    onClick={() => addPreset(preset.name)}
                  >
                    <ServiceLogo name={preset.name} resolvedLogoUrl={preset.logo} size={16} />
                    {preset.name}
                  </Button>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Select value={currency} onValueChange={(value) => setCurrency(value as CurrencyCode)}>
            <SelectTrigger size="sm" className="w-36" aria-label="Currency">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, meta]) => (
                <SelectItem key={code} value={code}>
                  {meta.symbol} {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3">
        <div className="hidden sm:grid sm:grid-cols-[minmax(0,1fr)_8rem_9.5rem_2.25rem] sm:gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <span>Subscription</span>
          <span>Price</span>
          <span>Billing period</span>
          <span className="sr-only">Remove</span>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
            No subscriptions yet. Add one below or use quick add.
          </div>
        ) : (
          rows.map((row, index) => (
            <div
              key={row.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_8rem_9.5rem_2.25rem] sm:gap-3"
            >
              <Input
                value={row.name}
                onChange={(event) => updateRow(row.id, { name: event.target.value })}
                placeholder="Subscription name"
                aria-label={`Subscription ${index + 1} name`}
                className="col-span-3 sm:col-span-1"
              />
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  {currencySymbol}
                </span>
                <Input
                  value={row.price}
                  onChange={(event) => updateRow(row.id, { price: event.target.value })}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  aria-label={`Subscription ${index + 1} price`}
                  className="pl-9"
                />
              </div>
              <Select
                value={row.period}
                onValueChange={(value) => updateRow(row.id, { period: value as Period })}
              >
                <SelectTrigger className="w-full" aria-label={`Subscription ${index + 1} period`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PERIOD_LABELS) as Period[]).map((period) => (
                    <SelectItem key={period} value={period}>
                      {PERIOD_LABELS[period]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => removeRow(row.id)}
                aria-label={`Remove subscription ${index + 1}`}
                className="text-muted-foreground hover:text-foreground"
              >
                <X />
              </Button>
            </div>
          ))
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setRows((c) => [...c, createRow()])}
          >
            <Plus /> Add subscription
          </Button>
          {rows.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="ml-auto text-muted-foreground"
              onClick={() => setRows(INITIAL_ROWS)}
            >
              <RotateCcw /> Reset
            </Button>
          )}
        </div>
      </div>

      <p className="flex items-start gap-2 text-left text-xs text-muted-foreground">
        <Info className="mt-px size-4 shrink-0" aria-hidden />
        <span>
          Nothing you type here is sent anywhere or saved - the maths runs entirely in your browser.
          The currency selector changes how totals are displayed; prices you enter are treated as
          already being in that currency.
        </span>
      </p>
    </div>
  )
}
