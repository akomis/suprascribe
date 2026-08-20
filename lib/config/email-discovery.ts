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

  maxEmailsPerProvider: 500,

  analysisModel: {
    provider: 'OpenRouter',
    modelName: 'google/gemini-2.5-flash-lite',
    temperature: 0,
    inputCostPerMillion: 0.1,
    outputCostPerMillion: 0.4,
    // This model's documented output ceiling. Keep in step with modelName:
    // set too low it truncates mid-JSON, and a provider rejects it if too high.
    maxOutputTokens: 65_536,
  },

  batch: {
    // Chunking exists only to stay inside the model's context window. Sender
    // groups are never split, so a single oversized sender may exceed this.
    maxInputTokensPerChunk: 100_000,
    // Token budget for a single email body, or null to send bodies in full.
    // Trimming risks cutting the billing details out of a long receipt; not
    // trimming means far more input tokens and more chunks per scan.
    maxBodyTokensPerEmail: null as number | null,
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
