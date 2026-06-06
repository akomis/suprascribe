import { AffiliateTracker } from '@/components/AffiliateTracker'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { CurrencyProvider } from '@/lib/hooks/useCurrency'
import { cn } from '@/lib/utils'
import localFont from 'next/font/local'
import { Suspense } from 'react'

const GeistSans = localFont({
  src: '../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2',
  variable: '--font-geist-sans',
  weight: '100 900',
  display: 'optional',
})
import { GITHUB_URL } from '@/lib/config/urls'
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
    locale: 'en_US',
    title: 'Suprascribe - Free Subscription Tracker & Manager',
    description: siteDescription,
    url: 'https://www.suprascribe.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Suprascribe - Free Subscription Tracker & Manager',
    description: siteDescription,
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
      logo: {
        '@type': 'ImageObject',
        url: 'https://www.suprascribe.com/logo.jpg',
        width: 512,
        height: 512,
      },
      sameAs: [GITHUB_URL],
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
          price: '10',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '<') }}
        />
      </head>
      <body className={cn(GeistSans.variable, 'antialiased')}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <TooltipProvider>
            <CurrencyProvider>
              <main>{children}</main>
              <Suspense fallback={null}>
                <AffiliateTracker />
              </Suspense>
              <Toaster />
            </CurrencyProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
