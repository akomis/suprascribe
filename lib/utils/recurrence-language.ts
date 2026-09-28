/**
 * Does this email say anything at all about recurring?
 *
 * Stage A is asked to report `stated_period` only when the email names a cycle,
 * and `renewal_evidence` only for what the email actually says. It does not
 * always obey. A real Uneed receipt - "Skip the waiting line, Units 1", an order
 * number, a VAT line, and not one word about renewing - came back with a
 * monthly period attached, and because a single charge is allowed in on the
 * strength of the email's own words, an invented word was enough.
 *
 * So the claim is checked against the text it was supposedly read from. This is
 * a necessary condition, not a sufficient one: a receipt whose footer happens to
 * say "manage your subscription" passes the check without proving anything. It
 * exists to catch the claim with no basis whatsoever, which is the one that
 * turns a one-off purchase into a standing monthly cost.
 *
 * Deliberately generous. A false negative here silently deletes a real
 * subscription, which is the worse failure, so anything resembling recurrence
 * language counts.
 */
const RECURRENCE_LANGUAGE = new RegExp(
  [
    // Cycle nouns and adjectives in any form.
    /\b(months?|monthly|years?|yearly|annual|annually|weeks?|weekly|quarters?|quarterly)\b/.source,
    // Renewal and subscription vocabulary.
    /\b(renew|renews|renewed|renewal|renewing|recurring|recurrence|subscription|subscriptions|subscribe|subscribed|membership|autopay)\b/
      .source,
    /\bauto[\s-]?renew/.source,
    // Phrases that state a cycle without naming one.
    /\bnext\s+(payment|charge|bill|billing|invoice|renewal)\b/.source,
    /\bbilling\s+(cycle|period|date)\b/.source,
    /\bper\s+(month|year|week)\b/.source,
    /\buntil\s+(you\s+)?cancel/.source,
    // "$12/mo", "$99 / year".
    /\/\s?(mo|month|yr|year|wk|week)\b/.source,
  ].join('|'),
  'i',
)

/**
 * Quoted-printable wraps long lines with a trailing "=" and a newline, which can
 * fall in the middle of a word: "mont=\nhly". Joining those back matters in the
 * one direction that costs money - a split word would read as no recurrence
 * language at all, and a real subscription's stated period would be discarded.
 */
function joinSoftLineBreaks(text: string): string {
  return text.replace(/=\r?\n/g, '')
}

export function mentionsRecurrence(text: string): boolean {
  return RECURRENCE_LANGUAGE.test(joinSoftLineBreaks(text))
}
