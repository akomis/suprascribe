import { describe, expect, it } from 'vitest'
import { normalizeClassifiedSubscription } from '@/lib/utils/subscription-normalizer'
import type { DiscoveredSubscription } from '@/lib/types/forms'

function named(service_name: string): string {
  const result = normalizeClassifiedSubscription({
    service_name,
    price: 10,
    period: 'MONTHLY',
    start_date: '2026-01-05',
    end_date: '2026-02-04',
  } satisfies DiscoveredSubscription)

  if (!result.ok) throw new Error(`rejected: ${result.field} ${result.reason}`)
  return result.subscription.service_name
}

// The billing cycle belongs in the period column, not in the name. Stage A is
// told exactly that and does not reliably obey, and the catalog is full of the
// same thing from the old pipeline.
describe('the billing cycle is not part of the name', () => {
  const cases: [string, string][] = [
    ['Apify monthly', 'Apify'],
    ['SocialClaw Starter Monthly', 'SocialClaw Starter'],
    ['Shhots AI Starter Pack Monthly', 'Shhots AI Starter Pack'],
    ['Claude Pro - Annual', 'Claude Pro'],
    // A separator that is not a space or comma.
    ['EMBY | MONTHLY', 'EMBY'],
    ['Bondlytics Plus — Monthly', 'Bondlytics Plus'],
    // A count in front of the unit.
    ['Canva Pro 1 Month', 'Canva Pro'],
    ['ClickTech Solutions Hub 4 Week', 'ClickTech Solutions Hub'],
    // And a preposition in front of the count.
    ['Earthquake Network Priority 10k for 1 month', 'Earthquake Network Priority 10k'],
    // The count goes with the cycle, hyphen and all, or this leaves "NordVPN 12".
    ['NordVPN 12-month', 'NordVPN'],
    ['NordVPN: 12-month', 'NordVPN'],
    ['MacPaw CleanMyMac - Plan for 1 Mac - 1 Year', 'MacPaw CleanMyMac - Plan for 1 Mac'],
    // Monthly and yearly variants of one product collapse onto one service,
    // which is the point: the cycle is a column, not an identity.
    ['CapCut: Photo & Video Editor Yearly', 'CapCut: Photo & Video Editor'],
    ['CapCut: Photo & Video Editor Monthly', 'CapCut: Photo & Video Editor'],
  ]

  it.each(cases)('%s -> %s', (input, expected) => {
    expect(named(input)).toBe(expected)
  })

  it('strips a cycle sitting behind a generic suffix', () => {
    expect(named('Acme Ltd Monthly Plan')).toBe('Acme')
  })

  it.each([
    // "Bi-Monthly" goes with the cycle, or it leaves a dangling "Bi".
    ['General Pest Control - Bi-Monthly', 'General Pest Control'],
    ['Lawn Care Semi-Annual', 'Lawn Care'],
  ])('%s -> %s', (input, expected) => {
    expect(named(input)).toBe(expected)
  })

  // The noun form is a unit of time and turns up inside real names, so it only
  // counts as billing when a number comes with it. Every genuine case in the
  // catalog has one.
  describe('the bare noun needs a count', () => {
    it.each([
      ['Restoro - 1 Year', 'Restoro'],
      ['GeekSquad 3-Year', 'GeekSquad'],
      ['Smule All Access Pass - 1 Month', 'Smule All Access Pass'],
    ])('%s -> %s', (input, expected) => {
      expect(named(input)).toBe(expected)
    })

    it.each([
      'The Creatives Fashion Networking event during London Fashion Week',
      'Shark Week',
      'Clideo Month',
    ])('leaves %s alone', (name) => {
      expect(named(name)).toBe(name)
    })
  })

  // No structural rule separates "Texas Monthly" from "Nebula MONTHLY" - both
  // are two words ending in a cycle - so the brand is listed as an exception.
  it('keeps a cycle word that is the brand', () => {
    expect(named('Texas Monthly')).toBe('Texas Monthly')
    expect(named('Nebula MONTHLY')).toBe('Nebula')
  })

  // Anchored at the end, so a cycle word that opens or sits inside a real name
  // is left where it is.
  const untouched = ['Monthly Review', 'The Monthly Ledger', 'Year One', 'Weekly Planner Pro Tools']

  it.each(untouched)('leaves %s alone', (name) => {
    expect(named(name)).toBe(name)
  })

  // Stripping everything back to nothing, or to a bare tier word, is not an
  // improvement - the original is kept instead.
  it('never strips a name down to nothing', () => {
    expect(named('Monthly')).toBe('Monthly')
    expect(named('Pro Monthly')).toBe('Pro Monthly')
  })
})
