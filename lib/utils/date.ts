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

/**
 * Earliest of a set of email date headers, as "YYYY-MM-DD".
 *
 * Envelope dates arrive in whatever the provider sends: RFC 2822
 * ("Fri, 14 Aug 2026 09:12:03 +0000") from some, ISO-8601 from others. Sorting
 * those as strings orders them by weekday name, and taking the first ten
 * characters of the winner yields "Fri, 14 Au" - which Postgres rejects for a
 * date column, failing the whole insert it was part of. Parse first, compare as
 * instants, and skip anything unparseable rather than poisoning the result.
 *
 * Rendered in UTC rather than through toDateString, which is the one place that
 * rule is wrong: an envelope timestamp is an absolute instant, so reading it in
 * the server's local time would make the answer depend on where the server runs
 * - and two scans of the same mailbox from two regions would disagree.
 */
export function earliestDate(values: string[]): string | undefined {
  let earliest: number | undefined

  for (const value of values) {
    const time = new Date(value).getTime()
    if (!Number.isFinite(time)) continue
    if (earliest === undefined || time < earliest) earliest = time
  }

  return earliest === undefined ? undefined : new Date(earliest).toISOString().slice(0, 10)
}
