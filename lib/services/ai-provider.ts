import 'server-only'

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

export type { LLMProvider, ProviderConfig } from './ai-provider-constants'
export { DEFAULT_MODELS } from './ai-provider-constants'

import type { ProviderConfig } from './ai-provider-constants'

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
