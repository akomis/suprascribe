import { describe, expect, it } from 'vitest'
import { earliestDate } from '@/lib/utils/date'

// Every input below is a real Gmail or Outlook envelope date. The first version
// of this sorted the raw strings and sliced ten characters off the winner,
// which produced "Fri, 14 Au" and made Postgres reject the entire analytics
// insert it belonged to - so a whole scan recorded nothing, cost included.
describe('earliestDate', () => {
  it('parses RFC 2822 headers rather than sorting them as text', () => {
    const headers = [
      'Fri, 14 Aug 2026 09:12:03 +0000',
      'Mon, 02 Feb 2026 23:59:00 +0200',
      'Wed, 31 Dec 2025 08:00:00 -0500',
    ]

    // Alphabetically "Fri" wins; chronologically December 2025 does.
    expect(earliestDate(headers)).toBe('2025-12-31')
  })

  // UTC, not the server's local day. A late-evening UTC timestamp read in a
  // positive offset rolls to the next date, which would make the stored value
  // depend on where the scan happened to run.
  it('renders the UTC day, whatever the server timezone', () => {
    expect(earliestDate(['2026-08-14T09:12:03Z', '2026-02-02T23:59:00Z'])).toBe('2026-02-02')
  })

  it('compares the two forms against each other', () => {
    expect(earliestDate(['2026-08-14T09:12:03Z', 'Wed, 31 Dec 2025 08:00:00 -0500'])).toBe(
      '2025-12-31',
    )
  })

  it('skips what it cannot parse instead of returning it', () => {
    expect(earliestDate(['not a date', 'Fri, 14 Aug 2026 09:12:03 +0000'])).toBe('2026-08-14')
  })

  it('returns undefined rather than a bad value when nothing parses', () => {
    expect(earliestDate([])).toBeUndefined()
    expect(earliestDate(['', 'Fri, 14 Au'])).toBeUndefined()
  })

  it('never returns a string a date column would reject', () => {
    const result = earliestDate(['Fri, 14 Aug 2026 09:12:03 +0000'])
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})
