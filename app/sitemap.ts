import { blogPosts } from '@/lib/config/blog'
import { competitors } from '@/lib/config/comparisons'
import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.suprascribe.com',
      lastModified: new Date('2026-06-02'),
    },
    {
      url: 'https://www.suprascribe.com/blog',
      lastModified: new Date(
        blogPosts.reduce((latest, post) => {
          const d = post.updatedAt ?? post.publishedAt
          return d > latest ? d : latest
        }, '2020-01-01'),
      ),
    },
    ...blogPosts.map((post) => ({
      url: `https://www.suprascribe.com/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.publishedAt),
    })),
    {
      url: 'https://www.suprascribe.com/demo',
      lastModified: new Date('2026-05-16'),
    },
    {
      url: 'https://www.suprascribe.com/one-time-scan',
      lastModified: new Date('2026-06-15'),
    },
    {
      url: 'https://www.suprascribe.com/free-subscription-tracker',
      lastModified: new Date('2026-05-27'),
    },
    {
      url: 'https://www.suprascribe.com/free-subscription-manager',
      lastModified: new Date('2026-05-27'),
    },
    {
      url: 'https://www.suprascribe.com/subscription-management-app',
      lastModified: new Date('2026-05-27'),
    },
    {
      url: 'https://www.suprascribe.com/gmail-subscription-tracker',
      lastModified: new Date('2026-05-27'),
    },
    {
      url: 'https://www.suprascribe.com/rocket-money-alternative',
      lastModified: new Date('2026-05-27'),
    },
    {
      url: 'https://www.suprascribe.com/compare',
      lastModified: new Date('2026-05-27'),
    },
    ...competitors.map((c) => ({
      url: `https://www.suprascribe.com/compare/${c.slug}`,
      lastModified: new Date('2026-05-27'),
    })),
    {
      url: 'https://www.suprascribe.com/faq',
      lastModified: new Date('2026-05-16'),
    },
    {
      url: 'https://www.suprascribe.com/safety',
      lastModified: new Date('2026-05-16'),
    },
    {
      url: 'https://www.suprascribe.com/limits',
      lastModified: new Date('2026-05-16'),
    },
    {
      url: 'https://www.suprascribe.com/contact',
      lastModified: new Date('2026-05-16'),
    },
    {
      url: 'https://www.suprascribe.com/terms-and-privacy',
      lastModified: new Date('2026-06-02'),
    },
    {
      url: 'https://www.suprascribe.com/imap',
      lastModified: new Date('2026-05-16'),
    },
  ]
}
