'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'
import { CurrencyCode } from '@/lib/hooks/useCurrency'
import { calculateMonthsDuration, cn, formatLocalizedDate, isSubscriptionActive } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { Pencil, Plus, Repeat, X } from 'lucide-react'

type SubscriptionItem = {
  subscription: DiscoveredSubscription
  index: number
  isSelected: boolean
  /**
   * What importing this entry would do to a list that already holds it, or null
   * when it is genuinely new. `duplicate` is refused by the server; `extend`
   * quietly widens a period the user already owns, which changes no row count -
   * so neither may be presented as a find, and neither is editable here.
   */
  trackedAs: 'extend' | 'duplicate' | null
}

type DiscoveredSubscriptionGroupCardProps = {
  serviceName: string
  serviceUrl?: string
  items: SubscriptionItem[]
  onToggle: (index: number, selected: boolean) => void
  onEdit: (index: number) => void
  disabled?: boolean
}

export function DiscoveredSubscriptionGroupCard({
  serviceName,
  serviceUrl,
  items,
  onToggle,
  onEdit,
  disabled = false,
}: DiscoveredSubscriptionGroupCardProps) {
  // An entry that will extend an existing period is still doing something, so it
  // does not dim the card the way a refused duplicate or a skipped entry does.
  const allSkippedOrDuplicate = items.every(
    (item) => item.trackedAs === 'duplicate' || !item.isSelected,
  )

  const untrackedItems = items.filter((item) => item.trackedAs === null)
  const allUntrackedSelected = untrackedItems.every((item) => item.isSelected)

  const handleCardToggle = () => {
    const newSelected = !allUntrackedSelected
    untrackedItems.forEach((item) => onToggle(item.index, newSelected))
  }

  const renderToggleButton = (className?: string) =>
    untrackedItems.length > 0 && (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              size="icon"
              variant={allUntrackedSelected ? 'destructive' : 'outline'}
              onClick={handleCardToggle}
              aria-label={allUntrackedSelected ? 'Deselect all' : 'Select all'}
              className={cn(
                'h-6 w-6',
                {
                  'border-green-500 hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400':
                    !allUntrackedSelected,
                },
                className,
              )}
              disabled={disabled}
            >
              {allUntrackedSelected ? <X className="size-4" /> : <Plus className="size-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {allUntrackedSelected
              ? 'Skip - do not import this subscription'
              : 'Include this subscription'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

  // One entry reads as a single row: name over its duration, price and actions
  // beside it. Several entries keep a row each under the name.
  const single = items.length === 1 ? items[0] : null

  return (
    <Card
      className={cn('relative overflow-hidden border gap-0 py-4', {
        'opacity-50': allSkippedOrDuplicate,
      })}
    >
      {/* Flush in the top-right corner: the card border frames the pair, so it
          drops its own top and right edges. */}
      {untrackedItems.length > 0 && (
        <div className="absolute top-0 right-0 flex">
          {single && (
            <EntryActions
              item={single}
              disabled={disabled}
              onEdit={onEdit}
              className="w-9 rounded-none rounded-bl-md border-t-0"
            />
          )}
          {renderToggleButton(
            cn('rounded-none border-t-0 border-r-0', single ? 'border-l-0' : 'rounded-bl-md'),
          )}
        </div>
      )}
      <CardContent className="flex gap-3 px-4">
        <div
          className={cn(
            'flex size-10 items-center justify-center rounded-lg overflow-hidden shrink-0',
            single ? 'self-center' : 'self-start',
          )}
        >
          <ServiceLogo
            name={serviceName}
            serviceUrl={serviceUrl}
            size={64}
            className="size-full rounded-lg"
          />
        </div>
        {single ? (
          <div className="flex flex-1 min-w-0 items-center justify-between gap-3">
            <div className="flex flex-col gap-1.5 min-w-0">
              <CardTitle className="text-base break-words">{serviceName}</CardTitle>
              <EntryMeta item={single} />
            </div>
            {/* Bottom-aligned so it clears the corner actions. */}
            <div className="flex items-center gap-3 shrink-0 self-end">
              <EntryPrice item={single} />
              {single.trackedAs !== null && (
                <EntryActions item={single} disabled={disabled} onEdit={onEdit} />
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex min-h-10 items-center pr-6">
              <CardTitle className="text-base break-words">{serviceName}</CardTitle>
            </div>
            {items.map((item) => (
              <div
                key={item.index}
                className={cn('flex items-center justify-between gap-3 py-1.5 border-t', {
                  'opacity-50': isItemDimmed(item),
                })}
              >
                <EntryMeta item={item} />
                <div className="flex items-center gap-2">
                  <EntryPrice item={item} />
                  <EntryActions item={item} disabled={disabled} onEdit={onEdit} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function isItemDimmed(item: SubscriptionItem) {
  return (!item.isSelected && item.trackedAs === null) || item.trackedAs === 'duplicate'
}

function EntryMeta({ item }: { item: SubscriptionItem }) {
  const { subscription } = item

  return (
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <DurationLabel startDate={subscription.start_date} endDate={subscription.end_date} />
      {isSubscriptionActive(subscription.start_date, subscription.end_date) && (
        <RenewalIndicator
          autoRenew={Boolean(subscription.auto_renew)}
          period={subscription.period}
        />
      )}
    </div>
  )
}

function EntryActions({
  item,
  disabled,
  onEdit,
  className,
}: {
  item: SubscriptionItem
  disabled: boolean
  onEdit: (index: number) => void
  className?: string
}) {
  const { isSelected, trackedAs } = item
  const isSkipped = !isSelected && trackedAs === null

  return trackedAs !== null ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Not a button: a disabled one swallows the pointer events the
                  tooltip needs, and there is nothing here to click anyway. */}
          <span
            tabIndex={0}
            className="inline-flex h-6 items-center rounded-md bg-secondary px-2.5 text-xs font-medium text-secondary-foreground whitespace-nowrap"
          >
            {trackedAs === 'extend' ? 'Keeps up to date' : 'Duplicate'}
          </span>
        </TooltipTrigger>
        <TooltipContent side="left">
          {trackedAs === 'extend'
            ? 'Already in your list - importing this only moves its end date forward.'
            : 'Already in your list - importing this would add nothing.'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className={cn('h-6 w-6', className)}
            aria-label="Edit subscription details"
            disabled={disabled || isSkipped}
            onClick={() => onEdit(item.index)}
          >
            <Pencil className="size-3" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Edit subscription details</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function EntryPrice({ item, className }: { item: SubscriptionItem; className?: string }) {
  const { subscription } = item
  const currency = (subscription.currency || 'USD') as CurrencyCode

  return (
    <PriceBadge
      price={subscription.price}
      currency={currency}
      period={subscription.period}
      className={className}
    />
  )
}

const PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  WEEKLY: '/wk',
  MONTHLY: '/mo',
  QUARTERLY: '/qtr',
  YEARLY: '/yr',
}

export function PriceBadge({
  price,
  currency,
  period,
  className,
}: {
  price: number
  currency: CurrencyCode
  period: BillingPeriod
  className?: string
}) {
  return (
    <span
      className={cn('inline-flex items-center text-xl tabular-nums whitespace-nowrap', className)}
    >
      {/* One inline run, so the suffix shares the price's baseline while the
          badge centres the pair. */}
      <span>
        {formatCurrencyAmount(price, currency)}
        <span className="text-muted-foreground text-[0.6em] ml-0.5">{PERIOD_SUFFIX[period]}</span>
      </span>
    </span>
  )
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Run length at a glance; the exact dates live in the tooltip. */
export function DurationLabel({ startDate, endDate }: { startDate: string; endDate: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className="text-xs text-muted-foreground tabular-nums whitespace-nowrap cursor-default"
          >
            {formatDuration(startDate, endDate)}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">
          {formatLocalizedDate(startDate)} to {formatLocalizedDate(endDate)}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function formatDuration(startDate: string, endDate: string): string {
  const months = calculateMonthsDuration(startDate, endDate)
  if (months > 0) return months === 1 ? '1 month' : `${months} months`

  // Weekly runs and first cycles fall under a month, so count days instead.
  const days = Math.max(
    1,
    Math.round((new Date(endDate).getTime() - new Date(startDate).getTime()) / DAY_MS),
  )
  return days === 1 ? '1 day' : `${days} days`
}

const PERIOD_ADVERB: Record<BillingPeriod, string> = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
}

export function RenewalIndicator({
  autoRenew,
  period,
}: {
  autoRenew: boolean
  period: BillingPeriod
}) {
  if (!autoRenew) return null

  const label = `Renews automatically ${PERIOD_ADVERB[period]}`

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span tabIndex={0} role="img" aria-label={label} className="inline-flex">
            <Repeat aria-hidden="true" className="size-3.5 text-muted-foreground" />
          </span>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
