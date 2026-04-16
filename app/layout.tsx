import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CurrencyProvider } from '@/lib/hooks/useCurrency'
import { cn } from '@/lib/utils'
import QueryProvider from '@/providers/QueryProvider'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.suprascribe.com'),
  title: {
    default: 'Suprascribe — Free Subscription Tracker & Manager',
    template: '%s | Suprascribe',
  },
  description:
    'Suprascribe automatically finds and tracks all your subscriptions by scanning your email — Gmail, Outlook, iCloud, or any IMAP account. Free forever, with a one-time Pro upgrade.',
  alternates: {
    canonical: '/',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(GeistSans.variable, GeistMono.variable, 'antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <QueryProvider>
              <CurrencyProvider>
                <main className="fade-on-mount">{children}</main>
                <Toaster />
              </CurrencyProvider>
            </QueryProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
