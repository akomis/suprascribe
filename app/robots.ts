import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation', '/login', '/reset-password'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'Claude-Web',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'CCBot',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: ['/dashboard', '/api/', '/confirmation'],
      },
    ],
    sitemap: 'https://www.suprascribe.com/sitemap.xml',
  }
}
