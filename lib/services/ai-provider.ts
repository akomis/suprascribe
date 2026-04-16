import { createAnthropic } from '@ai-sdk/anthropic'
import { createCohere } from '@ai-sdk/cohere'
import { createDeepSeek } from '@ai-sdk/deepseek'
import { createFireworks } from '@ai-sdk/fireworks'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createGroq } from '@ai-sdk/groq'
import { createMistral } from '@ai-sdk/mistral'
import { createOpenAI } from '@ai-sdk/openai'
import { createPerplexity } from '@ai-sdk/perplexity'
import { APICallError } from '@ai-sdk/provider'
import { createTogetherAI } from '@ai-sdk/togetherai'
import { createXai } from '@ai-sdk/xai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { generateText, type LanguageModel } from 'ai'

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

export const RECOMMENDED_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-5-nano',
  anthropic: 'claude-haiku-4-5-20251001',
  google: 'gemini-2.5-flash-lite',
  mistral: 'mistral-small-3.2-24b-instruct',
  groq: 'llama-3.3-70b-versatile',
  xai: 'grok-4-fast',
  cohere: 'command-r-plus-08-2024',
  deepseek: 'deepseek-chat',
  perplexity: 'sonar',
  togetherai: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
  fireworks: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
  openrouter: 'google/gemini-2.5-flash-lite',
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

export function createModel(config: ProviderConfig): LanguageModel {
  switch (config.provider) {
    case 'openai': {
      const openai = createOpenAI({ apiKey: config.apiKey })
      return openai(config.model)
    }
    case 'anthropic': {
      const anthropic = createAnthropic({ apiKey: config.apiKey })
      return anthropic(config.model)
    }
    case 'google': {
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey })
      return google(config.model)
    }
    case 'mistral': {
      const mistral = createMistral({ apiKey: config.apiKey })
      return mistral(config.model)
    }
    case 'groq': {
      const groq = createGroq({ apiKey: config.apiKey })
      return groq(config.model)
    }
    case 'xai': {
      const xai = createXai({ apiKey: config.apiKey })
      return xai(config.model)
    }
    case 'cohere': {
      const cohere = createCohere({ apiKey: config.apiKey })
      return cohere(config.model)
    }
    case 'deepseek': {
      const deepseek = createDeepSeek({ apiKey: config.apiKey })
      return deepseek(config.model)
    }
    case 'perplexity': {
      const perplexity = createPerplexity({ apiKey: config.apiKey })
      return perplexity(config.model)
    }
    case 'togetherai': {
      const togetherai = createTogetherAI({ apiKey: config.apiKey })
      return togetherai(config.model)
    }
    case 'fireworks': {
      const fireworks = createFireworks({ apiKey: config.apiKey })
      return fireworks(config.model)
    }
    case 'openrouter': {
      const openrouter = createOpenRouter({
        apiKey: config.apiKey,
        headers: {
          'HTTP-Referer': 'https://suprascribe.com',
          'X-Title': 'Suprascribe',
        },
      })
      return openrouter(config.model)
    }
    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

export async function validateApiKey(
  config: ProviderConfig,
): Promise<{ valid: boolean; error?: string }> {
  try {
    const model = createModel(config)

    await generateText({
      model,
      prompt: 'Say "ok"',
      maxOutputTokens: 16,
      providerOptions: {
        anthropic: { thinking: { type: 'disabled' } },
        google: { thinkingConfig: { thinkingBudget: 0 } },
      },
    })

    return { valid: true }
  } catch (error) {
    if (APICallError.isInstance(error)) {
      const { statusCode } = error
      if (statusCode === 401 || statusCode === 403) {
        return { valid: false, error: 'Invalid API key' }
      }
      if (statusCode === 429) {
        return { valid: false, error: 'Rate limited - try again later' }
      }
      if (statusCode === 404) {
        return { valid: false, error: 'Model not available - try a different model' }
      }
      if (statusCode === 402) {
        return { valid: false, error: 'Quota exceeded - check your account' }
      }
    }

    const message = error instanceof Error ? error.message.toLowerCase() : 'unknown error'
    if (message.includes('quota') || message.includes('insufficient')) {
      return { valid: false, error: 'Quota exceeded - check your account' }
    }
    if (message.includes('model') || message.includes('not found')) {
      return { valid: false, error: 'Model not available - try a different model' }
    }

    return { valid: false, error: 'Failed to validate key - please check and try again' }
  }
}

export function isValidModel(provider: LLMProvider, model: string): boolean {
  if (provider === 'openrouter') {
    return model.trim().length > 0
  }
  return DEFAULT_MODELS[provider].includes(model)
}

export function getModelLabel(provider: LLMProvider, model: string): string {
  const isRecommended = model === RECOMMENDED_MODELS[provider]
  return isRecommended ? `${model} (Recommended)` : model
}
