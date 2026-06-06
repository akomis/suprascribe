'use client'

import { DiscoveryDialog } from '@/components/dashboard/discovery/DiscoveryDialog'
import ImapDiscoveryDialog from '@/components/dashboard/discovery/ImapDiscoveryDialog'
import { useImapDiscovery } from '@/lib/hooks/discovery/useImapDiscovery'
import { useDiscoveryAIProvider } from '@/lib/hooks/useDiscoveryAIProvider'
import { useState } from 'react'

export function ImapDiscoveryHandler() {
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false)

  const {
    isDiscovering,
    discoveredSubscriptions,
    emailCount,
    error,
    warning,
    clearDiscovery,
    retry,
    startDiscovery,
  } = useImapDiscovery()

  const { aiProvider, aiModel, isLoadingAI, isByok } = useDiscoveryAIProvider()

  const handleImapSubmit = async (data: {
    server: string
    port: string
    email: string
    password: string
    useTls: boolean
  }) => {
    setShowCredentialsDialog(false)
    await startDiscovery({
      email: data.email,
      password: data.password,
      server: data.server,
      port: parseInt(data.port) || 993,
      useTls: data.useTls,
    })
  }

  return (
    <>
      <span
        onClick={() => setShowCredentialsDialog(true)}
        className="text-xs sm:text-sm text-muted-foreground hover:text-foreground hover:cursor-pointer underline"
      >
        Using a different provider? Try IMAP
      </span>

      <ImapDiscoveryDialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
        onSubmit={handleImapSubmit}
        isLoading={isDiscovering}
      />

      <DiscoveryDialog
        isDiscovering={isDiscovering}
        discoveredSubscriptions={discoveredSubscriptions}
        emailCount={emailCount}
        error={error}
        warning={warning}
        clearDiscovery={clearDiscovery}
        retry={retry}
        providerName="IMAP"
        aiProvider={aiProvider}
        aiModel={aiModel}
        isLoadingAI={isLoadingAI}
        isByok={isByok}
      />
    </>
  )
}
