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
 * Long-form date for blog bylines and post cards (e.g. "1 September 2026"). Deliberately
 * distinct from formatDisplayDate, which uses the ordinal US style.
 */
export function formatBlogDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
