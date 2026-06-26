'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import type { BillingPeriod, DiscoveredSubscription } from '@/lib/types/forms'
import { cn, isSubscriptionActive } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { ChevronDown, ExternalLink } from 'lucide-react'
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
  const cancelUrl = group.unsubscribeUrl ?? group.serviceUrl
  const periodSuffix = latest.period ? PERIOD_SUFFIX[latest.period] : ''

  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
        <ServiceLogo name={group.serviceName} serviceUrl={group.serviceUrl} />
      </div>
      <div className="flex flex-1 flex-col min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-medium truncate">{group.serviceName}</span>
          {!group.active && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              Past
            </Badge>
          )}
        </div>
        {latest.price > 0 && (
          <span className="text-xs text-muted-foreground tabular-nums">
            {formatCurrencyAmount(latest.price, (latest.currency as CurrencyCode) ?? 'EUR')}
            {periodSuffix}
          </span>
        )}
      </div>
      {group.active &&
        (cancelUrl ? (
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={cancelUrl} target="_blank" rel="noopener noreferrer">
              Unsubscribe
              <ExternalLink className="size-3.5" />
            </a>
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground shrink-0">No link found</span>
        ))}
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

  const groups = groupByService(subscriptions)
  const activeGroups = groups.filter((g) => g.active)
  const pastGroups = groups.filter((g) => !g.active)

  return (
    <div className="w-full max-w-xl flex flex-col gap-4">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">
          We found {groups.length} subscription{groups.length !== 1 ? 's' : ''}
        </h2>
        <p className="text-sm text-muted-foreground">
          {emailScanned ? `Scanned ${emailScanned}. ` : ''}
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

      <p className="text-xs text-muted-foreground text-center">
        These results were identified by AI and may contain mistakes. Nothing was saved to
        Suprascribe.
      </p>
    </div>
  )
}
