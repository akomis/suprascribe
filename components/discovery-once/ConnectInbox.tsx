'use client'

import ProviderDiscoverButton from '@/components/dashboard/discovery/ProviderDiscoverButton'
import { redirectToOAuth } from '@/lib/discovery/oauth-redirect'
import { Lock } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

export function ConnectInbox() {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [microsoftLoading, setMicrosoftLoading] = useState(false)

  const googleConfigured = Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID)
  const microsoftConfigured = Boolean(process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID)

  const connectGoogle = () => {
    setGoogleLoading(true)
    try {
      redirectToOAuth({
        authBaseUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
        clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        redirectPath: '/api/discovery/callback/google',
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        flow: 'once',
      })
    } catch {
      toast.error('Authentication Error', { description: 'Failed to start Google authentication' })
      setGoogleLoading(false)
    }
  }

  const connectMicrosoft = () => {
    setMicrosoftLoading(true)
    try {
      redirectToOAuth({
        authBaseUrl: 'https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize',
        clientId: process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID!,
        redirectPath: '/api/discovery/callback/microsoft',
        scope:
          'https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/User.Read offline_access',
        flow: 'once',
        extraParams: { response_mode: 'query' },
      })
    } catch {
      toast.error('Authentication Error', {
        description: 'Failed to start Microsoft authentication',
      })
      setMicrosoftLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center space-y-1">
        <h2 className="text-xl font-semibold">Connect your inbox</h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          Payment received. Choose the inbox to scan - we read only subject lines and parse strictly
          subscription-related data.
        </p>
      </div>
      <div className="flex gap-4 justify-center">
        <ProviderDiscoverButton
          displayName="Gmail"
          logoQuery="google"
          logoSrc="/logos/google.svg"
          onClick={connectGoogle}
          disabled={!googleConfigured}
          isLoading={googleLoading}
        />
        <ProviderDiscoverButton
          displayName="Outlook"
          logoQuery="microsoft"
          logoSrc="/logos/microsoft.svg"
          onClick={connectMicrosoft}
          disabled={!microsoftConfigured}
          isLoading={microsoftLoading}
        />
      </div>
      <a
        href="/safety"
        target="_blank"
        rel="noopener noreferrer"
        className="flex max-w-md rounded-xl gap-4 items-start bg-muted p-4 hover:bg-muted/70 transition-colors"
      >
        <Lock className="size-10 h-fit mt-1 shrink-0" />
        <p className="text-xs text-muted-foreground text-start">
          We will only read your email subject lines and parse strictly subscription-related data.
          None of your credentials or data is saved at any point.
        </p>
      </a>
    </div>
  )
}
