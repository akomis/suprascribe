'use client'

import { STORAGE_KEYS } from '@/lib/config/storage-keys'
import * as React from 'react'

// Superseded by STORAGE_KEYS.pwaInstallDismissed. Still read so users who
// already dismissed the banner don't get it back.
const LEGACY_DISMISSED_KEY = 'pwa-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type InstallOutcome = 'accepted' | 'dismissed' | 'unavailable'

interface PWAInstallContextValue {
  /** Running in the installed app window right now. */
  isStandalone: boolean
  /** Standalone, or installed at some point on this device. */
  isInstalled: boolean
  isIOS: boolean
  /** A native install prompt is available to fire. */
  canInstall: boolean
  bannerDismissed: boolean
  promptInstall: () => Promise<InstallOutcome>
  dismissBanner: () => void
}

const PWAInstallContext = React.createContext<PWAInstallContextValue | undefined>(undefined)

function readStandalone() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function PWAInstallProvider({ children }: { children: React.ReactNode }) {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isStandalone, setIsStandalone] = React.useState(false)
  const [wasInstalled, setWasInstalled] = React.useState(false)
  const [isIOS, setIsIOS] = React.useState(false)
  const [bannerDismissed, setBannerDismissed] = React.useState(false)

  React.useEffect(() => {
    setIsStandalone(readStandalone())
    setIsIOS(
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
        !(window as Window & { MSStream?: unknown }).MSStream,
    )

    try {
      setWasInstalled(localStorage.getItem(STORAGE_KEYS.pwaInstalled) === '1')
      setBannerDismissed(
        localStorage.getItem(STORAGE_KEYS.pwaInstallDismissed) === '1' ||
          localStorage.getItem(LEGACY_DISMISSED_KEY) !== null,
      )
    } catch {
      // localStorage unavailable (private mode, blocked cookies) - defaults stand
    }

    const displayMode = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = () => setIsStandalone(readStandalone())

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setDeferredPrompt(null)
      setWasInstalled(true)
      try {
        localStorage.setItem(STORAGE_KEYS.pwaInstalled, '1')
      } catch {
        // ignore
      }
    }

    displayMode.addEventListener('change', handleDisplayModeChange)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    return () => {
      displayMode.removeEventListener('change', handleDisplayModeChange)
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = React.useCallback(async (): Promise<InstallOutcome> => {
    if (!deferredPrompt) return 'unavailable'
    // The event can only be used once, so drop it regardless of the outcome.
    setDeferredPrompt(null)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setWasInstalled(true)
    return outcome
  }, [deferredPrompt])

  const dismissBanner = React.useCallback(() => {
    setBannerDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEYS.pwaInstallDismissed, '1')
    } catch {
      // ignore
    }
  }, [])

  const value = React.useMemo(
    () => ({
      isStandalone,
      isInstalled: isStandalone || wasInstalled,
      isIOS,
      canInstall: deferredPrompt !== null,
      bannerDismissed,
      promptInstall,
      dismissBanner,
    }),
    [
      isStandalone,
      wasInstalled,
      isIOS,
      deferredPrompt,
      bannerDismissed,
      promptInstall,
      dismissBanner,
    ],
  )

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>
}

export function usePWAInstall() {
  const context = React.useContext(PWAInstallContext)
  if (context === undefined) {
    throw new Error('usePWAInstall must be used within a PWAInstallProvider')
  }
  return context
}
