'use client'

import ICloudDiscoveryDialog from '@/components/dashboard/discovery/ICloudDiscoveryDialog'
import { ImapDiscoveryHandler } from '@/components/dashboard/discovery/ImapDiscoveryHandler'
import ProviderDiscoverButton from '@/components/dashboard/discovery/ProviderDiscoverButton'
import { redirectToOAuth } from '@/lib/discovery/oauth-redirect'
import { useDiscoveryRuns } from '@/lib/hooks/discovery/useDiscoveryRuns'
import { useImapDiscovery } from '@/lib/hooks/discovery/useImapDiscovery'
import { useAutoDiscoveryAccess } from '@/lib/hooks/useAutoDiscoveryAccess'
import { useBYOKSettings } from '@/lib/hooks/useBYOKSettings'
import { useDiscoveryAIProvider } from '@/lib/hooks/useDiscoveryAIProvider'
import { formatRateLimitTooltip } from '@/lib/utils/discovery-rate-limit'
import { Key, Lock } from 'lucide-react'
import { ConfigureApiKeyButton } from '@/components/ConfigureApiKeyButton'
import Link from 'next/link'
import * as React from 'react'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { Spinner } from '../ui/spinner'
import { DiscoveryDialog } from './discovery/DiscoveryDialog'
import { ExhaustedDiscoveriesMessage } from './discovery/ExhaustedDiscoveriesMessage'

function DiscoveryCard({
  hasByokActive,
  activeKey,
  isGoogleConfigured,
  isMicrosoftConfigured,
  isDiscovering,
  isGoogleLoading,
  isMicrosoftLoading,
  globalRateLimitTooltip,
  rateLimitInfo,
  isFreeTeaser,
  onGoogleClick,
  onMicrosoftClick,
  onICloudClick,
}: {
  hasByokActive: boolean
  activeKey: { provider: string; model: string } | undefined
  isGoogleConfigured: boolean
  isMicrosoftConfigured: boolean
  isDiscovering: boolean
  isGoogleLoading: boolean
  isMicrosoftLoading: boolean
  globalRateLimitTooltip: string | null
  rateLimitInfo: { discoveriesUsed: number; maxDiscoveries: number } | null | undefined
  isFreeTeaser: boolean
  onGoogleClick: () => void
  onMicrosoftClick: () => void
  onICloudClick: () => void
}) {
  return (
    <>
      <div className="fade-on-mount flex flex-col gap-4 rounded-lg border border-dashed p-4 w-[300px] sm:w-[350px] md:w-[450px]">
        {hasByokActive && activeKey && (
          <div className="text-xs mx-auto py-2 flex items-center gap-1">
            <Badge variant="outline" className="text-xs px-2 pt-0.5 pb-1">
              <Key className="h-3 w-3" />
              {activeKey.provider}&apos;s {activeKey.model}
            </Badge>
          </div>
        )}
        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-4 justify-center">
            <ProviderDiscoverButton
              displayName="Gmail"
              logoQuery="google"
              logoSrc="/logos/google.svg"
              onClick={onGoogleClick}
              disabled={!isGoogleConfigured}
              isLoading={isGoogleLoading}
              tooltipContent={globalRateLimitTooltip}
            />
            <ProviderDiscoverButton
              displayName="Outlook"
              logoQuery="microsoft"
              logoSrc="/logos/microsoft.svg"
              onClick={onMicrosoftClick}
              disabled={!isMicrosoftConfigured}
              isLoading={isMicrosoftLoading}
              tooltipContent={globalRateLimitTooltip}
            />
            <ProviderDiscoverButton
              displayName="iCloud"
              logoQuery="apple"
              logoSrc="/logos/apple.svg"
              onClick={onICloudClick}
              isLoading={isDiscovering}
              tooltipContent={globalRateLimitTooltip}
            />
          </div>
          <div className="text-center">
            <ImapDiscoveryHandler />
          </div>
          {!hasByokActive && !isFreeTeaser && (
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              {rateLimitInfo && rateLimitInfo.discoveriesUsed > 0 && (
                <Link
                  href="/limits"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-primary"
                >
                  <span>
                    {rateLimitInfo.discoveriesUsed}/{rateLimitInfo.maxDiscoveries} discoveries used
                  </span>
                </Link>
              )}
              <ConfigureApiKeyButton variant="ghost" size="sm" className="h-6 text-xs px-2" />
            </div>
          )}
        </div>
      </div>
      <a
        href="/safety"
        target="_blank"
        rel="noopener noreferrer"
        className="flex rounded-xl gap-4 items-start bg-muted p-4 hover:bg-muted/70 transition-colors cursor-pointer"
      >
        <Lock className="size-12 h-fit mt-1" />
        <div className="flex flex-col gap-2 items-start">
          <p className="text-xs text-muted-foreground text-start">
            We will only read your email subject lines and parse strictly subscription-related data.
            None of your credentials or data is saved at any point.
          </p>
        </div>
      </a>
    </>
  )
}

export function EmailProviderSelection() {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = React.useState(false)
  const [showICloudDialog, setShowICloudDialog] = React.useState(false)
  const [isGoogleConfigured, setIsGoogleConfigured] = React.useState(false)
  const [isMicrosoftConfigured, setIsMicrosoftConfigured] = React.useState(false)

  const { canRunFreeTeaser } = useAutoDiscoveryAccess()
  const { rateLimitInfo, isLoading: isRateLimitLoading } = useDiscoveryRuns()
  const { keys, activeKeyId, isLoading: isByokLoading } = useBYOKSettings()
  const { aiProvider, aiModel, isLoadingAI, isByok: hasByokActive } = useDiscoveryAIProvider()
  const {
    isDiscovering,
    discoveredSubscriptions,
    teaser,
    emailCount,
    error,
    warning,
    clearDiscovery,
    retry,
    startDiscovery,
  } = useImapDiscovery()

  const isLoadingSettings = isRateLimitLoading || isByokLoading
  const activeKey = keys.find((k) => k.id === activeKeyId)
  const globalRateLimitTooltip =
    !hasByokActive && rateLimitInfo ? formatRateLimitTooltip(rateLimitInfo) : null
  const isExhausted = !hasByokActive && rateLimitInfo && !rateLimitInfo.canDiscover

  React.useEffect(() => {
    // Use setTimeout to avoid synchronous setState during effect
    const timer = setTimeout(() => {
      setIsGoogleConfigured(Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID))
      setIsMicrosoftConfigured(Boolean(process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const handleGoogleClick = () => {
    setIsGoogleLoading(true)
    try {
      redirectToOAuth({
        authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        redirectPath: '/api/discovery/callback/google',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
      })
    } catch {
      toast.error('Authentication Error', { description: 'Failed to start Google authentication' })
      setIsGoogleLoading(false)
    }
  }

  const handleMicrosoftClick = () => {
    setIsMicrosoftLoading(true)
    try {
      redirectToOAuth({
        authBaseUrl: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize',
        clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
        redirectPath: '/api/discovery/callback/microsoft',
        scope:
          'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read offline_access',
        extraParams: { response_mode: 'query' },
      })
    } catch {
      toast.error('Authentication Error', {
        description: 'Failed to start Microsoft authentication',
      })
      setIsMicrosoftLoading(false)
    }
  }

  const handleICloudSubmit = async (data: { email: string; password: string }) => {
    setShowICloudDialog(false)
    await startDiscovery({
      email: data.email,
      password: data.password,
      server: 'imap.mail.me.com',
      port: 993,
      useTls: true,
    })
  }

  return (
    <div className="flex flex-col gap-4 w-[300px] sm:w-[350px] md:w-[450px] mx-auto">
      {isLoadingSettings ? (
        <div className="fade-on-mount flex flex-col gap-4 rounded-lg border border-dashed p-4 items-center justify-center min-h-[200px] w-[300px] md:w-[450px]">
          <Spinner className="size-8" />
        </div>
      ) : isExhausted ? (
        <ExhaustedDiscoveriesMessage rateLimitInfo={rateLimitInfo} />
      ) : (
        <DiscoveryCard
          hasByokActive={hasByokActive}
          activeKey={activeKey}
          isGoogleConfigured={isGoogleConfigured}
          isMicrosoftConfigured={isMicrosoftConfigured}
          isDiscovering={isDiscovering}
          isGoogleLoading={isGoogleLoading}
          isMicrosoftLoading={isMicrosoftLoading}
          globalRateLimitTooltip={globalRateLimitTooltip}
          rateLimitInfo={rateLimitInfo}
          isFreeTeaser={canRunFreeTeaser}
          onGoogleClick={handleGoogleClick}
          onMicrosoftClick={handleMicrosoftClick}
          onICloudClick={() => setShowICloudDialog(true)}
        />
      )}

      <ICloudDiscoveryDialog
        open={showICloudDialog}
        onOpenChange={setShowICloudDialog}
        onSubmit={handleICloudSubmit}
        isLoading={isDiscovering}
      />
      <DiscoveryDialog
        isDiscovering={isDiscovering}
        discoveredSubscriptions={discoveredSubscriptions}
        teaser={teaser}
        emailCount={emailCount}
        error={error}
        warning={warning}
        clearDiscovery={clearDiscovery}
        retry={retry}
        providerName="iCloud"
        aiProvider={aiProvider}
        aiModel={aiModel}
        isLoadingAI={isLoadingAI}
        isByok={hasByokActive}
      />
    </div>
  )
}
