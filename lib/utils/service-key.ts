/**
 * Canonical identity for a service name.
 *
 * Two receipts naming the same business must land on the same key, or the
 * catalog fragments ("Etsy" / "ETSY", "Apple TV+" / "Apple TV") and the cadence
 * classifier sees one subscription as several merchants that each charged once.
 */

// Legal-entity suffixes, stripped so an invoice made out to the company reads as
// the product the user recognises: "There's An AI For That SRL" is the same
// thing as "There's An AI For That".
//
// Deliberately excludes ambiguous short words that end real product names -
// "Co", "AS", "SA", "KG", "Spa" - where stripping would damage a legitimate
// name more often than it would clean one up.
export const CORPORATE_SUFFIXES = [
  'inc',
  'incorporated',
  'corp',
  'corporation',
  'llc',
  'ltd',
  'limited',
  'gmbh',
  'srl',
  'sarl',
  'sas',
  'bv',
  'nv',
  'ab',
  'oy',
  'oyj',
  'aps',
  'pty',
  'plc',
  'ag',
  'lp',
  'llp',
  'pte',
  // Anthropic bills as "Anthropic, PBC". No product name ends in "pbc", so
  // unlike "Co" or "SA" this one is safe to strip.
  'pbc',
] as const

// "B.V." and "BV" are the same suffix, so every letter may carry its own full
// stop. Real rows in the catalog are written both ways ("Cleeng B.V.",
// "ArjanCodes Services B.V."), and without this they never meet their
// undotted sibling. Anchored at the end and behind a space or comma, so a
// mid-name abbreviation like "Ancestry U.S. Discovery" is untouched.
function suffixPattern(suffix: string): string {
  return suffix
    .split('')
    .map((letter) => `${letter}\\.?`)
    .join('')
}

/** Repeatedly drops trailing legal-entity suffixes, with or without full stops. */
export function stripCorporateSuffixes(name: string): string {
  let cleaned = name.trim()
  let changed = true

  while (changed) {
    changed = false
    for (const suffix of CORPORATE_SUFFIXES) {
      const regex = new RegExp(`[\\s,]+${suffixPattern(suffix)}$`, 'i')
      if (regex.test(cleaned)) {
        cleaned = cleaned.replace(regex, '').trim()
        changed = true
        break
      }
    }
  }

  return cleaned
}

/**
 * Grouping key for a service name. Case, punctuation, spacing and legal-entity
 * suffixes are noise; everything else is identity.
 *
 * The final strip keeps \p{L} rather than a-z on purpose. An ASCII-only class
 * deletes every non-Latin character, so two distinct products sharing a Latin
 * corporate prefix - "COGNOSPHERE PTE. LTD. Благословение полой" and
 * "COGNOSPHERE PTE. LTD. Жемчужный гимн", both real rows in the catalog -
 * would collapse onto one key and be merged into a single fake subscription.
 */
export function serviceKey(name: string): string {
  const base = name
    .normalize('NFKC')
    .toLowerCase()
    .trim()
    // A trailing ellipsis is a card-statement descriptor the bank cut short.
    // The stub is kept as a name (some of these are live subscriptions), so the
    // key has to ignore the marker for the stub to match a fuller sibling.
    .replace(/\s*(\.{2,}|…)$/, '')

  // A trailing "+" is branding, not punctuation: "Walmart+" is a paid
  // membership and "Walmart" is a shop, "Apple TV+" is a service and "Apple TV"
  // is a device. Stripping it as punctuation merged all three pairs in the live
  // catalog. Kept as a word so it survives the final strip.
  const withPlus = stripCorporateSuffixes(base).replace(/\+/g, 'plus')

  return withPlus.replace(/[^\p{L}\p{N}]+/gu, '')
}

// Tier words that appear alone as a "plan", and so cannot serve as a service
// name on their own. Shared with the cadence classifier, which buckets plans by
// the tier they name so "Pro", "PRO" and "Pro Plan" are one plan, not three.
export const STANDALONE_TIER_WORDS = [
  'basic',
  'pro',
  'plus',
  'premium',
  'free',
  'standard',
  'enterprise',
  'team',
  'max',
  'starter',
  'lite',
  'advanced',
  'ultimate',
  'business',
  'personal',
  'individual',
  'family',
  'student',
]

/**
 * Canonical bucket for a plan/tier string.
 *
 * Returning '' for an unrecognised or absent plan is deliberate: unspecified
 * plans group together, which is the right default when most receipts for a
 * service never name a tier at all.
 */
export function planBucket(plan?: string): string {
  if (!plan) return ''
  const lower = plan.toLowerCase()

  const tier = lower.match(new RegExp(`\\b(${STANDALONE_TIER_WORDS.join('|')})\\b`))
  if (tier) return tier[1]

  // Storage and seat counts distinguish real plans too ("iCloud+ 2TB").
  const sized = lower.match(/(\d+)\s*(gb|tb|mb|seats?|users?)/)
  return sized ? `${sized[1]}${sized[2]}` : ''
}
