'use client'

import { DiscoveryDialog } from '@/components/dashboard/discovery/DiscoveryDialog'
import ImapDiscoveryDialog from '@/components/dashboard/discovery/ImapDiscoveryDialog'
import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { useImapDiscovery } from '@/lib/hooks/discovery/useImapDiscovery'
import { useBYOKSettings } from '@/lib/hooks/useBYOKSettings'
import { PROVIDER_NAMES, type LLMProvider } from '@/lib/services/ai-provider'
import { useRef, useState } from 'react'

export function ImapDiscoveryHandler() {
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false)
  const lastSubmittedCredentials = useRef<{
    server: string
    port: string
    email: string
    password: string
    useTls: boolean
  } | null>(null)

  const {
    isDiscovering,
    discoveredSubscriptions,
    error,
    warning,
    clearDiscovery,
    retry,
    startDiscovery,
  } = useImapDiscovery()

  const { keys, activeKeyId, isLoading: isLoadingAI } = useBYOKSettings()
  const activeKey = keys.find((k) => k.id === activeKeyId)

  const aiProvider = activeKey ? PROVIDER_NAMES[activeKey.provider as LLMProvider] : 'OpenRouter'
  const aiModel = activeKey ? activeKey.model : EMAIL_DISCOVERY_CONFIG.analysisModel.modelName

  const handleImapSubmit = async (data: {
    server: string
    port: string
    email: string
    password: string
    useTls: boolean
  }) => {
    lastSubmittedCredentials.current = data
    setShowCredentialsDialog(false)
    await startDiscovery({
      email: data.email,
      password: data.password,
      server: data.server,
      port: parseInt(data.port) || 993,
      useTls: data.useTls,
    })
  }

  const openCredentialsDialog = () => {
    setShowCredentialsDialog(true)
  }

  return (
    <>
      {/* Trigger component - can be called from parent */}
      <span
        onClick={openCredentialsDialog}
        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:cursor-pointer underline"
      >
        Using a different provider? Try fetching emails with IMAP
      </span>

      {/* IMAP Credentials Dialog */}
      <ImapDiscoveryDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        onSubmit={handleImapSubmit}
        isLoading={isDiscovering}
      />

      {/* Shared Discovery Dialog */}
      <DiscoveryDialog
        isDiscovering={isDiscovering}
        discoveredSubscriptions={discoveredSubscriptions}
        error={error}
        warning={warning}
        clearDiscovery={clearDiscovery}
        retry={retry}
        providerName="IMAP"
        aiProvider={aiProvider}
        aiModel={aiModel}
        isLoadingAI={isLoadingAI}
        isByok={activeKeyId !== null}
      />
    </>
  )
}
