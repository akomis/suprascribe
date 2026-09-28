import { describe, expect, it } from 'vitest'
import { serviceKey, stripCorporateSuffixes } from '@/lib/utils/service-key'
import sqlParity from '@/lib/utils/__fixtures__/merchant-key-parity.json'

// Every case below is a real pair from the production SUBSCRIPTION_SERVICES
// catalog, which is the only honest test set for this function: invented names
// never reproduce the ways real receipts differ.
describe('serviceKey', () => {
  describe('collapses catalog rows that are the same business', () => {
    const samePairs: [string, string][] = [
      ['Etsy', 'ETSY'],
      ['DIDI MOBILITY', 'Didi Mobility'],
      ['ElevenLabs Starter', 'Eleven Labs Starter'],
      ['Amazon Music Unlimited - Family', 'Amazon Music Unlimited Family'],
      ['Rushmax Instagram followers', 'Rushmax Instagram Followers'],
      ['CapCut: Photo & Video Editor Monthly', 'CapCut - Photo & Video Editor Monthly'],
      ['ESET Mobile Security & Antivirus Yearly', 'ESET Mobile Security Antivirus Yearly'],
      // Legal-entity suffix is noise, not identity.
      ['Ancestry.com Operations', 'Ancestry.com Operations LP'],
      ['Acme', 'Acme, Inc.'],
      // Curly vs straight apostrophe: both are punctuation and both get stripped.
      ['BJ’s', "BJ's"],
    ]

    it.each(samePairs)('%s === %s', (a, b) => {
      expect(serviceKey(a)).toBe(serviceKey(b))
    })
  })

  describe('keeps genuinely different services apart', () => {
    const differentPairs: [string, string][] = [
      ['Claude PRO', 'Claude Max'],
      ['Netflix Premium', 'Netflix Standard'],
      ['Apple', 'Apple TV'],
      ['Ancestry World Explorer', 'Ancestry U.S. Discovery'],
    ]

    it.each(differentPairs)('%s !== %s', (a, b) => {
      expect(serviceKey(a)).not.toBe(serviceKey(b))
    })

    // The reason serviceKey strips [^\p{L}\p{N}] and not [^a-z0-9]. An
    // ASCII-only class deletes the whole Cyrillic product name and leaves only
    // the shared Latin corporate prefix, merging two unrelated purchases into
    // one fabricated subscription. Both rows are live in the catalog.
    it('does not merge two products that differ only outside the Latin alphabet', () => {
      const a = 'COGNOSPHERE PTE. LTD. Благословение полой'
      const b = 'COGNOSPHERE PTE. LTD. Жемчужный гимн'

      expect(serviceKey(a)).not.toBe(serviceKey(b))
      expect(serviceKey(a)).not.toBe('')
      // The ASCII-only version this guards against would produce "cognosphere"
      // for both. Prove the Cyrillic actually survives into the key.
      expect(serviceKey(a)).toContain('благословение')
    })
  })

  describe('truncated statement descriptors', () => {
    it('ignores the ellipsis so a stub can match a fuller sibling', () => {
      expect(serviceKey('Etsy Canada Ltd...')).toBe(serviceKey('Etsy Canada'))
    })

    it('keeps a truncated stub addressable rather than collapsing it to nothing', () => {
      // "Zaprojektuj Swoje Zycie Mem..." is a live $24.99/mo auto-renewing
      // subscription. Whatever else happens, its key must not be empty.
      expect(serviceKey('Zaprojektuj Swoje Życie Mem...')).not.toBe('')
    })

    it('cannot recover characters the bank actually removed', () => {
      // Documented limitation: equality alone will not join these two. Merging
      // them needs the gated prefix pass, not a smarter key.
      expect(serviceKey('Ancestry.com Operati...')).not.toBe(serviceKey('Ancestry.com Operations'))
    })
  })

  it('returns a stable key regardless of case, spacing and punctuation', () => {
    expect(serviceKey('  the   NOUN-project  ')).toBe(serviceKey('The Noun Project'))
  })

  it('never strips a suffix down to nothing', () => {
    expect(stripCorporateSuffixes('Inc')).toBe('Inc')
    expect(serviceKey('Ltd')).toBe('ltd')
  })
})

describe('serviceKey and the "+" suffix', () => {
  // Found by reviewing what merchant_key() actually collapses in the live
  // catalog: treating "+" as punctuation merged a paid membership into the
  // company that sells it.
  const mustStaySeparate: [string, string][] = [
    ['Walmart+', 'Walmart'],
    ['Apple TV+', 'Apple TV'],
    ['Apple iCloud+', 'Apple iCloud'],
  ]

  it.each(mustStaySeparate)('%s !== %s', (a, b) => {
    expect(serviceKey(a)).not.toBe(serviceKey(b))
  })

  it('still collapses spelling variants that both carry the +', () => {
    expect(serviceKey('discovery+ (Ad-free)')).toBe(serviceKey('discovery+ Ad-Free'))
    expect(serviceKey('Apple iCloud+ 2 TB')).toBe(serviceKey('Apple iCloud+ 2TB'))
    expect(serviceKey('432 Player Subscription (PRO+RADIO)')).toBe(
      serviceKey('432 Player Subscription PRO+RADIO'),
    )
  })
})

describe('legal-entity suffixes found in the live catalog', () => {
  // "Anthropic, PBC" and "Anthropic" were two cards in one review dialog, same
  // price, same subscription. "PBC" was simply missing from the suffix list.
  it('treats "Anthropic, PBC" as Anthropic', () => {
    expect(serviceKey('Anthropic, PBC')).toBe(serviceKey('Anthropic'))
  })

  // A suffix written with full stops is the same suffix. Both spellings are
  // live catalog rows.
  const dotted: [string, string][] = [
    ['Cleeng B.V.', 'Cleeng'],
    ['ArjanCodes Services B.V.', 'ArjanCodes Services'],
    ['OpenAI, L.L.C.', 'OpenAI'],
    ['OpenAI, LLC', 'OpenAI'],
  ]

  it.each(dotted)('%s === %s', (a, b) => {
    expect(serviceKey(a)).toBe(serviceKey(b))
  })

  // The dotted form is anchored to the end and must sit behind a space or
  // comma, or an abbreviation inside a name would be eaten as a suffix.
  it('leaves a mid-name abbreviation alone', () => {
    expect(serviceKey('Ancestry U.S. Discovery')).toBe('ancestryusdiscovery')
    expect(serviceKey('U.S. LawShield')).toBe('uslawshield')
    expect(serviceKey('Sengoku L.A.')).toBe('sengokula')
  })

  // Excluded on purpose: these end real product names more often than they end
  // a legal entity, and stripping them would damage more than it cleans.
  it('still keeps the ambiguous short suffixes', () => {
    expect(serviceKey('Loestone Power Co.')).toBe('loestonepowerco')
    expect(serviceKey('WEBO GROUP D.O.O.')).toBe('webogroupdoo')
  })
})

/**
 * Parity with public.merchant_key() in Postgres.
 *
 * The two implementations have to agree byte for byte: the SQL one backs the
 * unique index and the catalog-merge migration, the TS one groups charges
 * during a scan. If they drift, the index stops matching the lookup and
 * duplicate services start reappearing.
 *
 * Every expected value below was produced by running merchant_key() against the
 * live catalog, so this is a recorded comparison, not a restatement of the
 * TypeScript.
 */
describe('parity with the SQL merchant_key()', () => {
  it.each(sqlParity as [string, string][])('%s -> %s', (name, sqlKey) => {
    expect(serviceKey(name)).toBe(sqlKey)
  })
})
