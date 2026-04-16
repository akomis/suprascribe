'use client'

import ICloudDiscoveryDialog from '@/components/dashboard/discovery/ICloudDiscoveryDialog'
import { ImapDiscoveryHandler } from '@/components/dashboard/discovery/ImapDiscoveryHandler'
import ProviderDiscoverButton from '@/components/dashboard/discovery/ProviderDiscoverButton'
import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { useDiscoveryRuns } from '@/lib/hooks/discovery/useDiscoveryRuns'
import { useImapDiscovery } from '@/lib/hooks/discovery/useImapDiscovery'
import { useBYOKSettings } from '@/lib/hooks/useBYOKSettings'
import { PROVIDER_NAMES, type LLMProvider } from '@/lib/services/ai-provider'
import { formatRateLimitTooltip } from '@/lib/utils/discovery-rate-limit'
import { Key, Lock } from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import { toast } from 'sonner'
import { Badge } from '../ui/badge'
import { Spinner } from '../ui/spinner'
import { DiscoveryDialog } from './discovery/DiscoveryDialog'
import { ExhaustedDiscoveriesMessage } from './discovery/ExhaustedDiscoveriesMessage'

export function EmailProviderSelection() {
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [isMicrosoftLoading, setIsMicrosoftLoading] = React.useState(false)
  const [showICloudDialog, setShowICloudDialog] = React.useState(false)
  const lastICloudCredentials = React.useRef<{ email: string; password: string } | null>(null)

  const [isGoogleConfigured, setIsGoogleConfigured] = React.useState(false)
  const [isMicrosoftConfigured, setIsMicrosoftConfigured] = React.useState(false)

  const { rateLimitInfo, isLoading: isRateLimitLoading } = useDiscoveryRuns()

  const { keys, activeKeyId, isLoading: isByokLoading } = useBYOKSettings()

  const isLoadingSettings = isRateLimitLoading || isByokLoading
  const hasByokActive = activeKeyId !== null
  const activeKey = keys.find((k) => k.id === activeKeyId)

  const aiProvider = activeKey ? PROVIDER_NAMES[activeKey.provider as LLMProvider] : 'OpenRouter'
  const aiModel = activeKey ? activeKey.model : EMAIL_DISCOVERY_CONFIG.analysisModel.modelName

  const {
    isDiscovering,
    discoveredSubscriptions,
    error,
    warning,
    clearDiscovery,
    retry,
    startDiscovery,
  } = useImapDiscovery()

  const globalRateLimitTooltip =
    !hasByokActive && rateLimitInfo ? formatRateLimitTooltip(rateLimitInfo) : null

  React.useEffect(() => {
    setIsGoogleConfigured(Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID))
    setIsMicrosoftConfigured(Boolean(process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID))
  }, [])

  const handleGoogleClick = () => {
    setIsGoogleLoading(true)
    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
      const redirectUri = `${window.location.origin}/api/discovery/callback/google`
      const scope = 'https://www.googleapis.com/auth/gmail.readonly'

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth')
      authUrl.searchParams.set('client_id', clientId!)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scope)
      const state = crypto.randomUUID()
      document.cookie = `discovery_state=${state}; path=/; max-age=300; SameSite=Lax`
      authUrl.searchParams.set('state', state)

      window.location.href = authUrl.toString()
    } catch {
      toast.error('Authentication Error', {
        description: 'Failed to start Google authentication',
      })
      setIsGoogleLoading(false)
    }
  }

  const handleMicrosoftClick = () => {
    setIsMicrosoftLoading(true)
    try {
      const clientId = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID
      const redirectUri = `${window.location.origin}/api/discovery/callback/microsoft`
      const scope =
        'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read offline_access'

      const authUrl = new URL('https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize')
      authUrl.searchParams.set('client_id', clientId!)
      authUrl.searchParams.set('redirect_uri', redirectUri)
      authUrl.searchParams.set('response_type', 'code')
      authUrl.searchParams.set('scope', scope)
      authUrl.searchParams.set('response_mode', 'query')
      const state = crypto.randomUUID()
      document.cookie = `discovery_state=${state}; path=/; max-age=300; SameSite=Lax`
      authUrl.searchParams.set('state', state)

      window.location.href = authUrl.toString()
    } catch {
      toast.error('Authentication Error', {
        description: 'Failed to start Microsoft authentication',
      })
      setIsMicrosoftLoading(false)
    }
  }

  const handleICloudClick = () => {
    setShowICloudDialog(true)
  }

  const handleICloudSubmit = async (data: { email: string; password: string }) => {
    lastICloudCredentials.current = data
    setShowICloudDialog(false)
    await startDiscovery({
      email: data.email,
      password: data.password,
      server: 'imap.mail.me.com',
      port: 993,
      useTls: true,
    })
  }

  const isExhausted = !hasByokActive && rateLimitInfo && !rateLimitInfo.canDiscover

  return (
    <div className="flex flex-col gap-4 w-[300px] sm:w-[350px] md:w-[450px] mx-auto">
      {isLoadingSettings ? (
        <div className="fade-on-mount flex flex-col gap-4 rounded-lg border border-dashed p-4 items-center justify-center min-h-[200px] w-[300px] md:w-[450px]">
          <Spinner className="size-8" />
        </div>
      ) : isExhausted ? (
        <ExhaustedDiscoveriesMessage rateLimitInfo={rateLimitInfo} />
      ) : (
        <>
          <div className="fade-on-mount flex flex-col gap-4 rounded-lg border border-dashed p-4 w-[300px] sm:w-[350px] md:w-[450px]">
            {/* BYOK indicator */}
            {hasByokActive && activeKey && (
              <div className="text-xs mx-auto py-2 flex items-center gap-1">
                <Badge variant="outline" className="text-xs px-2 pt-0.5 pb-1">
                  <Key className="h-3 w-3" />
                  {activeKey.provider}&apos;s
                  {activeKey.model}
                </Badge>
              </div>
            )}

            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-4 justify-center">
                <ProviderDiscoverButton
                  displayName="Gmail"
                  logoQuery="google"
                  onClick={handleGoogleClick}
                  disabled={!isGoogleConfigured}
                  isLoading={isGoogleLoading}
                  tooltipContent={globalRateLimitTooltip}
                />
                <ProviderDiscoverButton
                  displayName="Outlook"
                  logoQuery="microsoft"
                  onClick={handleMicrosoftClick}
                  disabled={!isMicrosoftConfigured}
                  isLoading={isMicrosoftLoading}
                  tooltipContent={globalRateLimitTooltip}
                />
                <ProviderDiscoverButton
                  displayName="iCloud"
                  logoQuery="apple"
                  onClick={handleICloudClick}
                  isLoading={isDiscovering}
                  tooltipContent={globalRateLimitTooltip}
                />
              </div>

              <div className="text-center">
                <ImapDiscoveryHandler />
              </div>

              {/* Discovery usage + configure button at bottom of card */}
              {!hasByokActive && (
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  {rateLimitInfo && rateLimitInfo.discoveriesUsed > 0 && (
                    <Link
                      href="/limits"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline text-primary"
                    >
                      <span>
                        {rateLimitInfo.discoveriesUsed}/{rateLimitInfo.maxDiscoveries} discoveries
                        used
                      </span>
                    </Link>
                  )}
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
                We will only read your email subject lines and parse strictly subscription-related
                data. None of your credentials or data is saved at any point.
              </p>
            </div>
          </a>
        </>
      )}

      {/* iCloud Dialog */}
      <ICloudDiscoveryDialog
        open={showICloudDialog}
        onOpenChange={setShowICloudDialog}
        onSubmit={handleICloudSubmit}
        isLoading={isDiscovering}
      />

      {/* Discovery Progress Dialog */}
      <DiscoveryDialog
        isDiscovering={isDiscovering}
        discoveredSubscriptions={discoveredSubscriptions}
        error={error}
        warning={warning}
        clearDiscovery={clearDiscovery}
        retry={retry}
        providerName="iCloud"
        aiProvider={aiProvider}
        aiModel={aiModel}
        isByok={hasByokActive}
      />
    </div>
  )
}
