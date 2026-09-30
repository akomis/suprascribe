'use client'

import ICloudDiscoveryDialog from '@/components/dashboard/discovery/ICloudDiscoveryDialog'
import { ImapDiscoveryHandler } from '@/components/dashboard/discovery/ImapDiscoveryHandler'
import ProviderDiscoverButton from '@/components/dashboard/discovery/ProviderDiscoverButton'
import { redirectToOAuth } from '@/lib/discovery/oauth-redirect'
import { useDiscoveryRuns } from '@/lib/hooks/discovery/useDiscoveryRuns'
import { useTeaserStatus } from '@/lib/hooks/discovery/useTeaserStatus'
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
import { cn } from '@/lib/utils'
import { Badge } from '../ui/badge'
import { Spinner } from '../ui/spinner'
import { DiscoveryDialog } from './discovery/DiscoveryDialog'
import { ExhaustedDiscoveriesMessage } from './discovery/ExhaustedDiscoveriesMessage'
import { SetupBYOKPrompt } from './discovery/SetupBYOKPrompt'
import { TeaserUsedCard } from './discovery/TeaserUsedCard'

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
  const showUsage =
    !hasByokActive && !isFreeTeaser && !!rateLimitInfo && rateLimitInfo.discoveriesUsed > 0

  return (
    <>
      <div
        className={cn(
          'fade-on-mount relative flex flex-col gap-4 rounded-lg border border-dashed p-4 w-[300px] sm:w-[350px] md:w-[450px]',
          // Room for the usage control on the bottom border, above and below the line.
          showUsage && 'mb-4 pb-8',
        )}
      >
        {showUsage && (
          // Sits on the card's bottom border, like the source marks on the landing
          // FeatureCard, so it reads as a label of the card rather than its content.
          <div className="absolute right-4 bottom-0 z-10 flex translate-y-1/2 items-center text-xs text-muted-foreground">
            <Link
              href="/limits"
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${rateLimitInfo.discoveriesUsed} of ${rateLimitInfo.maxDiscoveries} discoveries used`}
              title="Discoveries used"
            >
              <Badge
                variant="outline"
                className="h-7 gap-0 bg-background text-xs px-2.5 py-0 tabular-nums rounded-r-none hover:bg-accent transition-colors"
              >
                <span
                  className={
                    rateLimitInfo.discoveriesUsed > 20 ? 'text-destructive' : 'text-primary'
                  }
                >
                  {rateLimitInfo.discoveriesUsed}
                </span>
                <span className="text-muted-foreground">/{rateLimitInfo.maxDiscoveries} used</span>
              </Badge>
            </Link>
            <ConfigureApiKeyButton
              variant="outline"
              size="sm"
              className="h-7 text-xs px-3 rounded-l-none border-l-0 bg-background dark:bg-background"
              label="Configure"
            />
          </div>
        )}
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
            We only read subject, sender and body of emails matching our billing search, and our
            system extracts the subscription details. Your emails are never stored, and neither are
            your credentials.
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

  const {
    hasAccess: hasDiscoveryAccess,
    canRunFreeTeaser,
    isLoading: isAccessLoading,
  } = useAutoDiscoveryAccess()
  const { status: teaserStatus } = useTeaserStatus()
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
    warningKind,
    clearDiscovery,
    retry,
    startDiscovery,
  } = useImapDiscovery()

  const isLoadingSettings = isRateLimitLoading || isByokLoading || isAccessLoading
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
      ) : !hasDiscoveryAccess ? (
        // Letting a BASIC user start another scan here would only earn them a
        // limit-reached warning, so the providers stay visible but locked.
        teaserStatus?.freeScanUsed ? (
          <TeaserUsedCard />
        ) : (
          <SetupBYOKPrompt />
        )
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
        warningKind={warningKind}
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
