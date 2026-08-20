import QueryProvider from '@/providers/QueryProvider'
import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/utils/metadata'

export const metadata: Metadata = buildMetadata({
  title: 'Live Demo - See Suprascribe in Action',
  description:
    'Try Suprascribe without signing up. Explore the subscription dashboard, test spending insights, and see how the subscription manager works - no account needed.',
  path: '/demo',
})

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
