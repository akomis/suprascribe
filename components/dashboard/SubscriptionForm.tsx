'use client'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { CURRENCIES, CurrencyCode, useCurrency } from '@/lib/hooks/useCurrency'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { cn, handleNumericInputKeyDown } from '@/lib/utils'
import { formatDisplayDate, toDateString } from '@/lib/utils/date'
import { computePreview, generateEntries } from '@/lib/utils/subscription-entries'
import { addMonths, addWeeks, addYears } from 'date-fns'
import { CalendarIcon, Repeat } from 'lucide-react'
import * as React from 'react'
import { ServiceSelector } from './ServiceSelector'

type SubscriptionFormProps = {
  subscription?: UserSubscriptionWithDetails
  onSubmit: (data: CreateSubscriptionFormData[]) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: Error | null
  deleteButton?: React.ReactNode
  isNewBillingPeriod?: boolean
}

export function SubscriptionForm({
  subscription,
  onSubmit,
  onCancel,
  isSubmitting,
  submitError,
  deleteButton,
  isNewBillingPeriod = false,
}: SubscriptionFormProps) {
  const { currency: userCurrency } = useCurrency()
  const [name, setName] = React.useState(subscription?.subscription_service?.name || '')
  const [serviceUrl, setServiceUrl] = React.useState(subscription?.subscription_service?.url || '')
  const [cost, setCost] = React.useState(subscription?.price?.toString() || '')
  const [selectedCurrency, setSelectedCurrency] = React.useState<CurrencyCode>(
    (subscription?.currency as CurrencyCode) || userCurrency,
  )
  const [startDate, setStartDate] = React.useState(
    subscription?.start_date || toDateString(new Date()),
  )
  const [endDate, setEndDate] = React.useState(subscription?.end_date || '')
  const [autoRenew, setAutoRenew] = React.useState(subscription?.auto_renew ?? true)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [startCalendarOpen, setStartCalendarOpen] = React.useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = React.useState(false)

  // Add-mode only state (when creating a new subscription from scratch)
  const isAddMode = !subscription && !isNewBillingPeriod
  const [addBillingCycle, setAddBillingCycle] = React.useState<
    'weekly' | 'monthly' | 'annually' | null
  >(null)
  const [addDuration, setAddDuration] = React.useState<string>('')
  const [upUntilToday, setUpUntilToday] = React.useState<boolean>(true)

  const currencySymbol = CURRENCIES[selectedCurrency].symbol

  const previewData = React.useMemo(() => {
    if (!isAddMode || !addBillingCycle || !startDate) return null
    const durationNum = parseInt(addDuration, 10)
    if (!upUntilToday && (isNaN(durationNum) || durationNum < 1)) return null
    return computePreview({
      serviceName: name.trim() || 'Subscription',
      price: parseFloat(cost) || 0,
      currency: selectedCurrency,
      startDate,
      billingCycle: addBillingCycle,
      mode: upUntilToday ? { type: 'upUntilToday' } : { type: 'count', count: durationNum },
      autoRenew,
    })
  }, [
    isAddMode,
    addBillingCycle,
    startDate,
    addDuration,
    upUntilToday,
    name,
    cost,
    selectedCurrency,
    autoRenew,
  ])

  const maxPastDuration = React.useMemo(() => {
    if (!addBillingCycle || !startDate) return 120
    const [y, m, d] = startDate.split('-').map(Number)
    const start = new Date(y, m - 1, d)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const advance =
      addBillingCycle === 'weekly' ? addWeeks : addBillingCycle === 'monthly' ? addMonths : addYears
    let max = 0
    for (let n = 1; n <= 120; n++) {
      if (advance(start, n) <= today) max = n
      else break
    }
    return max
  }, [addBillingCycle, startDate])

  React.useEffect(() => {
    if (maxPastDuration < 1 && !upUntilToday) {
      setUpUntilToday(true)
      setAddDuration('')
    }
  }, [maxPastDuration, upUntilToday])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!name.trim()) {
      setFormError('Subscription name is required')
      return
    }

    const costValue = parseFloat(cost)
    if (Number.isNaN(costValue) || costValue <= 0) {
      setFormError('Please enter a valid cost amount greater than 0')
      return
    }

    if (!startDate) {
      setFormError('Start date is required')
      return
    }

    if (isAddMode) {
      if (!addBillingCycle) {
        setFormError('Please select a billing cycle')
        return
      }

      if (!upUntilToday) {
        const durationNum = parseInt(addDuration, 10)
        if (isNaN(durationNum) || durationNum < 1) {
          const unit =
            addBillingCycle === 'weekly'
              ? 'weeks'
              : addBillingCycle === 'monthly'
                ? 'months'
                : 'years'
          setFormError(`Please enter a valid number of ${unit} (minimum 1)`)
          return
        }
        if (durationNum > 120) {
          const unit =
            addBillingCycle === 'weekly'
              ? 'weeks'
              : addBillingCycle === 'monthly'
                ? 'months'
                : 'years'
          setFormError(`Duration cannot exceed 120 ${unit}`)
          return
        }
      } else {
        const [y, m, d] = startDate.split('-').map(Number)
        const start = new Date(y, m - 1, d)
        const todayMidnight = new Date()
        todayMidnight.setHours(0, 0, 0, 0)
        if (start > todayMidnight) {
          setFormError('Start date cannot be in the future when using "Up until today"')
          return
        }
      }

      try {
        const entries = generateEntries({
          serviceName: name.trim(),
          serviceUrl: serviceUrl.trim() || undefined,
          price: costValue,
          currency: selectedCurrency,
          startDate,
          billingCycle: addBillingCycle,
          mode: upUntilToday
            ? { type: 'upUntilToday' }
            : { type: 'count', count: parseInt(addDuration, 10) },
          autoRenew,
        })
        await onSubmit(entries)
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'An error occurred')
      }
    } else {
      if (!endDate) {
        setFormError('End date is required')
        return
      }
      if (new Date(endDate) <= new Date(startDate)) {
        setFormError('End date must be after start date')
        return
      }
      try {
        await onSubmit([
          {
            serviceName: name.trim(),
            serviceUrl: serviceUrl.trim() || undefined,
            price: costValue,
            currency: selectedCurrency,
            startDate,
            endDate,
            autoRenew,
          },
        ])
      } catch (error) {
        setFormError(error instanceof Error ? error.message : 'An error occurred')
      }
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <Label htmlFor="name">Service Name</Label>
        <ServiceSelector
          value={name}
          onChange={(serviceName, url) => {
            setName(serviceName)
            if (url) {
              setServiceUrl(url)
            }
          }}
          disabled={isSubmitting || isNewBillingPeriod}
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="currency">Currency</Label>
          <Select
            value={selectedCurrency}
            onValueChange={(value) => setSelectedCurrency(value as CurrencyCode)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(CURRENCIES).map(([code, { symbol }]) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{symbol}</span>
                    <span className="text-xs text-muted-foreground">{code}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="cost">Price</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              {currencySymbol}
            </span>
            <Input
              id="cost"
              type="number"
              className="pl-6"
              min="0.01"
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              onKeyDown={handleNumericInputKeyDown}
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="autoRenew">Auto Renewal</Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant={autoRenew ? 'default' : 'outline'}
                onClick={() => setAutoRenew((v) => !v)}
                disabled={isSubmitting}
                aria-label="Toggle auto renewal"
                className={cn('w-full gap-2', { 'text-muted-foreground ': !autoRenew })}
              >
                <Repeat className="size-4" />
                {autoRenew ? 'Enabled' : 'Disabled'}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Check if this subscription has auto renewal enabled</TooltipContent>
          </Tooltip>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="start">Start Date</Label>
          <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
            <PopoverTrigger asChild className="w-auto">
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground',
                )}
                disabled={isSubmitting}
              >
                <CalendarIcon className="h-4 w-4" />
                {startDate ? formatDisplayDate(startDate) : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate ? new Date(startDate) : undefined}
                onSelect={(date) => {
                  if (date) {
                    const year = date.getFullYear()
                    const month = String(date.getMonth() + 1).padStart(2, '0')
                    const day = String(date.getDate()).padStart(2, '0')
                    setStartDate(`${year}-${month}-${day}`)
                    setStartCalendarOpen(false)
                  }
                }}
                disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
              />
            </PopoverContent>
          </Popover>
        </div>

        {isAddMode ? (
          <div className="flex flex-col gap-2">
            <Label>Billing Cycle</Label>
            <div className="flex h-9">
              {(['weekly', 'monthly', 'annually'] as const).map((cycle, i) => (
                <Button
                  key={cycle}
                  type="button"
                  variant={addBillingCycle === cycle ? 'default' : 'outline'}
                  size="sm"
                  className={cn(
                    'flex-1 h-full',
                    i === 0 && 'rounded-r-none',
                    i === 1 && 'rounded-none border-x-0',
                    i === 2 && 'rounded-l-none',
                  )}
                  onClick={() => {
                    setAddBillingCycle(cycle)
                    setAddDuration('')
                    setUpUntilToday(true)
                  }}
                  disabled={isSubmitting}
                >
                  {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Label htmlFor="end">End Date</Label>
            <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
              <PopoverTrigger asChild className="w-auto">
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !endDate && 'text-muted-foreground',
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="h-4 w-4" />
                  {endDate ? formatDisplayDate(endDate) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate ? new Date(endDate) : undefined}
                  onSelect={(date) => {
                    if (date) {
                      const year = date.getFullYear()
                      const month = String(date.getMonth() + 1).padStart(2, '0')
                      const day = String(date.getDate()).padStart(2, '0')
                      setEndDate(`${year}-${month}-${day}`)
                      setEndCalendarOpen(false)
                    }
                  }}
                  disabled={(date) => date < new Date(startDate) || date < new Date('2000-01-01')}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      {isAddMode && addBillingCycle && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 rounded-md border border-input overflow-hidden">
              <Button
                type="button"
                variant={upUntilToday ? 'default' : 'ghost'}
                size="sm"
                className="rounded-none h-full"
                onClick={() => {
                  setUpUntilToday(true)
                  setAddDuration('')
                }}
                disabled={isSubmitting}
              >
                Currently active
              </Button>
              {maxPastDuration >= 1 && (
                <Button
                  type="button"
                  variant={!upUntilToday ? 'default' : 'ghost'}
                  size="sm"
                  className="rounded-none h-full border-l border-input"
                  onClick={() => setUpUntilToday(false)}
                  disabled={isSubmitting}
                >
                  Past
                </Button>
              )}
            </div>
            {!upUntilToday && (
              <>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max={maxPastDuration}
                  step="1"
                  value={addDuration}
                  onChange={(e) => {
                    const raw = parseInt(e.target.value, 10)
                    if (isNaN(raw)) {
                      setAddDuration('')
                      return
                    }
                    setAddDuration(String(Math.min(Math.max(raw, 1), maxPastDuration)))
                  }}
                  onKeyDown={handleNumericInputKeyDown}
                  placeholder="1"
                  disabled={isSubmitting}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">
                  {addBillingCycle === 'weekly'
                    ? 'weeks'
                    : addBillingCycle === 'monthly'
                      ? 'months'
                      : 'years'}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {isAddMode && previewData && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{previewData.count}</span>{' '}
          {addBillingCycle === 'weekly'
            ? 'weekly'
            : addBillingCycle === 'monthly'
              ? 'monthly'
              : 'annual'}{' '}
          {previewData.count === 1 ? 'entry' : 'entries'} from{' '}
          <span className="font-medium text-foreground">{formatDisplayDate(previewData.from)}</span>{' '}
          to{' '}
          <span className="font-medium text-foreground">{formatDisplayDate(previewData.to)}</span>
        </p>
      )}

      {(submitError || formError) && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {formError || (submitError instanceof Error ? submitError.message : 'An error occurred')}
        </div>
      )}

      <div className="flex justify-between gap-2">
        <div>{deleteButton}</div>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Spinner className="size-4" /> : 'Save'}
          </Button>
        </div>
      </div>
    </form>
  )
}
