'use client'

import { DiscoveryDialog } from '@/components/dashboard/discovery/DiscoveryDialog'
import { useOAuthDiscovery } from '@/lib/hooks/discovery/useOAuthDiscovery'
import { useDiscoveryAIProvider } from '@/lib/hooks/useDiscoveryAIProvider'

const PROVIDER_NAMES = {
  google: 'Gmail',
  microsoft: 'Microsoft',
} as const

type OAuthProvider = keyof typeof PROVIDER_NAMES

export function OAuthDiscoveryHandler({ provider }: { provider: OAuthProvider }) {
  const {
    isDiscovering,
    discoveredSubscriptions,
    teaser,
    emailCount,
    error,
    warning,
    clearDiscovery,
    retry,
  } = useOAuthDiscovery(provider)
  const { aiProvider, aiModel, isLoadingAI, isByok } = useDiscoveryAIProvider()

  return (
    <DiscoveryDialog
      isDiscovering={isDiscovering}
      discoveredSubscriptions={discoveredSubscriptions}
      teaser={teaser}
      emailCount={emailCount}
      error={error}
      warning={warning}
      clearDiscovery={clearDiscovery}
      retry={retry}
      providerName={PROVIDER_NAMES[provider]}
      aiProvider={aiProvider}
      aiModel={aiModel}
      isLoadingAI={isLoadingAI}
      isByok={isByok}
    />
  )
}
