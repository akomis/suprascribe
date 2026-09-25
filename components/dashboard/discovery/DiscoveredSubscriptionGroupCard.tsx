'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { CurrencyCode } from '@/lib/hooks/useCurrency'
import { cn, formatDateRangeWithDuration, isSubscriptionActive } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { Pencil, Plus, X } from 'lucide-react'

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

  // With a single entry the edit action is unambiguous, so it sits in the header next to the
  // include/skip toggle. Groups with several entries keep a pencil per row - one header button
  // could not say which entry it edits.
  const soleItem = items.length === 1 && items[0].trackedAs === null ? items[0] : null

  const handleCardToggle = () => {
    const newSelected = !allUntrackedSelected
    untrackedItems.forEach((item) => onToggle(item.index, newSelected))
  }

  return (
    <Card className={cn('border gap-0', { 'opacity-50': allSkippedOrDuplicate })}>
      <CardHeader className="">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
              <ServiceLogo
                name={serviceName}
                serviceUrl={serviceUrl}
                size={64}
                className="size-full rounded-lg"
              />
            </div>
            <CardTitle className="text-base break-words">{serviceName}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {soleItem && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      aria-label="Edit subscription details"
                      disabled={disabled || !soleItem.isSelected}
                      onClick={() => onEdit(soleItem.index)}
                    >
                      <Pencil className="size-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">Edit subscription details</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {untrackedItems.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant={allUntrackedSelected ? 'destructive' : 'outline'}
                      onClick={handleCardToggle}
                      aria-label={allUntrackedSelected ? 'Deselect all' : 'Select all'}
                      className={cn('h-6 w-6', {
                        'border-green-500 hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400':
                          !allUntrackedSelected,
                      })}
                      disabled={disabled}
                    >
                      {allUntrackedSelected ? (
                        <X className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {allUntrackedSelected
                      ? 'Skip - do not import this subscription'
                      : 'Include this subscription'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 pt-0">
        {items.map((item) => (
          <SubscriptionEntry
            key={item.index}
            item={item}
            disabled={disabled}
            onEdit={onEdit}
            showEdit={soleItem === null}
          />
        ))}
      </CardContent>
    </Card>
  )
}

function SubscriptionEntry({
  item,
  disabled,
  onEdit,
  showEdit,
}: {
  item: SubscriptionItem
  disabled: boolean
  onEdit: (index: number) => void
  showEdit: boolean
}) {
  const { subscription, isSelected, trackedAs } = item
  const currency = (subscription.currency || 'USD') as CurrencyCode
  const isSkipped = !isSelected && trackedAs === null

  const isPast = !isSubscriptionActive(subscription.start_date, subscription.end_date)

  return (
    <div
      className={cn('flex items-center justify-between gap-3 py-1.5 border-t first:border-t-0', {
        'opacity-50': isSkipped || trackedAs === 'duplicate',
      })}
    >
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {isPast ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
            Past
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
            Active
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatDateRangeWithDuration(subscription.start_date, subscription.end_date)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm whitespace-nowrap">
          {formatCurrencyAmount(subscription.price, currency)}
        </span>
        {trackedAs !== null ? (
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
          showEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
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
        )}
      </div>
    </div>
  )
}
