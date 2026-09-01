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
import { getCurrencySymbol } from '@/lib/utils/currency'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import { BillingPeriod, CreateSubscriptionFormData } from '@/lib/types/forms'
import { cn, handleNumericInputKeyDown } from '@/lib/utils'
import { formatDisplayDate, toDateString } from '@/lib/utils/date'
import { computePreview, generateEntries } from '@/lib/utils/subscription-entries'
import { addMonths, addWeeks, addYears } from 'date-fns'
import { CalendarIcon, Repeat } from 'lucide-react'
import * as React from 'react'
import { ServiceSelector } from './ServiceSelector'

type BillingCycle = 'weekly' | 'monthly' | 'annually'

// The cycle control doubles as the one-time switch: a single charge is not a
// recurrence, so it belongs in the same list rather than in a second control.
type PeriodChoice = BillingCycle | 'quarterly' | 'one-time'

const ONE_TIME = 'one-time' as const

// Quarterly has no add-mode generator, so it is only offered when editing an
// entry that already carries it.
const ADD_MODE_CHOICES: readonly PeriodChoice[] = ['weekly', 'monthly', 'annually', ONE_TIME]
const EDIT_MODE_CHOICES: readonly PeriodChoice[] = [
  'weekly',
  'monthly',
  'quarterly',
  'annually',
  ONE_TIME,
]

const PERIOD_CHOICE_LABEL: Record<PeriodChoice, string> = {
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
  'one-time': 'One-time',
}

const CHOICE_TO_PERIOD: Record<Exclude<PeriodChoice, 'one-time'>, BillingPeriod> = {
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  quarterly: 'QUARTERLY',
  annually: 'YEARLY',
}

const PERIOD_TO_CHOICE: Record<BillingPeriod, PeriodChoice> = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'annually',
}

type SubscriptionFormProps = {
  subscription?: UserSubscriptionWithDetails
  onSubmit: (data: CreateSubscriptionFormData[]) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
  submitError: Error | null
  deleteButton?: React.ReactNode
  isNewBillingPeriod?: boolean
  disableServiceName?: boolean
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
  setAddDuration: (d: string) => void
  upUntilToday: boolean
  setUpUntilToday: (v: boolean) => void
  maxPastDuration: number
  previewData: { count: number; from: string; to: string } | null
  isSubmitting: boolean
}

function AddModeControls({
  addBillingCycle,
  setAddDuration,
  upUntilToday,
  setUpUntilToday,
  maxPastDuration,
  previewData,
  isSubmitting,
}: AddModeControlsProps) {
  const cycleLabel = addBillingCycle ? BILLING_CYCLE_LABEL[addBillingCycle] : 'monthly'

  return (
    <>
      {addBillingCycle && (
        <div className="flex flex-col gap-2">
          <DurationSelector
            upUntilToday={upUntilToday}
            maxPastDuration={maxPastDuration}
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
  oneTime: boolean
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

// The count itself sits next to the billing cycle; this only picks whether the
// entries run up to today or cover a fixed number of past cycles.
function DurationSelector({
  upUntilToday,
  maxPastDuration,
  isSubmitting,
  setUpUntilToday,
  setAddDuration,
}: {
  upUntilToday: boolean
  maxPastDuration: number
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
            onClick={() => {
              setUpUntilToday(false)
              // The count field takes over here, so it starts at one cycle
              // rather than empty.
              setAddDuration('1')
            }}
            disabled={isSubmitting}
          >
            Past
          </Button>
        )}
      </div>
    </div>
  )
}

function validateAddModeFields(fields: FormFields): string | null {
  // A one-time payment has no cycle to repeat and no duration to cover.
  if (fields.oneTime) return null
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
  // A one-time payment has no span to validate - it ends the day it starts.
  if (fields.oneTime) return null
  if (!fields.endDate) return 'End date is required'
  if (new Date(fields.endDate) < new Date(fields.startDate))
    return 'End date cannot be before start date'
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
  periodChoice: PeriodChoice | null
  autoRenew: boolean
  upUntilToday: boolean
  addDuration: string
}

function buildSubmitEntries(isAddMode: boolean, p: SubmitParams): CreateSubscriptionFormData[] {
  const price = parseFloat(p.cost)
  const serviceUrl = p.serviceUrl.trim() || undefined
  const serviceName = p.name.trim()
  const oneTime = p.periodChoice === ONE_TIME

  // A single charge covers one day and never renews. The period is left off
  // entirely: it is what marks the entry as non-recurring downstream, and the
  // database column supplies its own default.
  if (oneTime) {
    return [
      {
        serviceName,
        serviceUrl,
        price,
        currency: p.currency,
        startDate: p.startDate,
        endDate: p.startDate,
        autoRenew: false,
      },
    ]
  }

  if (isAddMode) {
    return generateEntries({
      serviceName,
      serviceUrl,
      price,
      currency: p.currency,
      startDate: p.startDate,
      billingCycle: p.periodChoice as BillingCycle,
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
      period:
        p.periodChoice && p.periodChoice !== ONE_TIME
          ? CHOICE_TO_PERIOD[p.periodChoice]
          : 'MONTHLY',
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
  oneTime,
  isSubmitting,
  onCurrencyChange,
  onCostChange,
  onAutoRenewToggle,
}: {
  currencySymbol: string
  selectedCurrency: CurrencyCode
  cost: string
  autoRenew: boolean
  // A single charge never renews, so the toggle is locked off rather than
  // offering a choice that the submitted entry would overrule anyway.
  oneTime: boolean
  isSubmitting: boolean
  onCurrencyChange: (v: CurrencyCode) => void
  onCostChange: (v: string) => void
  onAutoRenewToggle: () => void
}) {
  // A subscription can be stored in any ISO-4217 currency, while the picker only
  // offers the ones with an exchange rate. Without appending the current value
  // the trigger would render blank for, say, a SEK subscription, and the code
  // would be lost the moment the user touched the field.
  const currencyOptions = React.useMemo(() => {
    const offered = Object.entries(CURRENCIES).map(([code, { symbol }]) => ({ code, symbol }))
    if (offered.some((option) => option.code === selectedCurrency)) return offered

    return [...offered, { code: selectedCurrency, symbol: getCurrencySymbol(selectedCurrency) }]
  }, [selectedCurrency])

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
            {currencyOptions.map(({ code, symbol }) => (
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
            <span className="w-full">
              <Button
                type="button"
                variant={autoRenew ? 'default' : 'outline'}
                onClick={onAutoRenewToggle}
                disabled={isSubmitting || oneTime}
                aria-label="Toggle auto renewal"
                className={cn('w-full gap-2', { 'text-muted-foreground ': !autoRenew })}
              >
                <Repeat className="size-4" />
                {autoRenew ? 'Enabled' : 'Disabled'}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            {oneTime
              ? 'One-time payments never renew'
              : 'Check if this subscription has auto renewal enabled'}
          </TooltipContent>
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
  options,
  disabled,
  count,
}: {
  value: PeriodChoice | null
  onChange: (choice: PeriodChoice) => void
  options: readonly PeriodChoice[]
  disabled: boolean
  // How many of the selected cycle to create. Omitted where a count has no
  // meaning: editing a single billing period, or a one-time payment.
  count?: {
    value: string
    onChange: (v: string) => void
    max: number
    unit: string
    disabled: boolean
  }
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="billing-cycle">Billing Cycle</Label>
      <div className="flex gap-2">
        <Select
          value={value ?? undefined}
          onValueChange={(v) => onChange(v as PeriodChoice)}
          disabled={disabled}
        >
          <SelectTrigger id="billing-cycle" className="w-full">
            <SelectValue placeholder="Select a cycle" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                {PERIOD_CHOICE_LABEL[option]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {count && (
          <Input
            id="duration"
            type="number"
            min="1"
            max={count.max}
            step="1"
            value={count.value}
            aria-label={`Number of ${count.unit}`}
            title={`Number of ${count.unit}`}
            onChange={(e) => {
              const raw = parseInt(e.target.value, 10)
              if (isNaN(raw)) {
                count.onChange('')
                return
              }
              count.onChange(String(Math.min(Math.max(raw, 1), count.max)))
            }}
            onKeyDown={handleNumericInputKeyDown}
            placeholder="1"
            disabled={disabled || count.disabled}
            className="w-20 shrink-0"
          />
        )}
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
  disableServiceName = false,
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
  // An existing entry with no period, or one ending the day it started, is a
  // single charge. A period being added to an existing subscription arrives with
  // a blank end date on purpose and must not be mistaken for one.
  const [periodChoice, setPeriodChoice] = React.useState<PeriodChoice | null>(() => {
    if (isAddMode) return null
    if (isNewBillingPeriod)
      return subscription?.period ? PERIOD_TO_CHOICE[subscription.period] : null
    if (!subscription?.period || subscription.end_date === subscription.start_date) return ONE_TIME
    return PERIOD_TO_CHOICE[subscription.period]
  })
  const [addDuration, setAddDuration] = React.useState<string>('')
  const [upUntilToday, setUpUntilToday] = React.useState<boolean>(true)

  const oneTime = periodChoice === ONE_TIME
  const addBillingCycle = !periodChoice || oneTime ? null : (periodChoice as BillingCycle)
  const currencySymbol = getCurrencySymbol(selectedCurrency)

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
      { name, cost, startDate, endDate, oneTime, addBillingCycle, upUntilToday, addDuration },
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
        periodChoice,
        autoRenew,
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
          disabled={isSubmitting || isNewBillingPeriod || disableServiceName}
        />
      </div>

      <PricingFields
        currencySymbol={currencySymbol}
        selectedCurrency={selectedCurrency}
        cost={cost}
        autoRenew={!oneTime && autoRenew}
        oneTime={oneTime}
        isSubmitting={isSubmitting}
        onCurrencyChange={setSelectedCurrency}
        onCostChange={setCost}
        onAutoRenewToggle={() => setAutoRenew((v) => !v)}
      />

      <div className="grid sm:grid-cols-2 gap-2">
        <DatePickerButton
          // A single charge has one date, not a span, so "start" would be a lie.
          label={oneTime ? 'Date' : 'Start Date'}
          id="start"
          value={startDate}
          onChange={setStartDate}
          open={startCalendarOpen}
          onOpenChange={setStartCalendarOpen}
          disabled={isSubmitting}
          calendarDisabled={startDateCalendarDisabled}
        />

        {/* A one-time payment has nothing to end, so the field goes away rather
            than sitting there holding a date that means nothing. */}
        {!isAddMode && !oneTime && (
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

        <BillingCycleSelector
          value={periodChoice}
          options={isAddMode ? ADD_MODE_CHOICES : EDIT_MODE_CHOICES}
          onChange={(choice) => {
            setPeriodChoice(choice)
            setAddDuration('')
            setUpUntilToday(true)
            if (choice === ONE_TIME) {
              setEndDate('')
              setAutoRenew(false)
            }
          }}
          disabled={isSubmitting}
          count={
            isAddMode && addBillingCycle
              ? {
                  // While the entries run up to today their number follows from
                  // the start date, so the field reports it instead of taking it.
                  value: upUntilToday ? String(previewData?.count ?? '') : addDuration,
                  onChange: setAddDuration,
                  max: Math.max(maxPastDuration, 1),
                  unit: BILLING_CYCLE_UNIT[addBillingCycle],
                  disabled: upUntilToday,
                }
              : undefined
          }
        />
      </div>

      {isAddMode && !oneTime && (
        <AddModeControls
          addBillingCycle={addBillingCycle}
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
