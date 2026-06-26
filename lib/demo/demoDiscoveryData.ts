import type { DiscoveredSubscription } from '@/lib/types/forms'
import { toDateString } from '@/lib/utils/date'

const now = new Date()
const shift = (days: number): string => {
  const d = new Date(now)
  d.setDate(d.getDate() + days)
  return toDateString(d)
}

// Fixed curated set the simulated demo discovery "finds". Only services we ship a
// static logo for (see STATIC_LOGOS in lib/hooks/useLogo.ts), with a mix of active
// and one past subscription so the Active/Past grouping in the review view shows.
export const DEMO_DISCOVERED_SUBSCRIPTIONS: DiscoveredSubscription[] = [
  {
    service_name: 'Netflix',
    service_url: 'netflix.com',
    unsubscribe_url: 'https://www.netflix.com/cancelplan',
    price: 15.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: shift(-95),
    end_date: shift(18),
    auto_renew: true,
  },
  {
    service_name: 'Spotify',
    service_url: 'spotify.com',
    unsubscribe_url: 'https://www.spotify.com/account/subscription/',
    price: 11.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: shift(-210),
    end_date: shift(9),
    auto_renew: true,
  },
  {
    service_name: 'Adobe Creative Cloud',
    service_url: 'adobe.com',
    unsubscribe_url: 'https://account.adobe.com/plans',
    price: 59.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: shift(-140),
    end_date: shift(25),
    auto_renew: true,
  },
  {
    service_name: 'Notion',
    service_url: 'notion.so',
    unsubscribe_url: 'https://www.notion.so/my-account',
    price: 96,
    currency: 'USD',
    period: 'YEARLY',
    start_date: shift(-60),
    end_date: shift(305),
    auto_renew: true,
  },
  {
    service_name: 'GitHub Pro',
    service_url: 'github.com',
    unsubscribe_url: 'https://github.com/settings/billing/summary',
    price: 4,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: shift(-20),
    end_date: shift(11),
    auto_renew: true,
  },
  {
    service_name: 'Disney+',
    service_url: 'disneyplus.com',
    unsubscribe_url: 'https://www.disneyplus.com/account/subscription',
    price: 13.99,
    currency: 'USD',
    period: 'MONTHLY',
    start_date: shift(-400),
    end_date: shift(-35),
    auto_renew: false,
  },
]

// ---------------------------------------------------------------------------
// Randomized discovery (used by the unlisted /demo-discovery influencer page).
// Each scan returns a fresh random 6-12 subscriptions with ~20% past, drawn from
// a broad pool of common services so no two recordings look identical.
// ---------------------------------------------------------------------------

type ServiceTemplate = {
  service_name: string
  service_url: string
  unsubscribe_url: string
  price: number
  period: NonNullable<DiscoveredSubscription['period']>
}

// Pool is restricted to services we ship a local SVG for (STATIC_LOGOS /
// public/logos), so every discovered logo renders instantly and offline — the
// Brandfetch CDN path is rate-limited (429) and unreliable for screen
// recordings. To add more brands, drop their SVG in public/logos, register the
// domain in STATIC_LOGOS (lib/hooks/useLogo.ts), then add it here.
const DISCOVERY_POOL: ServiceTemplate[] = [
  {
    service_name: 'Netflix',
    service_url: 'netflix.com',
    unsubscribe_url: 'https://www.netflix.com/cancelplan',
    price: 15.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'Spotify',
    service_url: 'spotify.com',
    unsubscribe_url: 'https://www.spotify.com/account/subscription/',
    price: 11.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'Disney+',
    service_url: 'disneyplus.com',
    unsubscribe_url: 'https://www.disneyplus.com/account/subscription',
    price: 13.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'YouTube Premium',
    service_url: 'youtube.com',
    unsubscribe_url: 'https://www.youtube.com/paid_memberships',
    price: 13.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'Amazon Prime',
    service_url: 'amazon.com',
    unsubscribe_url: 'https://www.amazon.com/mc/pipelines/cancellation',
    price: 14.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'Adobe Creative Cloud',
    service_url: 'adobe.com',
    unsubscribe_url: 'https://account.adobe.com/plans',
    price: 59.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'Notion',
    service_url: 'notion.so',
    unsubscribe_url: 'https://www.notion.so/my-account',
    price: 96,
    period: 'YEARLY',
  },
  {
    service_name: 'GitHub Pro',
    service_url: 'github.com',
    unsubscribe_url: 'https://github.com/settings/billing/summary',
    price: 4,
    period: 'MONTHLY',
  },
  {
    service_name: 'Dropbox',
    service_url: 'dropbox.com',
    unsubscribe_url: 'https://www.dropbox.com/account/plan',
    price: 11.99,
    period: 'MONTHLY',
  },
  {
    service_name: 'Figma',
    service_url: 'figma.com',
    unsubscribe_url: 'https://www.figma.com/settings',
    price: 144,
    period: 'YEARLY',
  },
  {
    service_name: 'Slack',
    service_url: 'slack.com',
    unsubscribe_url: 'https://slack.com/admin/billing',
    price: 87,
    period: 'YEARLY',
  },
  {
    service_name: 'Linear',
    service_url: 'linear.app',
    unsubscribe_url: 'https://linear.app/settings/billing',
    price: 96,
    period: 'YEARLY',
  },
  {
    service_name: 'Microsoft 365',
    service_url: 'microsoft.com',
    unsubscribe_url: 'https://account.microsoft.com/services/',
    price: 99.99,
    period: 'YEARLY',
  },
  {
    service_name: 'Namecheap',
    service_url: 'namecheap.com',
    unsubscribe_url: 'https://www.namecheap.com/myaccount/',
    price: 13.98,
    period: 'YEARLY',
  },
]

const randInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min

const shuffle = <T>(arr: T[]): T[] => {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function toDiscovered(template: ServiceTemplate, past: boolean): DiscoveredSubscription {
  const isYearly = template.period === 'YEARLY'
  if (past) {
    const end = -randInt(20, 200)
    return {
      service_name: template.service_name,
      service_url: template.service_url,
      unsubscribe_url: template.unsubscribe_url,
      price: template.price,
      currency: 'USD',
      period: template.period,
      start_date: shift(end - (isYearly ? randInt(365, 500) : randInt(40, 200))),
      end_date: shift(end),
      auto_renew: false,
    }
  }
  return {
    service_name: template.service_name,
    service_url: template.service_url,
    unsubscribe_url: template.unsubscribe_url,
    price: template.price,
    currency: 'USD',
    period: template.period,
    start_date: shift(-(isYearly ? randInt(30, 330) : randInt(20, 300))),
    end_date: shift(isYearly ? randInt(30, 360) : randInt(5, 28)),
    auto_renew: true,
  }
}

export function generateRandomDiscoveredSubscriptions(): DiscoveredSubscription[] {
  const count = randInt(6, 12)
  const picked = shuffle(DISCOVERY_POOL).slice(0, count)
  const pastCount = Math.round(count * 0.2)

  return shuffle(picked.map((template, i) => toDiscovered(template, i < pastCount)))
}
