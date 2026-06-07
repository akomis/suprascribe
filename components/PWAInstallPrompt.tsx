'use client'

import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (localStorage.getItem(DISMISSED_KEY)) return
    if (window.matchMedia('(display-mode: standalone)').matches) return

    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !(window as Window & { MSStream?: unknown }).MSStream
    if (ios) {
      setIsIOS(true)
      setVisible(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, '1')
    setVisible(false)
  }

  async function install() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border bg-card px-4 py-3 shadow-lg sm:bottom-6 sm:right-6">
      <button
        onClick={dismiss}
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
          <Button size="sm" variant="outline" className="flex-1" onClick={dismiss}>
            Dismiss
          </Button>
          <Button size="sm" className="flex-1" onClick={install}>
            Proceed
          </Button>
        </div>
      )}
    </div>
  )
}
