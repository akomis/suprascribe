import { SubscriptionBadge } from '@/components/dashboard/SubscriptionBadge'
import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import * as React from 'react'

type SubscriptionItem = {
  name: string
  url?: string
  endDate?: string
  onOpen?: () => void
}

type InsightCardProps = {
  title: string
  label?: string | null
  value?: string | null
  serviceName?: string
  serviceUrl?: string
  subscriptions?: SubscriptionItem[]
}

export default function InsightCard({
  title,
  label,
  value,
  serviceName,
  serviceUrl,
  subscriptions,
}: InsightCardProps) {
  return (
    <Card className="py-2 h-fit gap-0 bg-neutral-50 dark:bg-neutral-950">
      {(label || value || (subscriptions && subscriptions.length > 0)) && (
        <CardContent className="flex flex-col sm:flex-row w-full sm:justify-between sm:items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-6">
          <p className="text-xs sm:text-sm font-normal text-muted-foreground truncate min-w-0 text-center sm:text-left">
            {title}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 sm:gap-2">
            {subscriptions && subscriptions.length > 0 ? (
              <div className="flex flex-wrap gap-1 sm:gap-2 items-center shrink-0">
                {subscriptions.map((sub, index) => {
                  const daysUntilRenewal = sub.endDate
                    ? Math.ceil(
                        (new Date(sub.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
                      )
                    : undefined
                  return (
                    <SubscriptionBadge
                      key={`${sub.name}-${index}`}
                      name={sub.name}
                      url={sub.url}
                      showLabel={false}
                      daysUntilRenewal={daysUntilRenewal}
                      onClick={sub.onOpen}
                    />
                  )
                })}
              </div>
            ) : (
              <>
                {label && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className="gap-1 sm:gap-2 bg-white dark:bg-neutral-900 w-fit p-1 sm:p-1.5 cursor-default shrink-0"
                      >
                        {serviceName && (
                          <div className="flex size-4 sm:size-6 items-center justify-center rounded overflow-hidden shrink-0">
                            <ServiceLogo
                              name={serviceName}
                              serviceUrl={serviceUrl}
                              size={24}
                              className="size-full"
                              fallbackClassName="size-3 sm:size-4"
                            />
                          </div>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{label}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </>
            )}
            {value && (
              <span className="text-xs sm:text-sm text-muted-foreground font-mono whitespace-nowrap shrink-0 text-end">
                {value}
              </span>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
