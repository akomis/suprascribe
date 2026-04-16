import { InsightsSettingsProvider } from '@/providers/InsightsSettingsProvider'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <InsightsSettingsProvider>{children}</InsightsSettingsProvider>
}
