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

const DiscoveredSubscriptionSchema = z.object({
  service_name: z
    .string()
    .describe('Service name with plan tier (e.g., "Netflix Premium", "Claude Pro")'),
  price: z
    .number()
    .describe(
      'Price amount as shown in the email without currency symbol (use actual amount from email)',
    ),
  billing_period: z
    .enum(BILLING_PERIODS)
    .optional()
    .describe(
      'Billing period: "MONTHLY" for monthly billing, "YEARLY" for annual/yearly billing, "QUARTERLY" for quarterly billing, "WEEKLY" for weekly billing. If unclear or one-time, omit.',
    ),
  currency: z.string().optional().describe('Currency code (USD, EUR, GBP, etc.)'),
  start_date: z.string().describe('Earliest billing/payment date found (YYYY-MM-DD format)'),
  end_date: z
    .string()
    .optional()
    .describe(
      'Latest next billing date found (YYYY-MM-DD format, omit for one-time/credit purchases)',
    ),
  service_url: z.string().optional().describe('Main website URL with https://'),
  unsubscribe_url: z.string().optional().describe('URL to cancel subscription'),
  payment_method: z
    .string()
    .optional()
    .describe('Payment method used (e.g., "Visa ending in 4242")'),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional().describe('Subscription category'),
  auto_renew: z.boolean().optional().describe('Whether subscription auto-renews'),

  is_trial: z
    .boolean()
    .optional()
    .describe('True when this is a free or discounted trial rather than a normal paid period'),
  trial_end_date: z
    .string()
    .optional()
    .describe('Date the trial converts to paid, YYYY-MM-DD, when the email states one'),
  next_billing_date: z
    .string()
    .optional()
    .describe('The next billing date as stated in the most recent receipt, YYYY-MM-DD'),
  receipt_url: z
    .string()
    .optional()
    .describe('Link to the hosted invoice or receipt, when the email contains one'),
})

export const BatchEmailAnalysisResultSchema = z.object({
  subscriptions: z
    .array(DiscoveredSubscriptionSchema)
    .describe(
      'Array of unique subscriptions. Merge consecutive months: all receipts for same service (similar price) = one entry with earliest start_date and latest end_date.',
    ),
})

type _BatchEmailAnalysisResult = z.infer<typeof BatchEmailAnalysisResultSchema>
