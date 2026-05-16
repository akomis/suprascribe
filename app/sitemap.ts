import { blogPosts } from '@/lib/config/blog'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.suprascribe.com/blog',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `https://www.suprascribe.com/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    {
      url: 'https://www.suprascribe.com',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://www.suprascribe.com/demo',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.suprascribe.com/free-subscription-tracker',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://www.suprascribe.com/free-subscription-manager',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://www.suprascribe.com/subscription-management-app',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://www.suprascribe.com/compare',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.suprascribe.com/compare/resubs',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/bobby',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/rocket-money',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/ynab',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/subby',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/tilla',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/subx',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/compare/pocketguard',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/faq',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://www.suprascribe.com/safety',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: 'https://www.suprascribe.com/limits',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://www.suprascribe.com/contact',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: 'https://www.suprascribe.com/terms-and-privacy',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: 'https://www.suprascribe.com/imap',
      lastModified: new Date('2026-05-16'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ]
}
