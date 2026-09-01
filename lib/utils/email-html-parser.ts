import { convert } from 'html-to-text'

const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi

// Punctuation the URL pattern will happily swallow off the end of a sentence.
const TRAILING_PUNCTUATION = /[.,;:!?)\]]+$/

// Campaign and click-tracking parameters. They carry no billing information and
// are often longer than the URL they hang off, so they are pure token cost.
const TRACKING_PARAM_PREFIXES = ['utm_', 'mc_', 'hsa_', 'pk_', 'vero_', '_hs', 'oly_', 'trk_']
const TRACKING_PARAM_NAMES = new Set([
  'gclid',
  'fbclid',
  'msclkid',
  'igshid',
  'mkt_tok',
  'ck_subscriber_id',
  'sc_campaign',
  'sc_channel',
])

// Past this a link is a tracking redirect rather than something a person could
// read, so only its origin and path are worth keeping.
const MAX_URL_LENGTH = 200

const INVISIBLE_CHARS_REGEX = new RegExp(
  [
    '\u200B',
    '\u200C',
    '\u200D',
    '\u200E',
    '\u200F',
    '\u034F',
    '\u061C',
    '\u00AD',
    '\uFEFF',
    '\u2060',
    '\u2061',
    '\u2062',
    '\u2063',
    '\u2064',
    '\u034F',
    '\u17B4',
    '\u17B5',
    '\u115F',
    '\u1160',
    '\u3164',
    '\uFFA0',
    '\u180E',
    '\u034F',
  ].join('|'),
  'g',
)

function stripInvisibleChars(text: string): string {
  return text.replace(INVISIBLE_CHARS_REGEX, '')
}

function isTrackingParam(name: string): boolean {
  const lower = name.toLowerCase()
  return (
    TRACKING_PARAM_NAMES.has(lower) ||
    TRACKING_PARAM_PREFIXES.some((prefix) => lower.startsWith(prefix))
  )
}

/**
 * Trims a URL down to what is worth spending tokens on.
 *
 * Links used to be deleted outright, which is why service_url and
 * unsubscribe_url could only ever be guesses - the one place a receipt states
 * its cancel link was removed before the model saw it. They are kept now, minus
 * the tracking payloads that make them long without making them informative.
 */
export function sanitizeUrl(raw: string): string {
  const trailing = raw.match(TRAILING_PUNCTUATION)?.[0] ?? ''
  const candidate = trailing ? raw.slice(0, -trailing.length) : raw

  let url: URL
  try {
    url = new URL(candidate)
  } catch {
    return raw
  }

  for (const name of Array.from(url.searchParams.keys())) {
    if (isTrackingParam(name)) url.searchParams.delete(name)
  }

  const cleaned = url.toString()
  const trimmed =
    cleaned.length > MAX_URL_LENGTH
      ? `${url.origin}${url.pathname}`.slice(0, MAX_URL_LENGTH)
      : cleaned

  return `${trimmed}${trailing}`
}

export function stripHtmlFromEmail(html: string): string {
  if (!html) return ''

  const text = convert(html, {
    wordwrap: false,
    preserveNewlines: false,
    selectors: [
      {
        selector: 'a',
        options: {
          // Links are kept so the model can read a real cancel or manage-billing
          // URL out of the receipt instead of inventing one. The href is dropped
          // only when it merely repeats the anchor text.
          hideLinkHrefIfSameAsText: true,
        },
      },
      { selector: 'img', format: 'skip' },
      { selector: 'table', format: 'dataTable' },
      { selector: 'style', format: 'skip' },
      { selector: 'script', format: 'skip' },
    ],
  })

  return stripInvisibleChars(text)
    .replace(URL_REGEX, sanitizeUrl)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/ {2,}/g, ' ')
    .trim()
}
