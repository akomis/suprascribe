'use client'

import { DiscoveryDialog } from '@/components/dashboard/discovery/DiscoveryDialog'
import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { useGoogleDiscovery } from '@/lib/hooks/discovery/useGoogleDiscovery'
import { useBYOKSettings } from '@/lib/hooks/useBYOKSettings'
import { PROVIDER_NAMES, type LLMProvider } from '@/lib/services/ai-provider'

export function GoogleDiscoveryHandler() {
  const { isDiscovering, discoveredSubscriptions, error, warning, clearDiscovery, retry } =
    useGoogleDiscovery()
  const { keys, activeKeyId, isLoading: isLoadingAI } = useBYOKSettings()
  const activeKey = keys.find((k) => k.id === activeKeyId)

  const aiProvider = activeKey ? PROVIDER_NAMES[activeKey.provider as LLMProvider] : 'OpenRouter'
  const aiModel = activeKey ? activeKey.model : EMAIL_DISCOVERY_CONFIG.analysisModel.modelName

  return (
    <DiscoveryDialog
      isDiscovering={isDiscovering}
      discoveredSubscriptions={discoveredSubscriptions}
      error={error}
      warning={warning}
      clearDiscovery={clearDiscovery}
      retry={retry}
      providerName="Gmail"
      aiProvider={aiProvider}
      aiModel={aiModel}
      isLoadingAI={isLoadingAI}
      isByok={activeKeyId !== null}
    />
  )
}
