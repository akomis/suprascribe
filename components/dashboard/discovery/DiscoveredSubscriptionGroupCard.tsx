'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DiscoveredSubscription } from '@/lib/hooks/discovery/useGoogleDiscovery'
import { CurrencyCode } from '@/lib/hooks/useCurrency'
import {
  cn,
  formatDateRangeWithDuration,
  formatLocalizedDate,
  isSubscriptionActive,
} from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { Pencil, Plus, X } from 'lucide-react'

type SubscriptionItem = {
  subscription: DiscoveredSubscription
  index: number
  isSelected: boolean
  isDuplicate: boolean
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
  const allSkippedOrDuplicate = items.every((item) => item.isDuplicate || !item.isSelected)

  const nonDuplicateItems = items.filter((item) => !item.isDuplicate)
  const allNonDuplicateSelected = nonDuplicateItems.every((item) => item.isSelected)

  const handleCardToggle = () => {
    const newSelected = !allNonDuplicateSelected
    nonDuplicateItems.forEach((item) => onToggle(item.index, newSelected))
  }

  return (
    <Card className={cn('border gap-0', { 'opacity-50': allSkippedOrDuplicate })}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
              <ServiceLogo
                name={serviceName}
                serviceUrl={serviceUrl}
                size={64}
                className="size-full rounded-lg"
                fallbackClassName="size-5"
              />
            </div>
            <CardTitle className="text-base break-words">{serviceName}</CardTitle>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {nonDuplicateItems.length > 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant={allNonDuplicateSelected ? 'destructive' : 'outline'}
                      onClick={handleCardToggle}
                      className={cn('h-6 w-6', {
                        'border-green-500 hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400':
                          !allNonDuplicateSelected,
                      })}
                      disabled={disabled}
                    >
                      {allNonDuplicateSelected ? (
                        <X className="size-4" />
                      ) : (
                        <Plus className="size-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    {allNonDuplicateSelected
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
          <SubscriptionEntry key={item.index} item={item} disabled={disabled} onEdit={onEdit} />
        ))}
      </CardContent>
    </Card>
  )
}

function SubscriptionEntry({
  item,
  disabled,
  onEdit,
}: {
  item: SubscriptionItem
  disabled: boolean
  onEdit: (index: number) => void
}) {
  const { subscription, isSelected, isDuplicate } = item
  const currency = (subscription.currency || 'USD') as CurrencyCode
  const isSkipped = !isSelected && !isDuplicate

  const isOneTimePayment =
    subscription.start_date === subscription.end_date || !subscription.end_date
  const isPast = !isSubscriptionActive(subscription.start_date, subscription.end_date)

  return (
    <div
      className={cn('flex items-center justify-between gap-3 py-1.5 border-t first:border-t-0', {
        'opacity-50': isSkipped || isDuplicate,
      })}
    >
      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
        {isOneTimePayment ? (
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 whitespace-nowrap">
            One-time
          </span>
        ) : isPast ? (
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground whitespace-nowrap">
            Past
          </span>
        ) : (
          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
            Active
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {isOneTimePayment
            ? formatLocalizedDate(subscription.start_date)
            : formatDateRangeWithDuration(subscription.start_date, subscription.end_date)}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm whitespace-nowrap">
          {formatCurrencyAmount(subscription.price, currency)}
        </span>
        {isDuplicate ? (
          <Button
            type="button"
            variant="secondary"
            className="h-6 px-2.5 text-xs cursor-not-allowed"
            disabled
          >
            Duplicate
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  disabled={disabled}
                  onClick={() => onEdit(item.index)}
                >
                  <Pencil className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Edit subscription details</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  )
}
