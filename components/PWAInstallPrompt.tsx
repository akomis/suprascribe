'use client'

import { Button } from '@/components/ui/button'
import { usePWAInstall } from '@/providers/PWAInstallProvider'
import { Download, X } from 'lucide-react'

export function PWAInstallPrompt() {
  const { isInstalled, isIOS, canInstall, bannerDismissed, promptInstall, dismissBanner } =
    usePWAInstall()

  const visible = !bannerDismissed && !isInstalled && (canInstall || isIOS)

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border bg-card px-4 py-3 shadow-lg sm:bottom-6 sm:right-6">
      <button
        onClick={dismissBanner}
        className="absolute right-2 top-2 rounded p-1 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
      <div className="flex items-start gap-3 pr-4">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Download className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">Install Suprascribe</p>
          {isIOS ? (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Tap <span className="font-medium">Share</span> then{' '}
              <span className="font-medium">Add to Home Screen</span>
            </p>
          ) : (
            <p className="mt-0.5 text-xs text-muted-foreground">
              Use Suprascribe as desktop or mobile app on your device. Same functionality as the web
              app, just quicker native access.
            </p>
          )}
        </div>
      </div>
      {!isIOS && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={dismissBanner}>
            Dismiss
          </Button>
          <Button size="sm" className="flex-1" onClick={() => void promptInstall()}>
            Proceed
          </Button>
        </div>
      )}
    </div>
  )
}
