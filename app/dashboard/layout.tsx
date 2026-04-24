import { PostHogIdentifier } from '@/components/PostHogIdentifier'
import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <InsightsSettingsProvider>
      <PostHogIdentifier />
      {children}
    </InsightsSettingsProvider>
  )
}
