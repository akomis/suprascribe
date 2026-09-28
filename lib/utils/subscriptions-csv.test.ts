import { describe, expect, it } from 'vitest'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import {
  buildImportRows,
  defaultDateOrder,
  detectDateOrder,
  guessMapping,
  parseCsv,
  parseDate,
  parsePeriod,
  parsePrice,
  parseUrl,
  rowsFromDiscovered,
  rowsFromMerged,
  toCsv,
  type ImportOptions,
} from './subscriptions-csv'

const today = new Date(2026, 8, 28) // 2026-09-28
const options: ImportOptions = { defaultCurrency: 'USD', dateOrder: 'DMY', today }

function importText(text: string, opts: Partial<ImportOptions> = {}) {
  const csv = parseCsv(text)
  return buildImportRows(csv, guessMapping(csv.headers), { ...options, ...opts })
}

describe('parseCsv', () => {
  it('handles quoted delimiters, escaped quotes, newlines and a BOM', () => {
    const csv = parseCsv(
      '﻿Name,Price,Notes\r\n"Acme, Inc.",9.99,"said ""hi""\nsecond line"\r\nNetflix,15,\r\n',
    )
    expect(csv.headers).toEqual(['Name', 'Price', 'Notes'])
    expect(csv.rows).toEqual([
      ['Acme, Inc.', '9.99', 'said "hi"\nsecond line'],
      ['Netflix', '15', ''],
    ])
  })

  it('detects semicolons even when prices use a decimal comma', () => {
    const csv = parseCsv('Name;Price;Currency\nNetflix;9,99;EUR\nSpotify;10,99;EUR\n')
    expect(csv.delimiter).toBe(';')
    expect(csv.rows[0]).toEqual(['Netflix', '9,99', 'EUR'])
  })

  it('detects tabs and pads short rows', () => {
    const csv = parseCsv('Name\tPrice\tCycle\nNetflix\t9.99\n\n  \nSpotify\t10\tmonthly')
    expect(csv.delimiter).toBe('\t')
    expect(csv.rows).toEqual([
      ['Netflix', '9.99', ''],
      ['Spotify', '10', 'monthly'],
    ])
  })
})

describe('guessMapping', () => {
  it('maps common tracker headers', () => {
    const mapping = guessMapping([
      'Subscription',
      'Monthly Cost',
      'Billing Cycle',
      'Next Payment',
      'Cancel link',
      'Website',
      'Total spent',
    ])
    expect(mapping).toEqual({
      name: 0,
      price: 1,
      period: 2,
      nextDate: 3,
      cancelUrl: 4,
      url: 5,
    })
  })

  it('maps our own export headers', () => {
    const csv = parseCsv(toCsv([]))
    const mapping = guessMapping(csv.headers)
    expect(mapping).toMatchObject({
      name: 0,
      price: 1,
      currency: 2,
      period: 3,
      startDate: 4,
      nextDate: 5,
      autoRenew: 6,
      status: 7,
      category: 8,
      paymentMethod: 9,
      url: 10,
      cancelUrl: 11,
    })
  })
})

describe('parsePrice', () => {
  it.each([
    ['9.99', 9.99, undefined],
    ['$9.99', 9.99, 'USD'],
    ['9,99 €', 9.99, 'EUR'],
    ['€ 1.234,56', 1234.56, 'EUR'],
    ['1,234.56', 1234.56, undefined],
    ['1,200', 1200, undefined],
    ['1.200.000', 1200000, undefined],
    ["CHF 1'200.50", 1200.5, 'CHF'],
    ['A$12', 12, 'AUD'],
    ['USD 15', 15, 'USD'],
    ['£0', 0, 'GBP'],
    ['free', 0, undefined],
  ])('reads %s', (raw, amount, currency) => {
    expect(parsePrice(raw)).toEqual({ value: { amount, currency } })
  })

  it.each(['', 'abc', '-5', '(9.99)', '1.2.3,4,5'])('rejects %j', (raw) => {
    expect(parsePrice(raw)).toHaveProperty('error')
  })
})

describe('parsePeriod', () => {
  it.each([
    ['Monthly', 'MONTHLY'],
    ['per month', 'MONTHLY'],
    ['/mo', 'MONTHLY'],
    ['every 3 months', 'QUARTERLY'],
    ['Annually', 'YEARLY'],
    ['12 months', 'YEARLY'],
    ['weekly', 'WEEKLY'],
    ['Lifetime', 'ONE_TIME'],
    ['One-time', 'ONE_TIME'],
  ])('reads %s', (raw, period) => {
    expect(parsePeriod(raw)).toEqual({ value: period })
  })

  it.each(['bi-weekly', 'every 6 months', 'daily'])('rejects %s', (raw) => {
    expect(parsePeriod(raw)).toHaveProperty('error')
  })
})

describe('dates', () => {
  it('detects order from any unambiguous cell', () => {
    expect(detectDateOrder(['01/02/2026', '25/03/2026'])).toBe('DMY')
    expect(detectDateOrder(['01/02/2026', '03/25/2026'])).toBe('MDY')
    expect(detectDateOrder(['01/02/2026', '2026-03-25'])).toBeUndefined()
  })

  it('defaults the order from the locale', () => {
    expect(defaultDateOrder('en-US')).toBe('MDY')
    expect(defaultDateOrder('en-GB')).toBe('DMY')
    expect(defaultDateOrder('de-DE')).toBe('DMY')
  })

  it.each([
    ['2026-03-05', 'DMY', '2026-03-05'],
    ['2026/3/5', 'DMY', '2026-03-05'],
    ['2026-03-05T10:00:00Z', 'DMY', '2026-03-05'],
    ['05/03/2026', 'DMY', '2026-03-05'],
    ['05/03/2026', 'MDY', '2026-05-03'],
    ['5.3.26', 'DMY', '2026-03-05'],
    ['Mar 5, 2026', 'DMY', '2026-03-05'],
    ['5 March 2026', 'MDY', '2026-03-05'],
    ['05-Mar-26', 'DMY', '2026-03-05'],
    ['Thu, 5th Mar 2026 10:30', 'DMY', '2026-03-05'],
    ['46086', 'DMY', '2026-03-05'],
  ] as const)('reads %s as %s', (raw, order, expected) => {
    expect(parseDate(raw, order)).toEqual({ value: expected })
  })

  it('rejects impossible dates', () => {
    expect(parseDate('31/02/2026', 'DMY')).toHaveProperty('error')
    expect(parseDate('soon', 'DMY')).toHaveProperty('error')
    expect(parseDate('', 'DMY')).toBeUndefined()
  })
})

describe('parseUrl', () => {
  it('keeps http(s) and bare domains only', () => {
    expect(parseUrl('netflix.com')).toBe('https://netflix.com')
    expect(parseUrl('https://x.com/cancel')).toBe('https://x.com/cancel')
    expect(parseUrl('javascript:alert(1)')).toBeUndefined()
    expect(parseUrl('not a url')).toBeUndefined()
  })
})

describe('buildImportRows', () => {
  it('derives the start from the next billing date', () => {
    const [row] = importText('Name,Price,Cycle,Next payment\nNetflix,15.49,monthly,15/10/2026')
    expect(row.errors).toEqual([])
    expect(row.data).toMatchObject({
      serviceName: 'Netflix',
      price: 15.49,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: '2026-09-15',
      endDate: '2026-10-15',
      autoRenew: true,
    })
  })

  it('rolls a start-only renewing row forward to the next billing date', () => {
    const [row] = importText('Name,Price,Period,Start\nSpotify,10,yearly,2024-01-10')
    expect(row.data).toMatchObject({ startDate: '2024-01-10', endDate: '2027-01-10' })
  })

  it('treats a cancelled status as not renewing', () => {
    const [row] = importText('Name,Price,Period,Start,Status\nHulu,8,monthly,2026-01-10,Cancelled')
    expect(row.data).toMatchObject({ autoRenew: false, endDate: '2026-02-10' })
  })

  it('stores a one-time payment without a period', () => {
    const [row] = importText('Name,Price,Period,Date\nApp,30,Lifetime,2026-05-01')
    expect(row.data).toMatchObject({
      startDate: '2026-05-01',
      endDate: '2026-05-01',
      autoRenew: false,
    })
    expect(row.data).not.toHaveProperty('period')
  })

  it('takes period and currency from the header', () => {
    const [row] = importText('Service,Monthly cost (EUR)\nDisney+,8.99')
    expect(row.data).toMatchObject({ period: 'MONTHLY', currency: 'EUR' })
    expect(row.warnings).toContain('No dates, starting today')
  })

  it('reports errors per row and flags in-file duplicates', () => {
    const rows = importText(
      'Name,Price,Period,Start,Next\n,5,monthly,,\nA,x,monthly,,\nB,5,fortnightly,,\nC,5,monthly,2026-01-01,2026-02-01\nc,5,monthly,2026-01-01,2026-02-01',
    )
    expect(rows.map((r) => r.errors)).toEqual([
      ['Name is missing'],
      ['"x" is not a price'],
      ['Unsupported billing period "fortnightly"'],
      [],
      ['Same as row 4'],
    ])
    expect(rows.map((r) => Boolean(r.data))).toEqual([false, false, false, true, false])
  })
})

describe('export', () => {
  const merged: MergedSubscriptionResponse[] = [
    {
      name: '=HYPERLINK("http://evil")',
      serviceUrl: 'https://evil.example',
      price: 9.99,
      period: 'MONTHLY',
      currency: 'EUR',
      startDate: '2025-01-15',
      endDate: '2026-10-15',
      autoRenew: true,
      active: true,
      category: 'Software',
      paymentMethod: 'Visa, 4242',
      subscriptions: [],
      spentThisYear: 0,
      forecastThisYear: 0,
      totalSpent: 209.79,
    },
    {
      name: 'Old "Thing"',
      price: 100,
      period: 'YEARLY',
      currency: 'USD',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      autoRenew: false,
      active: false,
      subscriptions: [],
      spentThisYear: 0,
      forecastThisYear: 0,
      totalSpent: 100,
    },
  ]

  it('writes one quoted row per service with a BOM and escaped formulas', () => {
    const csv = toCsv(rowsFromMerged(merged))
    expect(csv.startsWith('﻿"Name","Price"')).toBe(true)
    const lines = csv.split('\r\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toContain(`"'=HYPERLINK(""http://evil"")"`)
    expect(lines[1]).toContain('"Visa, 4242"')
    expect(lines[2]).toContain('"Old ""Thing"""')
  })

  it('round-trips through import', () => {
    const rows = importText(toCsv(rowsFromMerged(merged)))
    expect(rows.map((r) => r.errors)).toEqual([[], []])
    expect(rows[0].data).toEqual({
      serviceName: '=HYPERLINK("http://evil")',
      price: 9.99,
      currency: 'EUR',
      period: 'MONTHLY',
      startDate: '2025-01-15',
      endDate: '2026-10-15',
      autoRenew: true,
      serviceUrl: 'https://evil.example',
      serviceCategory: 'Software',
      paymentMethod: 'Visa, 4242',
    })
    expect(rows[1].data).toMatchObject({
      serviceName: 'Old "Thing"',
      period: 'YEARLY',
      startDate: '2023-01-01',
      endDate: '2024-01-01',
      autoRenew: false,
    })
  })

  it('groups discovered charges into one row per service', () => {
    const charge = (start: string, end: string, price: number): DiscoveredSubscription => ({
      service_name: 'Netflix',
      price,
      currency: 'USD',
      period: 'MONTHLY',
      start_date: start,
      end_date: end,
    })
    const rows = rowsFromDiscovered([
      charge('2026-07-01', '2026-08-01', 15),
      charge('2026-08-01', '2026-09-01', 15),
      charge('2026-09-01', '2026-10-01', 17),
    ])
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      price: 17,
      startDate: '2026-07-01',
      nextBillingDate: '2026-10-01',
      totalSpent: 47,
    })
  })
})
