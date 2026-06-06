export type LLMProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'mistral'
  | 'groq'
  | 'xai'
  | 'cohere'
  | 'deepseek'
  | 'perplexity'
  | 'togetherai'
  | 'fireworks'
  | 'openrouter'

export interface ProviderConfig {
  provider: LLMProvider
  apiKey: string
  model: string
}

export const DEFAULT_MODELS: Record<LLMProvider, string[]> = {
  openai: [
    'gpt-5-nano',
    'gpt-5-mini',
    'gpt-5',
    'gpt-4.1-nano',
    'gpt-4.1-mini',
    'gpt-4.1',
    'o4-mini',
    'o3-mini',
  ],
  anthropic: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'],
  google: ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-3-flash-preview'],
  mistral: ['mistral-small-3.2-24b-instruct', 'mistral-medium-3.1', 'mistral-large-2512'],
  groq: [
    'llama-3.3-70b-versatile',
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick',
    'openai/gpt-oss-20b',
  ],
  xai: ['grok-4-fast', 'grok-3-mini', 'grok-4', 'grok-3'],
  cohere: ['command-r-plus-08-2024', 'command-r-08-2024'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  perplexity: ['sonar', 'sonar-pro', 'sonar-reasoning-pro'],
  togetherai: [
    'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'meta-llama/Llama-4-Scout-17B-16E-Instruct-Turbo',
    'meta-llama/Llama-4-Maverick-17B-128E-Instruct-FP8',
  ],
  fireworks: [
    'accounts/fireworks/models/llama-v3p3-70b-instruct',
    'accounts/fireworks/models/llama4-scout-instruct-basic',
  ],
  openrouter: [],
}

export const PROVIDER_NAMES: Record<LLMProvider, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  mistral: 'Mistral',
  groq: 'Groq',
  xai: 'xAI',
  cohere: 'Cohere',
  deepseek: 'DeepSeek',
  perplexity: 'Perplexity',
  togetherai: 'Together AI',
  fireworks: 'Fireworks',
  openrouter: 'OpenRouter',
}
