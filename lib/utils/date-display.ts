import { format } from 'date-fns'

/**
 * Parse an ISO date string (YYYY-MM-DD) safely across all browsers.
 * Safari treats "2024-01-15" as UTC midnight but "2024/01/15" as local - use the slash form.
 */
function parseDateString(date: string): Date {
  return new Date(date.replace(/-/g, '/'))
}

/**
 * Format a date string or Date object for display (e.g. "January 15th, 2024").
 * Accepts ISO strings, slash-separated strings, or Date instances.
 * Use formatLocalizedDate (lib/utils.ts) for locale-aware short format ("Jan 15, 2024").
 *
 * Lives apart from lib/utils/date.ts because it is the only helper there that needs
 * date-fns. Keeping it in that module pulled ~50 kB of date-fns into every marketing
 * page, which only wanted formatBlogDate.
 */
export function formatDisplayDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseDateString(date) : date
  return format(d, 'PPP')
}
