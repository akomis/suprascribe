import QueryProvider from '@/providers/QueryProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Discover Subscriptions',
  description: 'Try the Suprascribe subscription discovery flow.',
  robots: { index: false, follow: false },
}

export default function DiscoverLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
