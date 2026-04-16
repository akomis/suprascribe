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
import { format } from 'date-fns'
import { CalendarIcon, Repeat, X } from 'lucide-react'
import * as React from 'react'
import { ServiceSelector } from './ServiceSelector'

type SubscriptionFormProps = {
  subscription?: UserSubscriptionWithDetails
  onSubmit: (data: CreateSubscriptionFormData) => Promise<void>
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
    subscription?.start_date || new Date().toISOString().split('T')[0],
  )
  const [endDate, setEndDate] = React.useState(subscription?.end_date || '')
  const [autoRenew, setAutoRenew] = React.useState(subscription?.auto_renew ?? true)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [startCalendarOpen, setStartCalendarOpen] = React.useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = React.useState(false)
  const [showEndDatePicker, setShowEndDatePicker] = React.useState(
    !!subscription || isNewBillingPeriod,
  )
  const [billingPeriod, setBillingPeriod] = React.useState<'weekly' | 'monthly' | 'yearly' | null>(
    null,
  )

  const currencySymbol = CURRENCIES[selectedCurrency].symbol

  React.useEffect(() => {
    setShowEndDatePicker(!!subscription || isNewBillingPeriod)
  }, [subscription, isNewBillingPeriod])

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

    if (!endDate) {
      setFormError('End date is required')
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setFormError('End date must be after start date')
      return
    }

    try {
      await onSubmit({
        serviceName: name.trim(),
        serviceUrl: serviceUrl.trim() || undefined,
        price: costValue,
        currency: selectedCurrency,
        startDate: startDate,
        endDate: endDate,
        autoRenew: autoRenew,
      })
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'An error occurred')
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
          {billingPeriod && (
            <p className="text-xs text-muted-foreground">
              {billingPeriod === 'weekly'
                ? 'Enter the weekly price (will be converted to monthly)'
                : billingPeriod === 'yearly'
                  ? 'Enter the yearly price (will be converted to monthly)'
                  : 'Enter the monthly price'}
            </p>
          )}
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
                {startDate ? format(new Date(startDate), 'PPP') : <span>Pick a date</span>}
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

        <div className="grid self-end">
          {showEndDatePicker ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="end">End Date</Label>
              <div className="relative">
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
                      {endDate ? format(new Date(endDate), 'PPP') : <span>Pick a date</span>}
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
                      disabled={(date) =>
                        date < new Date(startDate) || date < new Date('2000-01-01')
                      }
                    />
                  </PopoverContent>
                </Popover>
                {!subscription && !isNewBillingPeriod && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => {
                      setEndDate('')
                      setShowEndDatePicker(false)
                    }}
                    disabled={isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-between h-9 ">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-full w-1/3 rounded-r-none"
                onClick={() => {
                  if (startDate) {
                    const start = new Date(startDate)
                    const end = new Date(start)
                    end.setDate(end.getDate() + 7)
                    setEndDate(end.toISOString().split('T')[0])
                    setShowEndDatePicker(true)
                    setBillingPeriod('weekly')
                  }
                }}
                disabled={isSubmitting || !startDate}
              >
                Weekly
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-full w-1/3 rounded-none"
                onClick={() => {
                  if (startDate) {
                    const start = new Date(startDate)
                    const end = new Date(start.getFullYear(), start.getMonth() + 1, start.getDate())
                    setEndDate(end.toISOString().split('T')[0])
                    setShowEndDatePicker(true)
                    setBillingPeriod('monthly')
                  }
                }}
                disabled={isSubmitting || !startDate}
              >
                Monthly
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-full w-1/3 rounded-l-none"
                onClick={() => {
                  if (startDate) {
                    const start = new Date(startDate)
                    const end = new Date(start.getFullYear() + 1, start.getMonth(), start.getDate())
                    setEndDate(end.toISOString().split('T')[0])
                    setShowEndDatePicker(true)
                    setBillingPeriod('yearly')
                  }
                }}
                disabled={isSubmitting || !startDate}
              >
                Annually
              </Button>
            </div>
          )}
        </div>
      </div>

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
