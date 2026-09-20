import { PostHogIdentifier } from '@/components/PostHogIdentifier'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'
import QueryProvider from '@/providers/QueryProvider'
import { isFeatureEnabled } from '@/lib/config/features'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/lib/utils'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

/**
 * The signed-in area carries the noindex now that robots.txt no longer disallows it.
 * Public pages (/limits, /imap) link here, and a disallowed URL that is linked from an
 * indexable page can still be indexed URL-only, because the crawler never fetches it and
 * so never reads a noindex. Anonymous visitors are redirected to /login by middleware
 * either way - robots.txt was never the thing keeping this private.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <InsightsSettingsProvider>
        <PostHogIdentifier />
        <div className={cn(GeistMono.variable)}>{children}</div>
        {isFeatureEnabled('pwa_install') && <PWAInstallPrompt />}
      </InsightsSettingsProvider>
    </QueryProvider>
  )
}
