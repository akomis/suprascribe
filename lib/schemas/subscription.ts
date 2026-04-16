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

export const BILLING_PERIODS = ['monthly', 'yearly', 'quarterly', 'weekly'] as const

export const EmailAnalysisResultSchema = z.object({
  is_subscription: z
    .boolean()
    .describe('true if this email is a subscription/billing receipt, false otherwise'),

  service_name: z
    .string()
    .optional()
    .describe('Service name with plan tier (e.g., "Netflix Premium", "Claude Pro")'),
  price: z
    .number()
    .optional()
    .describe(
      'Price amount as shown in the email without currency symbol (use actual amount from email)',
    ),
  billing_period: z
    .enum(BILLING_PERIODS)
    .optional()
    .describe(
      'Billing period: "monthly" for monthly billing, "yearly" for annual/yearly billing, "quarterly" for quarterly billing, "weekly" for weekly billing. If unclear or one-time, omit.',
    ),
  currency: z.string().optional().describe('Currency code (USD, EUR, GBP, etc.)'),
  start_date: z.string().optional().describe('Billing/payment date in YYYY-MM-DD format'),
  end_date: z
    .string()
    .optional()
    .describe('Next billing date in YYYY-MM-DD format (omit for one-time/credit purchases)'),
  service_url: z.string().optional().describe('Main website URL with https://'),
  unsubscribe_url: z.string().optional().describe('URL to cancel subscription'),
  payment_method: z
    .string()
    .optional()
    .describe('Payment method used (e.g., "Visa ending in 4242")'),
  category: z.enum(SUBSCRIPTION_CATEGORIES).optional().describe('Subscription category'),
  auto_renew: z.boolean().optional().describe('Whether subscription auto-renews'),

  non_subscription_reason: z
    .enum([
      'marketing_email',
      'physical_order',
      'one_time_purchase',
      'refund_cancellation',
      'not_subscription_related',
    ])
    .optional()
    .describe('Why this email is not a subscription receipt'),
})

export type EmailAnalysisResult = z.infer<typeof EmailAnalysisResultSchema>

export const DiscoveredSubscriptionSchema = z.object({
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
      'Billing period: "monthly" for monthly billing, "yearly" for annual/yearly billing, "quarterly" for quarterly billing, "weekly" for weekly billing. If unclear or one-time, omit.',
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
})

export const BatchEmailAnalysisResultSchema = z.object({
  subscriptions: z
    .array(DiscoveredSubscriptionSchema)
    .describe(
      'Array of unique subscriptions. Merge consecutive months: all receipts for same service (similar price) = one entry with earliest start_date and latest end_date.',
    ),
})

export type BatchEmailAnalysisResult = z.infer<typeof BatchEmailAnalysisResultSchema>
