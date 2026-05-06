'use client'

import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { useBYOKSettings } from '@/lib/hooks/useBYOKSettings'
import { PROVIDER_NAMES, type LLMProvider } from '@/lib/services/ai-provider'

export interface DiscoveryAIProvider {
  aiProvider: string
  aiModel: string
  isLoadingAI: boolean
  isByok: boolean
}

export function useDiscoveryAIProvider(): DiscoveryAIProvider {
  const { keys, activeKeyId, isLoading } = useBYOKSettings()
  const activeKey = keys.find((k) => k.id === activeKeyId)
  return {
    aiProvider: activeKey ? PROVIDER_NAMES[activeKey.provider as LLMProvider] : 'OpenRouter',
    aiModel: activeKey ? activeKey.model : EMAIL_DISCOVERY_CONFIG.analysisModel.modelName,
    isLoadingAI: isLoading,
    isByok: activeKeyId !== null,
  }
}
