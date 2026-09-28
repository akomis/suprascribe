import Papa from 'papaparse'
import { addMonths, addWeeks, addYears } from 'date-fns'
import { Constants } from '@/lib/database.types'
import type {
  BillingPeriod,
  CreateSubscriptionFormData,
  DiscoveredSubscription,
} from '@/lib/types/forms'
import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import type { CurrencyCode } from '@/lib/utils/currency'
import { toDateString } from '@/lib/utils/date'
import { isSubscriptionActive } from '@/lib/utils'

// Import and export of subscriptions as CSV. Pure and free of server-only
// imports: the dashboard dialog, the API routes and the one-time scan page all
// use it, and the one-time scan must build its file in the browser because its
// results never reach the server.

type Category = CreateSubscriptionFormData['serviceCategory'] & string

const CURRENCY_CODES = new Set<string>(Constants.public.Enums.CURRENCY_CODE)
const CATEGORIES = Constants.public.Enums.SUBSCRIPTION_CATEGORY

export const MAX_IMPORT_ROWS = 2000
export const IMPORT_BATCH_SIZE = 100

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const EXPORT_HEADERS = [
  'Name',
  'Price',
  'Currency',
  'Billing Period',
  'Start Date',
  'Next Billing Date',
  'Auto Renew',
  'Status',
  'Category',
  'Payment Method',
  'Website',
  'Cancel URL',
  'Total Spent',
] as const

export interface ExportRow {
  name: string
  price: number
  currency: string
  /** Undefined marks a one-time payment. */
  period?: BillingPeriod
  startDate: string
  nextBillingDate: string
  autoRenew: boolean
  active: boolean
  category?: string | null
  paymentMethod?: string | null
  website?: string | null
  cancelUrl?: string | null
  totalSpent: number
}

const PERIOD_LABEL: Record<BillingPeriod, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
}

const ONE_TIME_LABEL = 'One-time'

function formatAmount(value: number): string {
  return String(Math.round(value * 100) / 100)
}

export function toCsv(rows: ExportRow[]): string {
  const data = rows.map((row) => [
    row.name,
    formatAmount(row.price),
    row.currency,
    row.period ? PERIOD_LABEL[row.period] : ONE_TIME_LABEL,
    row.startDate.slice(0, 10),
    row.nextBillingDate.slice(0, 10),
    row.autoRenew ? 'Yes' : 'No',
    row.active ? 'Active' : 'Past',
    row.category ?? '',
    row.paymentMethod ?? '',
    row.website ?? '',
    row.cancelUrl ?? '',
    formatAmount(row.totalSpent),
  ])

  // The BOM is what makes Excel read the file as UTF-8 rather than mangling
  // "€" and non-Latin service names. escapeFormulae stops a service name such
  // as "=HYPERLINK(...)" from running as a formula when the file is opened.
  return (
    '﻿' +
    Papa.unparse(
      { fields: [...EXPORT_HEADERS], data },
      { quotes: true, escapeFormulae: true, newline: '\r\n' },
    )
  )
}

export function rowsFromMerged(subscriptions: MergedSubscriptionResponse[]): ExportRow[] {
  return subscriptions
    .map((sub) => {
      // A one-time payment is stored as a single row that ends the day it starts.
      const oneTime = sub.subscriptions.length === 1 && sub.startDate === sub.endDate
      return {
        name: sub.name,
        price: sub.price,
        currency: sub.currency,
        period: oneTime ? undefined : (sub.period as BillingPeriod),
        startDate: sub.startDate,
        nextBillingDate: sub.endDate,
        autoRenew: sub.autoRenew,
        active: sub.active,
        category: sub.category,
        paymentMethod: sub.paymentMethod,
        website: sub.serviceUrl,
        cancelUrl: sub.subscriptions.find((s) => s.subscription_service?.unsubscribe_url)
          ?.subscription_service.unsubscribe_url,
        totalSpent: sub.totalSpent,
      }
    })
    .sort(compareRows)
}

export type DiscoveredServiceGroup = {
  serviceName: string
  serviceUrl?: string
  unsubscribeUrl?: string
  latest: DiscoveredSubscription
  entries: DiscoveredSubscription[]
  active: boolean
}

/** One group per service, active first, then alphabetical. */
export function groupDiscoveredByService(subs: DiscoveredSubscription[]): DiscoveredServiceGroup[] {
  const map = new Map<string, DiscoveredSubscription[]>()
  for (const sub of subs) {
    if (!map.has(sub.service_name)) map.set(sub.service_name, [])
    map.get(sub.service_name)!.push(sub)
  }

  const groups = Array.from(map.entries()).map(([serviceName, entries]) => {
    const latest = [...entries].sort(
      (a, b) => new Date(b.end_date).getTime() - new Date(a.end_date).getTime(),
    )[0]
    return {
      serviceName,
      serviceUrl: entries.find((s) => s.service_url)?.service_url,
      unsubscribeUrl: entries.find((s) => s.unsubscribe_url)?.unsubscribe_url,
      latest,
      entries,
      active: isSubscriptionActive(latest.start_date, latest.end_date),
    }
  })

  return groups.sort((a, b) => {
    if (a.active !== b.active) return a.active ? -1 : 1
    return a.serviceName.localeCompare(b.serviceName)
  })
}

export function rowsFromDiscovered(
  subs: DiscoveredSubscription[],
  fallbackCurrency: string = 'EUR',
): ExportRow[] {
  return groupDiscoveredByService(subs).map((group) => {
    const { latest, entries } = group
    const startDate = entries.map((e) => e.start_date).sort()[0]
    return {
      name: group.serviceName,
      price: latest.price,
      currency: latest.currency ?? fallbackCurrency,
      period: latest.period,
      startDate,
      nextBillingDate: latest.end_date,
      autoRenew: latest.auto_renew ?? group.active,
      active: group.active,
      category: entries.find((e) => e.category)?.category,
      paymentMethod: latest.payment_method,
      website: group.serviceUrl,
      cancelUrl: group.unsubscribeUrl,
      totalSpent: entries.reduce((sum, e) => sum + (e.price || 0), 0),
    }
  })
}

function compareRows(a: ExportRow, b: ExportRow): number {
  if (a.active !== b.active) return a.active ? -1 : 1
  return a.name.localeCompare(b.name)
}

export function exportFilename(prefix: string, today: Date = new Date()): string {
  return `${prefix}-${toDateString(today)}.csv`
}

/** Browser only: hands the text to the user as a file download. */
export function downloadCsv(filename: string, text: string): void {
  if (typeof window === 'undefined') return
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function templateCsv(): string {
  const today = new Date()
  return toCsv([
    {
      name: 'Netflix',
      price: 15.49,
      currency: 'USD',
      period: 'MONTHLY',
      startDate: toDateString(addYears(today, -1)),
      nextBillingDate: toDateString(addMonths(today, 1)),
      autoRenew: true,
      active: true,
      category: 'Entertainment',
      paymentMethod: 'Visa •••• 4242',
      website: 'https://netflix.com',
      cancelUrl: '',
      totalSpent: 0,
    },
  ])
}

// ---------------------------------------------------------------------------
// Import: reading the file
// ---------------------------------------------------------------------------

export interface ParsedCsv {
  headers: string[]
  rows: string[][]
  delimiter: string
  errors: string[]
}

const CANDIDATE_DELIMITERS = [',', ';', '\t', '|']

/**
 * Picks the delimiter from the header line alone.
 *
 * Papa's own guess compares field counts across rows, which a European file
 * can fool: in "Netflix;9,99;EUR" every row splits evenly on the comma too.
 * Header names almost never contain a delimiter, so counting them there is the
 * sturdier signal. Returns undefined to fall back to Papa's guess.
 */
export function detectDelimiter(text: string): string | undefined {
  const counts = new Map<string, number>(CANDIDATE_DELIMITERS.map((d) => [d, 0]))
  let inQuotes = false
  for (const char of text) {
    if (char === '"') inQuotes = !inQuotes
    else if (!inQuotes && (char === '\n' || char === '\r')) break
    else if (!inQuotes && counts.has(char)) counts.set(char, counts.get(char)! + 1)
  }
  let best: string | undefined
  let bestCount = 0
  for (const [delimiter, count] of counts) {
    if (count > bestCount) {
      best = delimiter
      bestCount = count
    }
  }
  return best
}

export function parseCsv(input: string): ParsedCsv {
  const text = input.replace(/^﻿/, '')
  const delimiter = detectDelimiter(text)
  const result = Papa.parse<string[]>(text, {
    delimiter: delimiter ?? '',
    skipEmptyLines: 'greedy',
  })

  const errors = result.errors
    // Rows of uneven length are normal in hand-made sheets; they are padded below.
    .filter((e) => e.type !== 'FieldMismatch' && e.code !== 'UndetectableDelimiter')
    .map((e) => (e.row !== undefined ? `Row ${e.row + 1}: ${e.message}` : e.message))

  const [headerRow = [], ...body] = result.data
  const width = Math.max(headerRow.length, ...body.map((r) => r.length))
  const headers = Array.from({ length: width }, (_, i) => {
    const header = (headerRow[i] ?? '').trim()
    return header || `Column ${i + 1}`
  })
  const rows = body.map((row) => Array.from({ length: width }, (_, i) => (row[i] ?? '').trim()))

  return { headers, rows, delimiter: result.meta.delimiter, errors }
}

// ---------------------------------------------------------------------------
// Import: mapping columns to fields
// ---------------------------------------------------------------------------

export const IMPORT_FIELDS = [
  'name',
  'price',
  'currency',
  'period',
  'startDate',
  'nextDate',
  'autoRenew',
  'status',
  'category',
  'paymentMethod',
  'url',
  'cancelUrl',
] as const

export type ImportField = (typeof IMPORT_FIELDS)[number]

export const IMPORT_FIELD_LABELS: Record<ImportField, string> = {
  name: 'Name',
  price: 'Price',
  currency: 'Currency',
  period: 'Billing period',
  startDate: 'Start date',
  nextDate: 'Next billing date',
  autoRenew: 'Auto renew',
  status: 'Status',
  category: 'Category',
  paymentMethod: 'Payment method',
  url: 'Website',
  cancelUrl: 'Cancel URL',
}

export const REQUIRED_FIELDS: ImportField[] = ['name', 'price']

/** Column index per field. */
export type ColumnMapping = Partial<Record<ImportField, number>>

// Order matters for the loose pass: the more specific field claims a column first,
// so "Cancel URL" goes to cancelUrl before url can take it.
const FIELD_ALIASES: [ImportField, string[]][] = [
  [
    'cancelUrl',
    [
      'cancel url',
      'cancel link',
      'cancellation url',
      'cancellation link',
      'unsubscribe url',
      'unsubscribe link',
      'manage url',
      'manage link',
      'cancel',
    ],
  ],
  [
    'nextDate',
    [
      'next billing date',
      'next billing',
      'next payment date',
      'next payment',
      'next charge date',
      'next charge',
      'next due date',
      'next bill date',
      'next bill',
      'next renewal date',
      'next renewal',
      'next date',
      'renewal date',
      'renews on',
      'renews',
      'renewal',
      'due date',
      'due',
      'end date',
      'ends',
      'end',
      'expires on',
      'expires',
      'expiry date',
      'expiry',
      'expiration date',
      'expiration',
      'billing date',
      'payment date',
    ],
  ],
  [
    'startDate',
    [
      'start date',
      'start',
      'started on',
      'started',
      'date started',
      'subscribed on',
      'subscribed',
      'subscription date',
      'first payment date',
      'first payment',
      'first bill',
      'first charge',
      'signup date',
      'sign up date',
      'since',
      'date added',
      'created',
      'created at',
      'joined',
      'date',
    ],
  ],
  [
    'autoRenew',
    [
      'auto renew',
      'auto renewal',
      'auto renews',
      'autorenew',
      'renews automatically',
      'recurring',
      'auto pay',
      'autopay',
    ],
  ],
  [
    'period',
    [
      'billing period',
      'billing cycle',
      'billing frequency',
      'billing interval',
      'payment frequency',
      'payment cycle',
      'renewal period',
      'cycle',
      'frequency',
      'interval',
      'period',
      'recurrence',
      'repeat',
      'repeats',
      'every',
      'billed',
      'term',
    ],
  ],
  ['currency', ['currency', 'currency code', 'ccy', 'cur']],
  [
    'price',
    [
      'price',
      'cost',
      'amount',
      'fee',
      'charge',
      'monthly cost',
      'monthly price',
      'monthly fee',
      'yearly cost',
      'yearly price',
      'annual cost',
      'annual price',
      'billing amount',
      'recurring amount',
      'price per period',
      'subscription cost',
      'subscription price',
      'value',
    ],
  ],
  [
    'name',
    [
      'name',
      'service',
      'service name',
      'subscription',
      'subscription name',
      'app',
      'app name',
      'merchant',
      'title',
      'vendor',
      'provider',
      'company',
      'description',
      'item',
      'product',
      'payee',
      'platform',
    ],
  ],
  ['status', ['status', 'state', 'active']],
  ['category', ['category', 'type', 'genre', 'group', 'tag', 'tags', 'label']],
  [
    'paymentMethod',
    [
      'payment method',
      'payment',
      'paid with',
      'pay with',
      'card',
      'account',
      'method',
      'payment source',
      'source',
    ],
  ],
  ['url', ['website', 'url', 'link', 'homepage', 'site', 'web', 'domain']],
]

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .replace(/\(.*?\)|\[.*?\]/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Best-guess column for each field from the header names.
 *
 * Two passes: exact alias matches first, so "Price" beats "Total price" for the
 * price field, then whole-word containment on the columns still free. A column
 * is only ever given to one field.
 */
export function guessMapping(headers: string[]): ColumnMapping {
  const normalized = headers.map(normalizeHeader)
  const mapping: ColumnMapping = {}
  const taken = new Set<number>()

  for (const [field, aliases] of FIELD_ALIASES) {
    const index = normalized.findIndex((h, i) => !taken.has(i) && aliases.includes(h))
    if (index >= 0) {
      mapping[field] = index
      taken.add(index)
    }
  }

  for (const [field, aliases] of FIELD_ALIASES) {
    if (mapping[field] !== undefined) continue
    const index = normalized.findIndex(
      (h, i) =>
        !taken.has(i) &&
        !/\b(total|spent|sum)\b/.test(h) &&
        aliases.some((alias) => alias.length >= 3 && ` ${h} `.includes(` ${alias} `)),
    )
    if (index >= 0) {
      mapping[field] = index
      taken.add(index)
    }
  }

  return mapping
}

/**
 * Hints carried by a header rather than the cells under it: a "Monthly cost"
 * column says the period, an "Amount (USD)" column says the currency.
 */
export function headerHints(header: string | undefined): {
  period?: BillingPeriod
  currency?: CurrencyCode
} {
  if (!header) return {}
  const lower = header.toLowerCase()
  const period = /\bweekly\b/.test(lower)
    ? 'WEEKLY'
    : /\bmonthly\b/.test(lower)
      ? 'MONTHLY'
      : /\bquarterly\b/.test(lower)
        ? 'QUARTERLY'
        : /\b(yearly|annual|annually)\b/.test(lower)
          ? 'YEARLY'
          : undefined
  // Case-sensitive on purpose: "Price (all plans)" must not read as Albanian lek.
  const code = header.match(/\b[A-Z]{3}\b/g)?.find((c) => CURRENCY_CODES.has(c))
  const currency = (code ?? detectCurrencySymbol(header)) as CurrencyCode | undefined
  return { period, currency }
}

// ---------------------------------------------------------------------------
// Import: parsing values
// ---------------------------------------------------------------------------

type Parsed<T> = { value: T } | { error: string }

// Longest symbols first so "A$" is not read as "$".
const CURRENCY_SYMBOLS: [string, CurrencyCode][] = [
  ['US$', 'USD'],
  ['CA$', 'CAD'],
  ['AU$', 'AUD'],
  ['NZ$', 'NZD'],
  ['HK$', 'HKD'],
  ['R$', 'BRL'],
  ['A$', 'AUD'],
  ['C$', 'CAD'],
  ['zł', 'PLN'],
  ['€', 'EUR'],
  ['£', 'GBP'],
  ['¥', 'JPY'],
  ['₹', 'INR'],
  ['₩', 'KRW'],
  ['₽', 'RUB'],
  ['₺', 'TRY'],
  ['₪', 'ILS'],
  ['₱', 'PHP'],
  ['₫', 'VND'],
  ['฿', 'THB'],
  ['$', 'USD'],
]

function detectCurrencySymbol(text: string): CurrencyCode | undefined {
  return CURRENCY_SYMBOLS.find(([symbol]) => text.includes(symbol))?.[1]
}

export function parseCurrency(raw: string): CurrencyCode | undefined {
  const text = raw.trim()
  if (!text) return undefined
  const code = text
    .toUpperCase()
    .match(/\b[A-Z]{3}\b/g)
    ?.find((c) => CURRENCY_CODES.has(c))
  return (code as CurrencyCode | undefined) ?? detectCurrencySymbol(text)
}

/**
 * Reads a price written the way any spreadsheet might write it: "$9.99",
 * "9,99 €", "1.234,56", "1,234.56", "CHF 1'200.00", "USD 15".
 *
 * Separators: with both present the later one is the decimal point. A lone
 * comma is decimal when one or two digits follow it (9,99) and a thousands
 * separator otherwise (1,200). Repeated dots are thousands separators.
 */
export function parsePrice(raw: string): Parsed<{ amount: number; currency?: CurrencyCode }> {
  const text = raw.trim()
  if (!text) return { error: 'Price is missing' }
  if (/^free$/i.test(text)) return { value: { amount: 0 } }

  const currency = parseCurrency(text)
  if (/^\(.*\)$/.test(text) || /-\s*[\d.,]/.test(text)) {
    return { error: `Negative price "${text}" is not supported` }
  }

  let number = text.replace(/[^\d.,]/g, '')
  if (!/\d/.test(number)) return { error: `"${text}" is not a price` }

  const lastComma = number.lastIndexOf(',')
  const lastDot = number.lastIndexOf('.')
  if (lastComma >= 0 && lastDot >= 0) {
    const decimal = lastComma > lastDot ? ',' : '.'
    const thousands = decimal === ',' ? '.' : ','
    number = number.split(thousands).join('').replace(decimal, '.')
  } else if (lastComma >= 0) {
    const commas = number.split(',').length - 1
    const decimals = number.length - lastComma - 1
    number =
      commas === 1 && decimals > 0 && decimals <= 2
        ? number.replace(',', '.')
        : number.split(',').join('')
  } else if (number.split('.').length > 2) {
    number = number.split('.').join('')
  }

  if (!/^\d+(\.\d+)?$/.test(number)) return { error: `"${text}" is not a price` }
  const amount = Math.round(Number(number) * 100) / 100
  if (!Number.isFinite(amount)) return { error: `"${text}" is not a price` }

  return { value: { amount, currency } }
}

const PERIOD_WORDS: [BillingPeriod | 'ONE_TIME', string[]][] = [
  ['WEEKLY', ['weekly', 'week', 'wk', 'w', '1 week', '1w', '7 days', '7d', 'wöchentlich']],
  [
    'MONTHLY',
    [
      'monthly',
      'month',
      'mo',
      'mon',
      'mth',
      'm',
      '1 month',
      '1 mo',
      '1m',
      'monthly subscription',
      'mensual',
      'mensuel',
      'monatlich',
      'mensile',
      'maandelijks',
    ],
  ],
  [
    'QUARTERLY',
    [
      'quarterly',
      'quarter',
      'qtr',
      'q',
      '3 months',
      '3 month',
      '3 mo',
      '3m',
      'trimestral',
      'trimestriel',
      'vierteljährlich',
    ],
  ],
  [
    'YEARLY',
    [
      'yearly',
      'annual',
      'annually',
      'year',
      'yr',
      'y',
      'pa',
      '1 year',
      '1 yr',
      '1y',
      '12 months',
      '12 month',
      '12 mo',
      '12m',
      'anual',
      'annuel',
      'jährlich',
      'annuale',
      'jaarlijks',
    ],
  ],
  [
    'ONE_TIME',
    [
      'one time',
      'onetime',
      'once',
      'lifetime',
      'single',
      'one off',
      'oneoff',
      'single payment',
      'one time payment',
    ],
  ],
]

export function parsePeriod(raw: string): Parsed<BillingPeriod | 'ONE_TIME'> {
  const words = raw
    .toLowerCase()
    .replace(/[^\p{L}\d]+/gu, ' ')
    .replace(/^(every|per|billed|each|pay|paid)\s+/, '')
    .trim()
  for (const [period, aliases] of PERIOD_WORDS) {
    if (aliases.includes(words)) return { value: period }
  }
  return { error: `Unsupported billing period "${raw.trim()}"` }
}

export type DateOrder = 'DMY' | 'MDY'

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
}

const ISO_DATE = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[T\s].*)?$/
const NUMERIC_DATE = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4}|\d{2})(?:[T\s,].*)?$/

function expandYear(year: number): number {
  if (year >= 100) return year
  return year < 70 ? 2000 + year : 1900 + year
}

function makeDate(year: number, month: number, day: number): string | undefined {
  if (year < 1970 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return undefined
  const date = new Date(year, month - 1, day)
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return undefined
  return toDateString(date)
}

/**
 * Which order a file writes its numeric dates in, judged from every date cell
 * together: one "25/03/2026" settles DD/MM for the whole file. Returns
 * undefined when nothing tells them apart (or the cells contradict each
 * other), and the dialog asks.
 */
export function detectDateOrder(values: string[]): DateOrder | undefined {
  let dmy = false
  let mdy = false
  for (const value of values) {
    const match = value.trim().match(NUMERIC_DATE)
    if (!match) continue
    const first = Number(match[1])
    const second = Number(match[2])
    if (first > 12 && second <= 12) dmy = true
    if (second > 12 && first <= 12) mdy = true
  }
  if (dmy === mdy) return undefined
  return dmy ? 'DMY' : 'MDY'
}

export function defaultDateOrder(locale: string | undefined): DateOrder {
  return /^en-(US|PH)|^fil/i.test(locale ?? '') ? 'MDY' : 'DMY'
}

/** Whether any numeric date cell could be read both ways. */
export function hasAmbiguousDates(values: string[]): boolean {
  return values.some((value) => {
    const match = value.trim().match(NUMERIC_DATE)
    if (!match) return false
    const [first, second] = [Number(match[1]), Number(match[2])]
    return first <= 12 && second <= 12 && first !== second
  })
}

export function parseDate(raw: string, order: DateOrder): Parsed<string> | undefined {
  const text = raw.trim()
  if (!text) return undefined

  const iso = text.match(ISO_DATE)
  if (iso) {
    const date = makeDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
    return date ? { value: date } : { error: `"${text}" is not a valid date` }
  }

  const numeric = text.match(NUMERIC_DATE)
  if (numeric) {
    const [a, b] = [Number(numeric[1]), Number(numeric[2])]
    const year = expandYear(Number(numeric[3]))
    const date = order === 'DMY' ? makeDate(year, b, a) : makeDate(year, a, b)
    return date ? { value: date } : { error: `"${text}" is not a valid date` }
  }

  // Excel and Google Sheets hand out a date cell as a day count from 1899-12-30
  // when it is exported without its number format.
  if (/^\d{5}(\.\d+)?$/.test(text)) {
    const serial = Math.floor(Number(text))
    if (serial > 25569 && serial < 73051) {
      const utc = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000)
      const date = makeDate(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate())
      if (date) return { value: date }
    }
  }

  // "Jan 5, 2026", "5 January 2026", "05-Jan-26", "Mon, 5 Jan 2026 10:00"
  const tokens = text
    .toLowerCase()
    .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?/g, ' ')
    .split(/[\s,\-/.]+/)
    .filter(Boolean)
  const monthToken = tokens.find(
    (t) => /^[a-z]+$/.test(t) && MONTHS[t.slice(0, t.startsWith('sept') ? 4 : 3)],
  )
  if (monthToken) {
    const month = MONTHS[monthToken.slice(0, monthToken.startsWith('sept') ? 4 : 3)]
    const numbers = tokens
      .map((t) => t.replace(/(st|nd|rd|th)$/, ''))
      .filter((t) => /^\d+$/.test(t))
    if (numbers.length === 2) {
      const yearIndex = numbers.findIndex((n) => n.length === 4)
      const [dayText, yearText] =
        yearIndex === 0 ? [numbers[1], numbers[0]] : [numbers[0], numbers[1]]
      const date = makeDate(expandYear(Number(yearText)), month, Number(dayText))
      if (date) return { value: date }
    }
  }

  return { error: `"${text}" is not a recognised date` }
}

const TRUE_WORDS = [
  'yes',
  'y',
  'true',
  't',
  '1',
  'on',
  'active',
  'enabled',
  'auto',
  'automatic',
  'x',
  '✓',
  '✔',
  'recurring',
  'ja',
  'oui',
  'si',
  'sí',
]
const FALSE_WORDS = [
  'no',
  'n',
  'false',
  'f',
  '0',
  'off',
  'inactive',
  'disabled',
  'manual',
  'cancelled',
  'canceled',
  'nein',
  'non',
]

export function parseBool(raw: string): boolean | undefined {
  const text = raw.trim().toLowerCase()
  if (TRUE_WORDS.includes(text)) return true
  if (FALSE_WORDS.includes(text)) return false
  return undefined
}

const INACTIVE_STATUS =
  /\b(cancel+ed|inactive|ended|expired|paused|stopped|terminated|past|churned|closed|suspended|archived|disabled|no)\b/
const ACTIVE_STATUS = /\b(active|yes|running|ongoing|current|trial|trialing|live|enabled|paying)\b/

export function parseStatus(raw: string): boolean | undefined {
  const text = raw.trim().toLowerCase()
  if (!text) return undefined
  if (INACTIVE_STATUS.test(text)) return false
  if (ACTIVE_STATUS.test(text)) return true
  return undefined
}

export function parseCategory(raw: string): Category | undefined {
  const text = raw.trim().toLowerCase()
  if (!text) return undefined
  return CATEGORIES.find((c) => c.toLowerCase() === text) as Category | undefined
}

/** http(s) only - a "javascript:" cancel link would otherwise become a clickable button. */
export function parseUrl(raw: string): string | undefined {
  const text = stripFormulaGuard(raw.trim())
  if (!text || /\s/.test(text)) return undefined
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`
  try {
    const url = new URL(withScheme)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return undefined
    if (!url.hostname.includes('.')) return undefined
    return withScheme
  } catch {
    return undefined
  }
}

// Undoes the "'" our own export (and many other tools) put in front of a cell
// that would otherwise run as a formula, so an export re-imports unchanged.
function stripFormulaGuard(text: string): string {
  return /^'[=+\-@\t\r]/.test(text) ? text.slice(1) : text
}

function cleanText(raw: string, max: number): string {
  return stripFormulaGuard(raw.trim()).replace(/\s+/g, ' ').slice(0, max)
}

// ---------------------------------------------------------------------------
// Import: building rows
// ---------------------------------------------------------------------------

export interface ImportOptions {
  defaultCurrency: CurrencyCode
  dateOrder: DateOrder
  /** Injected so tests do not depend on the day they run. */
  today?: Date
}

/** What the import endpoint reports for each row it was sent. */
export type ImportRowResult = {
  index: number
  status: 'imported' | 'duplicate' | 'failed'
  error?: string
}

export interface ImportRow {
  /** 1-based data row number, not counting the header. */
  row: number
  data?: CreateSubscriptionFormData
  warnings: string[]
  errors: string[]
}

function stepPeriod(date: Date, period: BillingPeriod, steps: number): Date {
  switch (period) {
    case 'WEEKLY':
      return addWeeks(date, steps)
    case 'QUARTERLY':
      return addMonths(date, steps * 3)
    case 'YEARLY':
      return addYears(date, steps)
    default:
      return addMonths(date, steps)
  }
}

function fromDateString(value: string): Date {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// Moves a billing date forward whole periods until it is today or later. The
// start date stays put, so the row keeps covering the time already paid for.
function rollForward(date: string, period: BillingPeriod, today: string): string {
  let current = fromDateString(date)
  for (let i = 0; i < 1000 && toDateString(current) < today; i++) {
    current = stepPeriod(current, period, 1)
  }
  return toDateString(current)
}

export function buildImportRows(
  csv: Pick<ParsedCsv, 'headers' | 'rows'>,
  mapping: ColumnMapping,
  options: ImportOptions,
): ImportRow[] {
  const today = toDateString(options.today ?? new Date())
  const cell = (row: string[], field: ImportField) => {
    const index = mapping[field]
    return index === undefined ? '' : (row[index] ?? '')
  }
  const priceHints = headerHints(
    mapping.price !== undefined ? csv.headers[mapping.price] : undefined,
  )
  const seen = new Map<string, number>()

  return csv.rows.map((row, i) => {
    const result: ImportRow = { row: i + 1, warnings: [], errors: [] }
    const { warnings, errors } = result

    const name = cleanText(cell(row, 'name'), 200)
    if (!name) errors.push('Name is missing')

    const price = parsePrice(cell(row, 'price'))
    if ('error' in price) errors.push(price.error)

    const currency =
      parseCurrency(cell(row, 'currency')) ??
      ('value' in price ? price.value.currency : undefined) ??
      priceHints.currency ??
      options.defaultCurrency
    if (cell(row, 'currency').trim() && !parseCurrency(cell(row, 'currency'))) {
      warnings.push(`Unknown currency "${cell(row, 'currency').trim()}", using ${currency}`)
    }

    let period: BillingPeriod | 'ONE_TIME'
    const periodText = cell(row, 'period').trim()
    if (periodText) {
      const parsed = parsePeriod(periodText)
      if ('error' in parsed) {
        errors.push(parsed.error)
        period = 'MONTHLY'
      } else {
        period = parsed.value
      }
    } else if (priceHints.period) {
      period = priceHints.period
    } else {
      period = 'MONTHLY'
      warnings.push('No billing period, assumed monthly')
    }

    const statusActive = parseStatus(cell(row, 'status'))
    const autoRenewText = cell(row, 'autoRenew').trim()
    let autoRenew = parseBool(autoRenewText)
    if (autoRenewText && autoRenew === undefined) {
      warnings.push(`Could not read auto renew "${autoRenewText}"`)
    }
    if (statusActive === false) autoRenew = false
    autoRenew ??= statusActive ?? true

    const readDate = (field: 'startDate' | 'nextDate') => {
      const parsed = parseDate(cell(row, field), options.dateOrder)
      if (parsed && 'error' in parsed) {
        errors.push(parsed.error)
        return undefined
      }
      return parsed?.value
    }
    let startDate = readDate('startDate')
    let endDate = readDate('nextDate')

    if (period === 'ONE_TIME') {
      const date = startDate ?? endDate ?? today
      startDate = date
      endDate = date
      autoRenew = false
    } else if (!startDate && !endDate) {
      if (errors.length === 0) warnings.push('No dates, starting today')
      startDate = today
      endDate = toDateString(stepPeriod(fromDateString(today), period, 1))
    } else if (!startDate) {
      startDate = toDateString(stepPeriod(fromDateString(endDate!), period, -1))
    } else if (!endDate) {
      const firstRenewal = toDateString(stepPeriod(fromDateString(startDate), period, 1))
      endDate = autoRenew ? rollForward(firstRenewal, period, today) : firstRenewal
    } else if (autoRenew && endDate < today) {
      const rolled = rollForward(endDate, period, today)
      warnings.push(`Next billing date ${endDate} has passed, moved to ${rolled}`)
      endDate = rolled
    }

    if (startDate && endDate && startDate > endDate) {
      errors.push(`Start date ${startDate} is after the next billing date ${endDate}`)
    }

    const categoryText = cell(row, 'category').trim()
    const category = parseCategory(categoryText)
    const urlText = cell(row, 'url').trim()
    const url = parseUrl(urlText)
    if (urlText && !url) warnings.push(`Ignored website "${urlText}"`)
    const cancelText = cell(row, 'cancelUrl').trim()
    const cancelUrl = parseUrl(cancelText)
    if (cancelText && !cancelUrl) warnings.push(`Ignored cancel URL "${cancelText}"`)
    const paymentMethod = cleanText(cell(row, 'paymentMethod'), 100)

    if (errors.length > 0 || !('value' in price)) return result

    const key = `${name.toLowerCase()}|${startDate}|${endDate}`
    const duplicateOf = seen.get(key)
    if (duplicateOf !== undefined) {
      errors.push(`Same as row ${duplicateOf}`)
      return result
    }
    seen.set(key, result.row)

    result.data = {
      serviceName: name,
      price: price.value.amount,
      currency,
      ...(period !== 'ONE_TIME' && { period }),
      startDate: startDate!,
      endDate: endDate!,
      autoRenew,
      ...(url && { serviceUrl: url }),
      ...(cancelUrl && { serviceUnsubscribeUrl: cancelUrl }),
      ...(category && { serviceCategory: category }),
      ...(paymentMethod && { paymentMethod }),
    }
    return result
  })
}
