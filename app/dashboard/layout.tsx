import { PostHogIdentifier } from '@/components/PostHogIdentifier'
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt'
import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'
import QueryProvider from '@/providers/QueryProvider'
import { isFeatureEnabled } from '@/lib/config/features'
import { GeistMono } from 'geist/font/mono'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

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
