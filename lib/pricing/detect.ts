import { DEFAULT_CURRENCY, type PricingCurrency } from '@/lib/config/pricing'

/**
 * IANA timezones of the EEA: the EU 27 plus Iceland, Liechtenstein and Norway.
 *
 * An explicit allowlist rather than a `Europe/` prefix test - Europe/London,
 * Europe/Zurich, Europe/Kyiv, Europe/Istanbul, Europe/Belgrade and Europe/Moscow
 * all share that prefix and none of them are in the EEA.
 *
 * Atlantic/* covers Iceland plus the Canaries, Madeira and the Azores. Zones for
 * the French overseas departments (Indian/Reunion, America/Martinique, ...) are
 * deliberately absent and fall through to USD.
 */
const EEA_TIME_ZONES = new Set([
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Berlin',
  'Europe/Bratislava',
  'Europe/Brussels',
  'Europe/Bucharest',
  'Europe/Budapest',
  'Europe/Busingen',
  'Europe/Copenhagen',
  'Europe/Dublin',
  'Europe/Helsinki',
  'Europe/Lisbon',
  'Europe/Ljubljana',
  'Europe/Luxembourg',
  'Europe/Madrid',
  'Europe/Malta',
  'Europe/Mariehamn',
  'Europe/Nicosia',
  'Europe/Oslo',
  'Europe/Paris',
  'Europe/Prague',
  'Europe/Riga',
  'Europe/Rome',
  'Europe/Sofia',
  'Europe/Stockholm',
  'Europe/Tallinn',
  'Europe/Vaduz',
  'Europe/Vienna',
  'Europe/Vilnius',
  'Europe/Warsaw',
  'Europe/Zagreb',
  'Asia/Famagusta',
  'Atlantic/Reykjavik',
  'Atlantic/Canary',
  'Atlantic/Madeira',
  'Atlantic/Azores',
])

/**
 * Sterling territories. Ireland is Europe/Dublin and so stays in the EEA set above,
 * which means there is no zone shared between the two groups to disambiguate.
 */
const GBP_TIME_ZONES = new Set([
  'Europe/London',
  'Europe/Belfast',
  'Europe/Isle_of_Man',
  'Europe/Guernsey',
  'Europe/Jersey',
  'Europe/Gibraltar',
])

/**
 * EEA timezones bill in euro and UK ones in sterling; everywhere else, and anything
 * unrecognised, bills in USD.
 */
export function currencyFromTimeZone(timeZone: string | undefined): PricingCurrency {
  if (!timeZone) return 'usd'
  if (GBP_TIME_ZONES.has(timeZone)) return 'gbp'
  if (EEA_TIME_ZONES.has(timeZone)) return 'eur'
  return 'usd'
}

/**
 * Best guess at the visitor's billing currency, from their browser timezone.
 *
 * Railway's edge exposes no country (X-Railway-Edge is a POP id, not a location)
 * and the landing page is prerendered and CDN-cached, so this is the only signal
 * available without changing the hosting setup. It is a guess: VPNs, travellers
 * and expats all land on the wrong side of it, which is why the visitor can
 * override it with the currency toggle.
 *
 * Falls back to DEFAULT_CURRENCY when Intl is unavailable so the caller keeps
 * rendering the same price the server did.
 */
export function detectCurrency(): PricingCurrency {
  try {
    return currencyFromTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  } catch {
    return DEFAULT_CURRENCY
  }
}
