import QueryProvider from '@/providers/QueryProvider'

export default function ConfirmationLayout({ children }: { children: React.ReactNode }) {
  return <QueryProvider>{children}</QueryProvider>
}
