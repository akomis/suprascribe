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

const siteDescription =
  'Suprascribe finds and tracks all your subscriptions by scanning Gmail, Outlook, iCloud, or any IMAP inbox. Free forever, one-time Pro upgrade.'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.suprascribe.com'),
  title: {
    default: 'Suprascribe - Free Subscription Tracker & Manager',
    template: '%s | Suprascribe',
  },
  description: siteDescription,
  openGraph: {
    type: 'website',
    siteName: 'Suprascribe',
    title: 'Suprascribe - Free Subscription Tracker & Manager',
    description: siteDescription,
    url: 'https://www.suprascribe.com',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Suprascribe - Free Subscription Tracker & Manager',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suprascribe - Free Subscription Tracker & Manager',
    description: siteDescription,
    images: ['/og-image.png'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://www.suprascribe.com/#website',
      name: 'Suprascribe',
      url: 'https://www.suprascribe.com',
      description: siteDescription,
    },
    {
      '@type': 'Organization',
      '@id': 'https://www.suprascribe.com/#organization',
      name: 'Suprascribe',
      url: 'https://www.suprascribe.com',
      sameAs: ['https://github.com/akomis/suprascribe'],
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Suprascribe',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      url: 'https://www.suprascribe.com',
      description: siteDescription,
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          name: 'Basic',
          description: 'Free forever - core subscription tracking features',
        },
        {
          '@type': 'Offer',
          price: '5',
          priceCurrency: 'EUR',
          name: 'Pro',
          description: 'One-time purchase for advanced features',
        },
      ],
    },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
