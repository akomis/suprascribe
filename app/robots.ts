import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: ['GPTBot', 'Claude-Web', 'anthropic-ai', 'CCBot', 'Googlebot-Extended'],
        allow: '/',
      },
    ],
    sitemap: 'https://www.suprascribe.com/sitemap.xml',
  }
}
