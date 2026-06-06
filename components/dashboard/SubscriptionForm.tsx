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

type BillingCycle = 'weekly' | 'monthly' | 'annually'

type SubscriptionFormProps = {
  subscription?: UserSubscriptionWithDetails
  onSubmit: (data: CreateSubscriptionFormData[]) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: Error | null
  deleteButton?: React.ReactNode
  isNewBillingPeriod?: boolean
}

type DatePickerButtonProps = {
  label: string
  id: string
  value: string
  onChange: (date: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled?: boolean
  calendarDisabled: (date: Date) => boolean
}

function DatePickerButton({
  label,
  id,
  value,
  onChange,
  open,
  onOpenChange,
  disabled,
  calendarDisabled,
}: DatePickerButtonProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild className="w-auto">
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !value && 'text-muted-foreground',
            )}
            disabled={disabled}
          >
            <CalendarIcon className="h-4 w-4" />
            {value ? formatDisplayDate(value) : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-fit p-0" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (date) {
                const year = date.getFullYear()
                const month = String(date.getMonth() + 1).padStart(2, '0')
                const day = String(date.getDate()).padStart(2, '0')
                onChange(`${year}-${month}-${day}`)
                onOpenChange(false)
              }
            }}
            disabled={calendarDisabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

type AddModeControlsProps = {
  addBillingCycle: BillingCycle | null
  setAddBillingCycle: (cycle: BillingCycle) => void
  addDuration: string
  setAddDuration: (d: string) => void
  upUntilToday: boolean
  setUpUntilToday: (v: boolean) => void
  maxPastDuration: number
  previewData: { count: number; from: string; to: string } | null
  isSubmitting: boolean
}

function AddModeControls({
  addBillingCycle,
  setAddBillingCycle: _setAddBillingCycle,
  addDuration,
  setAddDuration,
  upUntilToday,
  setUpUntilToday,
  maxPastDuration,
  previewData,
  isSubmitting,
}: AddModeControlsProps) {
  const cycleUnit = addBillingCycle ? BILLING_CYCLE_UNIT[addBillingCycle] : 'months'
  const cycleLabel = addBillingCycle ? BILLING_CYCLE_LABEL[addBillingCycle] : 'monthly'

  return (
    <>
      {addBillingCycle && (
        <div className="flex flex-col gap-2">
          <DurationSelector
            upUntilToday={upUntilToday}
            maxPastDuration={maxPastDuration}
            addDuration={addDuration}
            cycleUnit={cycleUnit}
            isSubmitting={isSubmitting}
            setUpUntilToday={setUpUntilToday}
            setAddDuration={setAddDuration}
          />
        </div>
      )}
      {previewData && (
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{previewData.count}</span> {cycleLabel}{' '}
          {previewData.count === 1 ? 'entry' : 'entries'} from{' '}
          <span className="font-medium text-foreground">{formatDisplayDate(previewData.from)}</span>{' '}
          to{' '}
          <span className="font-medium text-foreground">{formatDisplayDate(previewData.to)}</span>
        </p>
      )}
    </>
  )
}

type FormFields = {
  name: string
  cost: string
  startDate: string
  endDate: string
  addBillingCycle: BillingCycle | null
  upUntilToday: boolean
  addDuration: string
}

const BILLING_CYCLE_UNIT: Record<BillingCycle, string> = {
  weekly: 'weeks',
  monthly: 'months',
  annually: 'years',
}
const BILLING_CYCLE_LABEL: Record<BillingCycle, string> = {
  weekly: 'weekly',
  monthly: 'monthly',
  annually: 'annual',
}

function DurationSelector({
  upUntilToday,
  maxPastDuration,
  addDuration,
  cycleUnit,
  isSubmitting,
  setUpUntilToday,
  setAddDuration,
}: {
  upUntilToday: boolean
  maxPastDuration: number
  addDuration: string
  cycleUnit: string
  isSubmitting: boolean
  setUpUntilToday: (v: boolean) => void
  setAddDuration: (v: string) => void
}) {
  return (
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
          <span className="text-sm text-muted-foreground">{cycleUnit}</span>
        </>
      )}
    </div>
  )
}

function validateAddModeFields(fields: FormFields): string | null {
  if (!fields.addBillingCycle) return 'Please select a billing cycle'
  if (!fields.upUntilToday) {
    const durationNum = parseInt(fields.addDuration, 10)
    const unit = BILLING_CYCLE_UNIT[fields.addBillingCycle]
    if (isNaN(durationNum) || durationNum < 1)
      return `Please enter a valid number of ${unit} (minimum 1)`
    if (durationNum > 120) return `Duration cannot exceed 120 ${unit}`
  } else {
    const [y, m, d] = fields.startDate.split('-').map(Number)
    const start = new Date(y, m - 1, d)
    const todayMidnight = new Date()
    todayMidnight.setHours(0, 0, 0, 0)
    if (start > todayMidnight)
      return 'Start date cannot be in the future when using "Up until today"'
  }
  return null
}

function validateEditModeFields(fields: FormFields): string | null {
  if (!fields.endDate) return 'End date is required'
  if (new Date(fields.endDate) <= new Date(fields.startDate))
    return 'End date must be after start date'
  return null
}

function validateForm(fields: FormFields, isAddMode: boolean): string | null {
  if (!fields.name.trim()) return 'Subscription name is required'
  const costValue = parseFloat(fields.cost)
  if (Number.isNaN(costValue) || costValue <= 0)
    return 'Please enter a valid cost amount greater than 0'
  if (!fields.startDate) return 'Start date is required'
  return isAddMode ? validateAddModeFields(fields) : validateEditModeFields(fields)
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getBillingAdvanceFn(cycle: BillingCycle) {
  if (cycle === 'monthly') return addMonths
  if (cycle === 'weekly') return addWeeks
  return addYears
}

function computeMaxPastDuration(addBillingCycle: BillingCycle | null, startDate: string): number {
  if (!addBillingCycle || !startDate) return 120
  const [y, m, d] = startDate.split('-').map(Number)
  const start = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const advance = getBillingAdvanceFn(addBillingCycle)
  let max = 0
  for (let n = 1; n <= 120; n++) {
    if (advance(start, n) <= today) max = n
    else break
  }
  return max
}

function computeAddModePreview(
  addBillingCycle: BillingCycle | null,
  startDate: string,
  addDuration: string,
  upUntilToday: boolean,
  name: string,
  cost: string,
  selectedCurrency: CurrencyCode,
  autoRenew: boolean,
): ReturnType<typeof computePreview> | null {
  if (!addBillingCycle || !startDate) return null
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
}

type SubmitParams = {
  name: string
  serviceUrl: string
  cost: string
  currency: CurrencyCode
  startDate: string
  endDate: string
  autoRenew: boolean
  addBillingCycle: BillingCycle | null
  upUntilToday: boolean
  addDuration: string
}

function buildSubmitEntries(isAddMode: boolean, p: SubmitParams): CreateSubscriptionFormData[] {
  const price = parseFloat(p.cost)
  const serviceUrl = p.serviceUrl.trim() || undefined
  const serviceName = p.name.trim()
  if (isAddMode) {
    return generateEntries({
      serviceName,
      serviceUrl,
      price,
      currency: p.currency,
      startDate: p.startDate,
      billingCycle: p.addBillingCycle!,
      mode: p.upUntilToday
        ? { type: 'upUntilToday' }
        : { type: 'count', count: parseInt(p.addDuration, 10) },
      autoRenew: p.autoRenew,
    })
  }
  return [
    {
      serviceName,
      serviceUrl,
      price,
      currency: p.currency,
      startDate: p.startDate,
      endDate: p.endDate,
      autoRenew: p.autoRenew,
    },
  ]
}

const MIN_CALENDAR_DATE = new Date('2000-01-01')
function startDateCalendarDisabled(date: Date) {
  return date > new Date() || date < MIN_CALENDAR_DATE
}
function makeEndDateCalendarDisabled(startDate: string) {
  return (date: Date) => date < new Date(startDate) || date < MIN_CALENDAR_DATE
}

function PricingFields({
  currencySymbol,
  selectedCurrency,
  cost,
  autoRenew,
  isSubmitting,
  onCurrencyChange,
  onCostChange,
  onAutoRenewToggle,
}: {
  currencySymbol: string
  selectedCurrency: CurrencyCode
  cost: string
  autoRenew: boolean
  isSubmitting: boolean
  onCurrencyChange: (v: CurrencyCode) => void
  onCostChange: (v: string) => void
  onAutoRenewToggle: () => void
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="currency">Currency</Label>
        <Select
          value={selectedCurrency}
          onValueChange={(v) => onCurrencyChange(v as CurrencyCode)}
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
            onChange={(e) => onCostChange(e.target.value)}
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
              onClick={onAutoRenewToggle}
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
  )
}

function FormError({
  formError,
  submitError,
}: {
  formError: string | null
  submitError: Error | null
}) {
  const message =
    formError ??
    (submitError instanceof Error ? submitError.message : submitError ? 'An error occurred' : null)
  if (!message) return null
  return (
    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
      {message}
    </div>
  )
}

function BillingCycleSelector({
  value,
  onChange,
  disabled,
}: {
  value: BillingCycle | null
  onChange: (cycle: BillingCycle) => void
  disabled: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>Billing Cycle</Label>
      <div className="flex h-9">
        {(['weekly', 'monthly', 'annually'] as const).map((cycle, i) => (
          <Button
            key={cycle}
            type="button"
            variant={value === cycle ? 'default' : 'outline'}
            size="sm"
            className={cn(
              'flex-1 h-full',
              i === 0 && 'rounded-r-none',
              i === 1 && 'rounded-none border-x-0',
              i === 2 && 'rounded-l-none',
            )}
            onClick={() => onChange(cycle)}
            disabled={disabled}
          >
            {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  )
}

// ── SubscriptionForm ──────────────────────────────────────────────────────────

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

  const isAddMode = !subscription && !isNewBillingPeriod
  const [addBillingCycle, setAddBillingCycle] = React.useState<BillingCycle | null>(null)
  const [addDuration, setAddDuration] = React.useState<string>('')
  const [upUntilToday, setUpUntilToday] = React.useState<boolean>(true)

  const currencySymbol = CURRENCIES[selectedCurrency].symbol

  const previewData = React.useMemo(
    () =>
      isAddMode
        ? computeAddModePreview(
            addBillingCycle,
            startDate,
            addDuration,
            upUntilToday,
            name,
            cost,
            selectedCurrency,
            autoRenew,
          )
        : null,
    [
      isAddMode,
      addBillingCycle,
      startDate,
      addDuration,
      upUntilToday,
      name,
      cost,
      selectedCurrency,
      autoRenew,
    ],
  )

  const maxPastDuration = React.useMemo(
    () => computeMaxPastDuration(addBillingCycle, startDate),
    [addBillingCycle, startDate],
  )

  React.useEffect(() => {
    if (maxPastDuration < 1 && !upUntilToday) {
      // Use setTimeout to avoid synchronous setState during effect
      const timer = setTimeout(() => {
        setUpUntilToday(true)
        setAddDuration('')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [maxPastDuration, upUntilToday])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const error = validateForm(
      { name, cost, startDate, endDate, addBillingCycle, upUntilToday, addDuration },
      isAddMode,
    )
    if (error) {
      setFormError(error)
      return
    }

    try {
      const entries = buildSubmitEntries(isAddMode, {
        name,
        serviceUrl,
        cost,
        currency: selectedCurrency,
        startDate,
        endDate,
        autoRenew,
        addBillingCycle,
        upUntilToday,
        addDuration,
      })
      await onSubmit(entries)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'An error occurred')
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
            if (url) setServiceUrl(url)
          }}
          disabled={isSubmitting || isNewBillingPeriod}
        />
      </div>

      <PricingFields
        currencySymbol={currencySymbol}
        selectedCurrency={selectedCurrency}
        cost={cost}
        autoRenew={autoRenew}
        isSubmitting={isSubmitting}
        onCurrencyChange={setSelectedCurrency}
        onCostChange={setCost}
        onAutoRenewToggle={() => setAutoRenew((v) => !v)}
      />

      <div className="grid sm:grid-cols-2 gap-2">
        <DatePickerButton
          label="Start Date"
          id="start"
          value={startDate}
          onChange={setStartDate}
          open={startCalendarOpen}
          onOpenChange={setStartCalendarOpen}
          disabled={isSubmitting}
          calendarDisabled={startDateCalendarDisabled}
        />

        {isAddMode ? (
          <BillingCycleSelector
            value={addBillingCycle}
            onChange={(cycle) => {
              setAddBillingCycle(cycle)
              setAddDuration('')
              setUpUntilToday(true)
            }}
            disabled={isSubmitting}
          />
        ) : (
          <DatePickerButton
            label="End Date"
            id="end"
            value={endDate}
            onChange={setEndDate}
            open={endCalendarOpen}
            onOpenChange={setEndCalendarOpen}
            disabled={isSubmitting}
            calendarDisabled={makeEndDateCalendarDisabled(startDate)}
          />
        )}
      </div>

      {isAddMode && (
        <AddModeControls
          addBillingCycle={addBillingCycle}
          setAddBillingCycle={(cycle) => {
            setAddBillingCycle(cycle)
            setAddDuration('')
            setUpUntilToday(true)
          }}
          addDuration={addDuration}
          setAddDuration={setAddDuration}
          upUntilToday={upUntilToday}
          setUpUntilToday={setUpUntilToday}
          maxPastDuration={maxPastDuration}
          previewData={previewData}
          isSubmitting={isSubmitting}
        />
      )}

      <FormError formError={formError} submitError={submitError} />

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
