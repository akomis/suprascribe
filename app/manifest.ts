import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Suprascribe',
    short_name: 'Suprascribe',
    description:
      'Find and track all your subscriptions by scanning Gmail, Outlook, iCloud, or any IMAP inbox.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    orientation: 'portrait',
    icons: [
      {
        src: '/logo.jpg',
        sizes: '1000x1000',
        type: 'image/jpeg',
        purpose: 'any',
      },
      {
        src: '/logo.jpg',
        sizes: '1000x1000',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  }
}
