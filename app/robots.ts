import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/api/',
          '/confirmation',
          '/login',
          '/reset-password',
          '/demo-discovery',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/demo-discovery'],
      },
    ],
    sitemap: 'https://www.suprascribe.com/sitemap.xml',
  }
}
