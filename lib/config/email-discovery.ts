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
