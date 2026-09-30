'use client'

import { ActivePastTabs } from '@/components/dashboard/discovery/ActivePastTabs'
import {
  DurationLabel,
  PriceBadge,
  RenewalIndicator,
} from '@/components/dashboard/discovery/DiscoveredSubscriptionGroupCard'
import type { BillingPeriod } from '@/lib/types/forms'
import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

type DemoItem = {
  service_name: string
  service_url: string
  price: number
  currency: 'USD' | 'EUR' | 'GBP'
  period: BillingPeriod
  start_date: string
  end_date: string
  active: boolean
  auto_renew?: boolean
}

const DEMO_ITEMS: DemoItem[] = [
  {
    service_name: 'Netflix',
    service_url: 'https://netflix.com',
    price: 15.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2025-09-15',
    end_date: '2026-10-15',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'Spotify',
    service_url: 'https://spotify.com',
    price: 10.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2026-01-03',
    end_date: '2026-10-03',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'Claude Pro',
    service_url: 'https://claude.ai',
    price: 20.0,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2026-04-12',
    end_date: '2026-10-12',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'YouTube Premium',
    service_url: 'https://youtube.com',
    price: 13.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2025-11-08',
    end_date: '2026-10-08',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'Adobe Creative Cloud',
    service_url: 'https://adobe.com',
    price: 54.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2026-03-20',
    end_date: '2027-03-20',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'Google One',
    service_url: 'https://one.google.com',
    price: 1.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2024-10-21',
    end_date: '2026-10-21',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'Uber One',
    service_url: 'https://uber.com',
    price: 9.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2026-08-02',
    end_date: '2026-11-02',
    active: true,
    auto_renew: true,
  },
  {
    service_name: 'GitHub PRO',
    service_url: 'https://github.com',
    price: 48.0,
    currency: 'USD',
    period: 'YEARLY',
    start_date: '2026-05-01',
    end_date: '2026-11-01',
    active: true,
    auto_renew: false,
  },
  {
    service_name: 'ChatGPT Plus',
    service_url: 'https://chatgpt.com',
    price: 20.0,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2025-06-14',
    end_date: '2026-05-14',
    active: false,
  },
  {
    service_name: 'Apple TV+',
    service_url: 'https://tv.apple.com',
    price: 12.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2025-12-01',
    end_date: '2026-06-01',
    active: false,
  },
  {
    service_name: 'Disney+',
    service_url: 'https://disneyplus.com',
    price: 13.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2024-06-01',
    end_date: '2025-06-01',
    active: false,
  },
  {
    service_name: 'Dropbox Plus',
    service_url: 'https://dropbox.com',
    price: 119.88,
    currency: 'USD',
    period: 'YEARLY',
    start_date: '2022-06-15',
    end_date: '2025-06-15',
    active: false,
  },
  {
    service_name: 'Figma',
    service_url: 'https://figma.com',
    price: 15.0,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: '2021-07-01',
    end_date: '2024-07-01',
    active: false,
  },
]

const ACTIVE_ITEMS = DEMO_ITEMS.filter((s) => s.active)
const PAST_ITEMS = DEMO_ITEMS.filter((s) => !s.active)

function DemoItemCard({ item }: { item: DemoItem }) {
  return (
    <Card className="border gap-0 py-3 sm:py-4">
      <CardContent className="flex items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
            <ServiceLogo
              name={item.service_name}
              serviceUrl={item.service_url}
              size={64}
              className="size-full rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-1.5 min-w-0">
            <CardTitle className="text-sm sm:text-base truncate">{item.service_name}</CardTitle>
            <div className="flex items-center gap-2">
              <DurationLabel startDate={item.start_date} endDate={item.end_date} />
              {item.active && (
                <RenewalIndicator autoRenew={Boolean(item.auto_renew)} period={item.period} />
              )}
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <PriceBadge price={item.price} currency={item.currency} period={item.period} />
        </div>
      </CardContent>
    </Card>
  )
}

function DemoItemList({ items }: { items: DemoItem[] }) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3">
      {items.map((item) => (
        <DemoItemCard key={item.service_name} item={item} />
      ))}
    </div>
  )
}

export default function DemoDiscovery() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border bg-background max-h-[400px] sm:max-h-[450px] overflow-hidden">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm sm:text-base">Subscriptions Discovered</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Found {DEMO_ITEMS.length} subscriptions in your inbox.
        </p>
      </div>

      <ActivePastTabs
        active={<DemoItemList items={ACTIVE_ITEMS} />}
        past={<DemoItemList items={PAST_ITEMS} />}
        // Only the lists scroll, so the heading and tabs stay put.
        className="flex-1 min-h-0"
        contentClassName="min-h-0 overflow-y-auto"
      />
    </div>
  )
}
