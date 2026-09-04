'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { UnsubscribeButton } from '@/components/shared/UnsubscribeButton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'
import {
  cn,
  formatDateRangeWithDuration,
  formatLocalizedDate,
  isSubscriptionActive,
} from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { isOneTimePayment, ONE_TIME_SECTION_LABEL } from '@/lib/utils/subscription-period-extension'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

type ServiceGroup = {
  serviceName: string
  serviceUrl?: string
  unsubscribeUrl?: string
  latest: DiscoveredSubscription
  active: boolean
}

const PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  WEEKLY: '/wk',
  MONTHLY: '/mo',
  QUARTERLY: '/qtr',
  YEARLY: '/yr',
}

function groupByService(subs: DiscoveredSubscription[]): ServiceGroup[] {
  const map = new Map<string, DiscoveredSubscription[]>()
  for (const sub of subs) {
    if (!map.has(sub.service_name)) map.set(sub.service_name, [])
    map.get(sub.service_name)!.push(sub)
  }

  const groups: ServiceGroup[] = Array.from(map.entries()).map(([serviceName, list]) => {
    const latest = [...list].sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime(),
    )[0]
    return {
      serviceName,
      serviceUrl: list.find((s) => s.service_url)?.service_url,
      unsubscribeUrl: list.find((s) => s.unsubscribe_url)?.unsubscribe_url,
      latest,
      active: isSubscriptionActive(latest.start_date, latest.end_date),
    }
  })

  // Active services first, then alphabetical.
  return groups.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return a.serviceName.localeCompare(b.serviceName)
  })
}

function ServiceRow({ group }: { group: ServiceGroup }) {
  const { latest } = group
  const periodSuffix = latest.period ? PERIOD_SUFFIX[latest.period] : ''
  const oneTime = isOneTimePayment(latest)
  const dateLabel = oneTime
    ? formatLocalizedDate(latest.start_date)
    : formatDateRangeWithDuration(latest.start_date, latest.end_date)

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
        <ServiceLogo name={group.serviceName} serviceUrl={group.serviceUrl} />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">{group.serviceName}</span>
          {oneTime ? (
            <Badge variant="outline" className="text-[10px] shrink-0">
              One-time
            </Badge>
          ) : (
            !group.active && (
              <Badge variant="outline" className="text-[10px] shrink-0">
                Past
              </Badge>
            )
          )}
        </div>
        {latest.price > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrencyAmount(latest.price, (latest.currency as CurrencyCode) ?? 'EUR')}
            {periodSuffix}
          </span>
        )}
        <span className="text-xs text-muted-foreground truncate">{dateLabel}</span>
      </div>
      {group.active && (
        <UnsubscribeButton
          serviceName={group.serviceName}
          unsubscribeUrl={group.unsubscribeUrl}
          surface="public"
          className="shrink-0"
        />
      )}
    </div>
  )
}

function formatDiscoveredAt(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
  } catch {
    return iso
  }
}

export function DiscoveryResultsReadOnly({
  subscriptions,
  emailScanned,
  discoveredAt,
}: {
  subscriptions: DiscoveredSubscription[]
  emailScanned: string | null
  discoveredAt?: string | null
}) {
  const [showPast, setShowPast] = useState(false)

  if (subscriptions.length === 0) {
    return (
      <div className="text-center space-y-2">
        <h2 className="text-xl font-semibold">No subscriptions found</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t find any subscription emails
          {emailScanned ? ` in ${emailScanned}` : ''}.
        </p>
      </div>
    )
  }

  // One-time charges get their own section: the active/past split below only
  // describes a recurring one.
  const recurringGroups = groupByService(subscriptions.filter((sub) => !isOneTimePayment(sub)))
  const oneTimeGroups = groupByService(subscriptions.filter(isOneTimePayment))
  const activeGroups = recurringGroups.filter((g) => g.active)
  const pastGroups = recurringGroups.filter((g) => !g.active)
  const serviceCount = new Set(subscriptions.map((sub) => sub.service_name)).size

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">
          We found {serviceCount} subscription{serviceCount !== 1 ? 's' : ''}
        </h2>
        {emailScanned && (
          <div className="flex justify-center pt-1">
            <Badge variant="secondary" className="font-normal">
              {emailScanned}
            </Badge>
          </div>
        )}
        <p className="text-sm text-muted-foreground">
          Use the unsubscribe links to cancel the ones you no longer want.
        </p>
        {discoveredAt && (
          <p className="text-xs text-muted-foreground">
            Discovered {formatDiscoveredAt(discoveredAt)}
          </p>
        )}
      </div>

      {activeGroups.length > 0 && (
        <div className="flex flex-col gap-2">
          {activeGroups.map((group) => (
            <ServiceRow key={group.serviceName} group={group} />
          ))}
        </div>
      )}

      {pastGroups.length > 0 && (
        <>
          <Separator />
          <button
            type="button"
            onClick={() => setShowPast((prev) => !prev)}
            className="flex items-center justify-between w-full py-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Past subscriptions ({pastGroups.length})</span>
            <ChevronDown className={cn('size-4 transition-transform', showPast && 'rotate-180')} />
          </button>
          {showPast && (
            <div className="flex flex-col gap-2">
              {pastGroups.map((group) => (
                <ServiceRow key={group.serviceName} group={group} />
              ))}
            </div>
          )}
        </>
      )}

      {oneTimeGroups.length > 0 && (
        <>
          <Separator />
          <span className="text-sm text-muted-foreground">{ONE_TIME_SECTION_LABEL}</span>
          <div className="flex flex-col gap-2">
            {oneTimeGroups.map((group) => (
              <ServiceRow key={group.serviceName} group={group} />
            ))}
          </div>
        </>
      )}

      <p className="text-xs text-muted-foreground text-center">
        These results were identified by AI and may contain mistakes. Nothing was saved to
        Suprascribe.
      </p>
    </div>
  )
}
