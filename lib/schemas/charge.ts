import { z } from 'zod'

export const SUBSCRIPTION_CATEGORIES = [
  'Entertainment',
  'Utilities',
  'Other',
  'AI',
  'Health & Wellness',
  'Food & Beverage',
  'Education',
  'News & Content',
  'Software',
  'Financial',
  'Transportation',
] as const

export const BILLING_PERIODS = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const

/**
 * One payment read off one email.
 *
 * The model's job stops here: it reports what a single receipt says and never
 * decides whether the merchant is a subscription. Recurrence is a property of a
 * set of charges over time, which no single email can answer - asking it to try
 * is what turned a parking ticket into a $50/month plan.
 */

export const CHARGE_DOC_TYPES = [
  'receipt',
  'invoice_due',
  'renewal_notice',
  'order_confirmation',
  'refund',
  'other',
] as const

/**
 * What the email actually said about recurring, as opposed to what the merchant
 * makes it tempting to assume. A familiar brand is not evidence.
 */
export const RENEWAL_EVIDENCE = [
  'none',
  'recurring_wording',
  'next_date_stated',
  'cancellation',
] as const

export type ChargeDocType = (typeof CHARGE_DOC_TYPES)[number]
export type RenewalEvidence = (typeof RENEWAL_EVIDENCE)[number]

export const ChargeSchema = z.object({
  email_index: z
    .number()
    .int()
    .describe('The EMAIL n number this charge was read from. Required on every object.'),
  merchant: z.string().describe('Brand the money went to. No plan tier, no legal suffix.'),
  plan: z
    .string()
    .optional()
    .describe('Plan or tier if the email names one: "Pro", "Max", "2TB", "Family".'),
  amount: z.number().describe('The single total actually charged, after tax and discounts.'),
  currency: z.string().optional().describe('ISO-4217 code, e.g. USD.'),
  charge_date: z
    .string()
    .describe('YYYY-MM-DD the money moved. Fall back to the email DATE header.'),
  doc_type: z.enum(CHARGE_DOC_TYPES).describe('What kind of email this is.'),
  stated_period: z
    .enum(BILLING_PERIODS)
    .optional()
    .describe(
      'ONLY when the email itself names a cycle ("$12/month", "billed annually"). Never infer one.',
    ),
  next_billing_date: z.string().optional().describe('YYYY-MM-DD, only if the email prints one.'),
  renewal_evidence: z.enum(RENEWAL_EVIDENCE).describe('What the email said about recurring.'),
  is_refund: z.boolean().describe('True when this reverses a charge.'),
  is_trial: z.boolean().describe('True for a free or introductory trial period.'),
  is_credit_purchase: z
    .boolean()
    .describe(
      'True when the payment buys a balance - credits, tokens, usage top-up - rather than access for a period.',
    ),
  installment_index: z.number().int().optional().describe('The 2 in "payment 2 of 4".'),
  installment_total: z
    .number()
    .int()
    .optional()
    .describe('The 4 in "payment 2 of 4", or in "Pay in 4".'),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional(),
  service_url: z.string().optional().describe('Main website URL with https://'),
  receipt_url: z.string().optional().describe('Link to the hosted invoice, copied verbatim.'),
})

export const ChargeExtractionResultSchema = z.object({
  charges: z
    .array(ChargeSchema)
    .describe('One object per payment found. Never merge two emails into one object.'),
})

export type RawCharge = z.infer<typeof ChargeSchema>

/**
 * A charge with the facts we hold ourselves attached.
 *
 * Sender domain, received date and the List-Unsubscribe header come from the
 * envelope, so they are joined in code by `email_index` rather than asked of
 * the model - which cannot hallucinate what it was never asked for.
 */
export type Charge = RawCharge & {
  sender_domain: string
  list_unsubscribe?: string
  /**
   * Whether the source email contains any recurrence wording at all, measured
   * in code against our own copy. The model's recurrence claims are checked
   * against this before they count - see mentionsRecurrence.
   */
  recurrence_language: boolean
}
