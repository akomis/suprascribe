import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import type { UserSubscriptionWithDetails, CurrencyCode, Database } from '@/lib/types/database'
import { toDateString } from '@/lib/utils/date'

type BillingPeriod = Database['public']['Enums']['BILLING_PERIOD']

export type DemoSubscriptionWithDetails = UserSubscriptionWithDetails & {
  category?: string
}

export type DemoMergedSubscription = Omit<MergedSubscriptionResponse, 'subscriptions'> & {
  category?: string
  subscriptions: DemoSubscriptionWithDetails[]
}

export const DEMO_TODAY = new Date()
const today = DEMO_TODAY
const daysFromNow = (days: number) => {
  const date = new Date(today)
  date.setDate(date.getDate() + days)
  return toDateString(date)
}
const daysAgo = (days: number) => daysFromNow(-days)
const yearsAgo = (years: number, monthOffset = 0) => {
  const date = new Date(today)
  date.setFullYear(date.getFullYear() - years)
  date.setMonth(date.getMonth() + monthOffset)
  return toDateString(date)
}

// Returns the first day of the calendar month at `offset` months from today.
// offset=0 → this month, offset=-1 → last month, offset=1 → next month, etc.
const monthStart = (offset: number): string =>
  toDateString(new Date(today.getFullYear(), today.getMonth() + offset, 1))

function createSubscription(
  id: number,
  serviceId: number,
  name: string,
  url: string,
  price: number,
  currency: CurrencyCode,
  period: BillingPeriod,
  startDate: string,
  endDate: string,
  autoRenew: boolean,
  category: string,
  paymentMethod: string,
  unsubscribeUrl: string | null = null,
): DemoSubscriptionWithDetails {
  return {
    id,
    user_id: 'demo-user',
    subscription_service_id: serviceId,
    price,
    currency,
    period,
    start_date: startDate,
    end_date: endDate,
    auto_renew: autoRenew,
    payment_method: paymentMethod,
    source_email: null,
    category,
    created_at: startDate,
    subscription_service: {
      name,
      url,
      unsubscribe_url: unsubscribeUrl,
    },
  }
}

// Creates `count` calendar-month billing periods starting at month `startMonthOffset`.
// Period i: monthStart(startMonthOffset + i) → monthStart(startMonthOffset + i + 1)
function buildMonthlyPeriods(
  firstPeriodId: number,
  serviceId: number,
  name: string,
  url: string,
  price: number,
  currency: CurrencyCode,
  startMonthOffset: number,
  count: number,
  autoRenew: boolean,
  category: string,
  paymentMethod: string,
  unsubscribeUrl: string | null = null,
): DemoSubscriptionWithDetails[] {
  return Array.from({ length: count }, (_, i) =>
    createSubscription(
      firstPeriodId + i,
      serviceId,
      name,
      url,
      price,
      currency,
      'MONTHLY',
      monthStart(startMonthOffset + i),
      monthStart(startMonthOffset + i + 1),
      autoRenew,
      category,
      paymentMethod,
      unsubscribeUrl,
    ),
  )
}

export const SAMPLE_SUBSCRIPTIONS: DemoMergedSubscription[] = [
  {
    name: 'Netflix',
    serviceUrl: 'https://netflix.com',
    price: 15.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: daysAgo(105),
    endDate: daysFromNow(17),
    autoRenew: true,
    active: true,
    category: 'Entertainment',
    spentThisYear: 63.96,
    forecastThisYear: 159.9,
    totalSpent: 63.96,
    paymentMethod: 'Credit Card',
    // 4 months of history: months -3 through 0 (current month)
    subscriptions: buildMonthlyPeriods(
      1000,
      1,
      'Netflix',
      'https://netflix.com',
      15.99,
      'USD',
      -3,
      4,
      true,
      'Entertainment',
      'Credit Card',
      'https://www.netflix.com/cancelplan',
    ),
  },
  {
    name: 'Spotify',
    serviceUrl: 'https://spotify.com',
    price: 10.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: daysAgo(210),
    endDate: daysFromNow(3),
    autoRenew: true,
    active: true,
    category: 'Entertainment',
    spentThisYear: 65.94,
    forecastThisYear: 131.88,
    totalSpent: 76.93,
    paymentMethod: 'PayPal',
    // 7 months of history: months -6 through 0
    subscriptions: buildMonthlyPeriods(
      2000,
      2,
      'Spotify',
      'https://spotify.com',
      10.99,
      'USD',
      -6,
      7,
      true,
      'Entertainment',
      'PayPal',
      'https://www.spotify.com/account/subscription/',
    ),
  },
  {
    name: 'Adobe Creative Cloud',
    serviceUrl: 'https://adobe.com',
    price: 54.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: daysAgo(90),
    endDate: daysFromNow(275),
    autoRenew: true,
    active: true,
    category: 'Software',
    spentThisYear: 164.97,
    forecastThisYear: 659.88,
    totalSpent: 164.97,
    paymentMethod: 'Credit Card',
    // 3 months of history: months -2 through 0
    subscriptions: buildMonthlyPeriods(
      3000,
      3,
      'Adobe Creative Cloud',
      'https://adobe.com',
      54.99,
      'USD',
      -2,
      3,
      true,
      'Software',
      'Credit Card',
      'https://account.adobe.com/plans',
    ),
  },
  {
    name: 'GitHub Pro',
    serviceUrl: 'https://github.com',
    price: 4.0,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: daysAgo(150),
    endDate: daysFromNow(5),
    autoRenew: false,
    active: true,
    category: 'Software',
    spentThisYear: 20.0,
    forecastThisYear: 48.0,
    totalSpent: 20.0,
    paymentMethod: 'Credit Card',
    // 5 months of history: months -4 through 0
    subscriptions: buildMonthlyPeriods(
      4000,
      4,
      'GitHub Pro',
      'https://github.com',
      4.0,
      'USD',
      -4,
      5,
      false,
      'Software',
      'Credit Card',
      'https://github.com/settings/billing',
    ),
  },
  {
    name: 'Amazon Prime',
    serviceUrl: 'https://amazon.com',
    price: 14.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: daysAgo(75),
    endDate: daysFromNow(24),
    autoRenew: true,
    active: true,
    category: 'Other',
    spentThisYear: 44.97,
    forecastThisYear: 149.9,
    totalSpent: 44.97,
    paymentMethod: 'Credit Card',
    // 3 months of history: months -2 through 0
    subscriptions: buildMonthlyPeriods(
      5000,
      5,
      'Amazon Prime',
      'https://amazon.com',
      14.99,
      'USD',
      -2,
      3,
      true,
      'Other',
      'Credit Card',
      'https://www.amazon.com/mc/pipeline',
    ),
  },
  {
    name: 'Disney+',
    serviceUrl: 'https://disneyplus.com',
    price: 7.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: daysAgo(185),
    endDate: daysAgo(37),
    autoRenew: false,
    active: false,
    category: 'Entertainment',
    spentThisYear: 31.96,
    forecastThisYear: 31.96,
    totalSpent: 39.95,
    paymentMethod: 'PayPal',
    // 5 months, cancelled ~37 days ago. months -6 through -2
    subscriptions: buildMonthlyPeriods(
      6000,
      6,
      'Disney+',
      'https://disneyplus.com',
      7.99,
      'USD',
      -6,
      5,
      false,
      'Entertainment',
      'PayPal',
      'https://www.disneyplus.com/account/subscription',
    ),
  },
  {
    name: 'Notion',
    serviceUrl: 'https://notion.so',
    price: 8.0,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: yearsAgo(3),
    endDate: yearsAgo(1, 2),
    autoRenew: false,
    active: false,
    category: 'Productivity',
    spentThisYear: 0,
    forecastThisYear: 0,
    totalSpent: 240.0,
    paymentMethod: 'Credit Card',
    // 10 months ending ~14 months ago. months -23 through -14
    subscriptions: buildMonthlyPeriods(
      7000,
      7,
      'Notion',
      'https://notion.so',
      8.0,
      'USD',
      -23,
      10,
      false,
      'Productivity',
      'Credit Card',
      'https://www.notion.so/profile/billing',
    ),
  },
  {
    name: 'Dropbox Plus',
    serviceUrl: 'https://dropbox.com',
    price: 9.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: yearsAgo(2, -3),
    endDate: yearsAgo(1),
    autoRenew: false,
    active: false,
    category: 'Storage',
    spentThisYear: 0,
    forecastThisYear: 0,
    totalSpent: 119.88,
    paymentMethod: 'PayPal',
    // 8 months ending ~12 months ago. months -19 through -12
    subscriptions: buildMonthlyPeriods(
      8000,
      8,
      'Dropbox Plus',
      'https://dropbox.com',
      9.99,
      'USD',
      -19,
      8,
      false,
      'Storage',
      'PayPal',
      'https://www.dropbox.com/account/plan',
    ),
  },
  {
    name: 'YouTube Premium',
    serviceUrl: 'https://youtube.com',
    price: 13.99,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: yearsAgo(2),
    endDate: daysFromNow(20),
    autoRenew: true,
    active: true,
    category: 'Entertainment',
    spentThisYear: 41.97,
    forecastThisYear: 167.88,
    totalSpent: 335.76,
    paymentMethod: 'Credit Card',
    // 12 months of history: months -11 through 0
    subscriptions: buildMonthlyPeriods(
      9000,
      9,
      'YouTube Premium',
      'https://youtube.com',
      13.99,
      'USD',
      -11,
      12,
      true,
      'Entertainment',
      'Credit Card',
      'https://www.youtube.com/paid_memberships',
    ),
  },
  {
    name: 'Figma',
    serviceUrl: 'https://figma.com',
    price: 15.0,
    period: 'MONTHLY',
    currency: 'USD',
    startDate: yearsAgo(3, 1),
    endDate: yearsAgo(2, 1),
    autoRenew: false,
    active: false,
    category: 'Design',
    spentThisYear: 0,
    forecastThisYear: 0,
    totalSpent: 180.0,
    paymentMethod: 'Credit Card',
    // 12 months ending ~25 months ago. months -36 through -25
    subscriptions: buildMonthlyPeriods(
      10000,
      10,
      'Figma',
      'https://figma.com',
      15.0,
      'USD',
      -36,
      12,
      false,
      'Design',
      'Credit Card',
      'https://www.figma.com/billing',
    ),
  },
]
