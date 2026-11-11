import QueryProvider from '@/providers/QueryProvider'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Payment Confirmed',
  robots: { index: false, follow: false },
}

export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
