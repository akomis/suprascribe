'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatDateRangeWithDuration } from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'

type DemoItem = {
  service_name: string
  service_url: string
  price: number
  currency: 'USD' | 'EUR' | 'GBP'
  start_date: string
  end_date: string
  active: boolean
}

const DEMO_ITEMS: DemoItem[] = [
  {
    service_name: 'Netflix',
    service_url: 'https://netflix.com',
    price: 15.99,
    currency: 'USD',
    start_date: '2025-09-15',
    end_date: '2026-08-15',
    active: true,
  },
  {
    service_name: 'Spotify',
    service_url: 'https://spotify.com',
    price: 10.99,
    currency: 'USD',
    start_date: '2026-01-03',
    end_date: '2026-07-03',
    active: true,
  },
  {
    service_name: 'Adobe Creative Cloud',
    service_url: 'https://adobe.com',
    price: 54.99,
    currency: 'USD',
    start_date: '2026-03-20',
    end_date: '2027-03-20',
    active: true,
  },
  {
    service_name: 'GitHub Pro',
    service_url: 'https://github.com',
    price: 4.0,
    currency: 'USD',
    start_date: '2026-05-01',
    end_date: '2026-08-01',
    active: true,
  },
  {
    service_name: 'Amazon Prime',
    service_url: 'https://amazon.com',
    price: 14.99,
    currency: 'USD',
    start_date: '2026-04-22',
    end_date: '2026-07-22',
    active: true,
  },
  {
    service_name: 'Disney+',
    service_url: 'https://disneyplus.com',
    price: 13.99,
    currency: 'USD',
    start_date: '2024-06-01',
    end_date: '2025-06-01',
    active: false,
  },
  {
    service_name: 'Notion',
    service_url: 'https://notion.so',
    price: 16.0,
    currency: 'USD',
    start_date: '2023-06-01',
    end_date: '2025-04-01',
    active: false,
  },
  {
    service_name: 'Dropbox Plus',
    service_url: 'https://dropbox.com',
    price: 11.99,
    currency: 'USD',
    start_date: '2022-06-15',
    end_date: '2025-06-15',
    active: false,
  },
  {
    service_name: 'Figma',
    service_url: 'https://figma.com',
    price: 15.0,
    currency: 'USD',
    start_date: '2021-07-01',
    end_date: '2024-07-01',
    active: false,
  },
]

const ACTIVE_ITEMS = DEMO_ITEMS.filter((s) => s.active)
const PAST_ITEMS = DEMO_ITEMS.filter((s) => !s.active)

function StatusBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center rounded-full bg-green-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400 whitespace-nowrap">
        Active
      </span>
    )
  }
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium text-muted-foreground whitespace-nowrap">
      Past
    </span>
  )
}

function DemoItemCard({ item }: { item: DemoItem }) {
  return (
    <Card className="border gap-0">
      <CardHeader className="pb-2 px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="flex size-8 sm:size-10 items-center justify-center rounded-lg overflow-hidden shrink-0">
              <ServiceLogo
                name={item.service_name}
                serviceUrl={item.service_url}
                size={64}
                className="size-full rounded-lg"
                fallbackClassName="size-4 sm:size-5"
              />
            </div>
            <CardTitle className="text-sm sm:text-base wrap-break-word truncate">
              {item.service_name}
            </CardTitle>
          </div>
          <StatusBadge active={item.active} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-0 pt-0 px-3 sm:px-6">
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-1.5 sm:gap-3 py-1.5">
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate max-w-30 sm:max-w-none flex-1 min-w-0">
            {formatDateRangeWithDuration(item.start_date, item.end_date)}
          </span>
          <span className="font-medium text-xs sm:text-sm whitespace-nowrap shrink-0">
            {formatCurrencyAmount(item.price, item.currency)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DemoDiscovery() {
  return (
    <div className="flex flex-col gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border bg-background max-h-[400px] sm:max-h-[450px] overflow-y-auto">
      <div className="space-y-1">
        <h3 className="font-semibold text-sm sm:text-base">Subscriptions Discovered</h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Found {DEMO_ITEMS.length} services in your inbox.
        </p>
      </div>

      <div className="space-y-2 sm:space-y-3">
        {ACTIVE_ITEMS.map((item) => (
          <DemoItemCard key={item.service_name} item={item} />
        ))}

        <Separator orientation="horizontal" />

        {PAST_ITEMS.map((item) => (
          <DemoItemCard key={item.service_name} item={item} />
        ))}
      </div>
    </div>
  )
}
