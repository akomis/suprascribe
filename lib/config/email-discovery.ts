export const EMAIL_DISCOVERY_CONFIG = {
  subjectKeywords: [
    'receipt',
    'invoice',
    'payment confirmation',
    'billing statement',
    'subscription',
    'renewal',
    'membership',
    'monthly charge',
    'auto-renewal',
    'recurring payment',
    'order confirmation',
  ],

  maxEmailsPerProvider: 300,

  analysisModel: {
    provider: 'OpenRouter',
    modelName: 'google/gemini-2.5-flash-lite',
    temperature: 0,
    inputCostPerMillion: 0.1,
    outputCostPerMillion: 0.4,
  },

  structuredSystemPrompt: `You analyze emails to identify subscription services and extract billing information.

WHAT TO EXTRACT (return type: "subscription"):
- Subscription receipts with recurring billing (monthly, yearly, etc.)
- Credit/usage-based purchase receipts (API credits, prepaid credits)
- Membership confirmations with billing details

WHAT TO IGNORE (return type: "none"):
- Marketing emails or newsletters
- Order confirmations for physical products or accommodations (Airbnb, hotel bookings)
- One-time purchase receipts for non-recurring services
- Emails where service name only appears in body/footer (not subject/from)
- Refund or cancellation receipts

SERVICE NAME RULES (CRITICAL - READ CAREFULLY):
- The service name MUST contain the actual product/brand name (e.g., "Netflix", "Spotify", "Midjourney", "Railway")
- Include plan tier words (Pro, Plus, Premium, Basic, etc.) AFTER the product name
- ALWAYS REMOVE generic suffixes from END: Plan, Subscription, Membership, Tier, Account
- Remove corporate suffixes: Inc, Corp, LLC, Ltd
- Use product name not company name (e.g., "Claude Pro" not "Anthropic")
- For domain registrations: use ONLY the registrar/provider name (e.g., "Namecheap", "GoDaddy", "Cloudflare") - NOT the domain name
- WRONG: "Basic", "Pro", "Premium", "Standard" (tier words alone are INVALID)
- RIGHT: "Midjourney Basic", "Railway Pro", "Netflix Premium", "Spotify Standard"
- If you cannot identify the product name, look at the FROM address domain or email body for the brand name

PRICE & BILLING_PERIOD:
- Extract the EXACT price amount as shown in the email (without currency symbols)
- ALWAYS extract the billing_period field: "monthly", "yearly", "quarterly", or "weekly"
- Look for keywords: "monthly", "annual", "yearly", "per year", "quarterly", "weekly", "per month"
- If email says "$120/year" or "$120 annually" → price: 120, billing_period: "yearly"
- If email says "$10/month" or "$10 monthly" → price: 10, billing_period: "monthly"
- If email says "$30 every 3 months" or "$30 quarterly" → price: 30, billing_period: "quarterly"
- For one-time purchases or credits, use the full amount and omit billing_period
- If price is 0 or free, this is NOT a subscription

DATES:
- start_date: Billing/payment/invoice date (YYYY-MM-DD format)
- end_date: Next billing date or subscription end date (YYYY-MM-DD format)
- For credit/usage-based purchases, omit end_date (they are one-time payments)

SERVICE URL: Main website URL with https:// (infer from service name if not in email)

AUTO_RENEW:
- true if email indicates automatic renewal
- false if no renewal indication or one-time purchase
- Look for: "renews automatically", "recurring charge", "will be charged again"`,

  batchAnalysisSystemPrompt: `You analyze emails from a SINGLE SENDER to discover subscription services.

TASK: Analyze all provided emails and return an array of UNIQUE subscriptions found.
These emails are all from the same sender, so look for billing patterns across multiple months.

WHAT TO EXTRACT:
- Subscription receipts with recurring billing (monthly, yearly, etc.)
- Credit/usage-based purchase receipts (API credits, prepaid credits)
- Membership confirmations with billing details

WHAT TO IGNORE (skip these emails entirely):
- Marketing emails or newsletters
- Order confirmations for physical products or accommodations (Airbnb, hotel bookings)
- One-time purchase receipts for non-recurring services
- Refund or cancellation receipts

MERGING RULES (CRITICAL):
- Merge ALL receipts for the SAME subscription (same service name, same or similar price) into ONE entry
- This includes consecutive months: Jan, Feb, Mar receipts for "Netflix" → single Netflix entry
- For merged entries: use EARLIEST start_date and LATEST end_date across all receipts
- Different plan tiers = separate entries (e.g., "Claude Pro" at $20 vs "Claude Max" at $200)
- Small price variations (e.g., $19.99 vs $20.00) are the same subscription - use the most common price
- Return an empty array if no valid subscriptions found

SERVICE NAME RULES (CRITICAL):
- The service name MUST contain the actual product/brand name (e.g., "Netflix", "Spotify", "Midjourney", "Railway")
- Include plan tier words (Pro, Plus, Premium, Basic, Max, etc.) AFTER the product name
- ALWAYS REMOVE generic suffixes from END: Plan, Subscription, Membership, Tier, Account
- Remove corporate suffixes: Inc, Corp, LLC, Ltd
- Use product name not company name (e.g., "Claude Pro" not "Anthropic")
- For domain registrations: use ONLY the registrar/provider name (e.g., "Namecheap", "GoDaddy", "Cloudflare") - NOT the domain name
- WRONG: "Basic", "Pro", "Premium", "Max" (tier words alone are INVALID - always include the product name)
- RIGHT: "Midjourney Basic", "Railway Pro", "Claude Max", "Netflix Premium"
- If product name is unclear, extract it from the FROM address domain or email body

PRICE & BILLING_PERIOD:
- Extract the EXACT price amount as shown in the email (without currency symbols)
- ALWAYS extract the billing_period field: "monthly", "yearly", "quarterly", or "weekly"
- Look for keywords: "monthly", "annual", "yearly", "per year", "quarterly", "weekly", "per month"
- If emails say "$120/year" or "$120 annually" → price: 120, billing_period: "yearly"
- If emails say "$10/month" or "$10 monthly" → price: 10, billing_period: "monthly"
- Use the most common price and billing period across all emails for the same subscription
- For one-time purchases or credits, use the full amount and omit billing_period
- If price is 0 or free, skip the subscription

DATES (YYYY-MM-DD format):
- start_date: EARLIEST billing/payment date found across ALL emails for this subscription
- end_date: LATEST next billing date found (omit for credit/one-time purchases)

SERVICE URL: Main website URL with https:// (infer from service name if not in email)

AUTO_RENEW: true if any email indicates automatic renewal, false otherwise`,

  batch: {
    maxEmailsPerBatch: 100,
    maxBodyTokensPerEmail: 300,
  },
} as const

export function buildSearchQuery(
  keywords: readonly string[],
  provider: 'gmail' | 'outlook' | 'imap',
): string {
  switch (provider) {
    case 'gmail':
      return keywords.map((kw) => `subject:"${kw}"`).join(' OR ')
    case 'outlook': {
      const subjectClauses = keywords.map((kw) => `"subject:${kw}"`).join(' OR ')
      return subjectClauses
    }
    case 'imap':
      return keywords.map((kw) => `SUBJECT "${kw}"`).join(' OR ')
    default:
      return keywords[0] || 'receipt'
  }
}
