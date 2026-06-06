import { format } from 'date-fns'

/**
 * Parse an ISO date string (YYYY-MM-DD) safely across all browsers.
 * Safari treats "2024-01-15" as UTC midnight but "2024/01/15" as local - use the slash form.
 */
function parseDateString(date: string): Date {
  return new Date(date.replace(/-/g, '/'))
}

/**
 * Serialize a Date to "YYYY-MM-DD" using local time (not UTC).
 * Use this instead of `.toISOString().split('T')[0]` to avoid UTC offset shifting dates.
 */
export function toDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Format a date string or Date object for display (e.g. "January 15th, 2024").
 * Accepts ISO strings, slash-separated strings, or Date instances.
 * Use formatLocalizedDate (lib/utils.ts) for locale-aware short format ("Jan 15, 2024").
 */
export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateString(date) : date
  return format(d, 'PPP')
}
