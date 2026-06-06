import { blogPosts } from '@/lib/config/blog'
import { ImageResponse } from 'next/og'

// fallow-ignore-next-line unused-export
export const runtime = 'edge'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)

  const title = post?.title ?? 'Suprascribe Blog'
  const description = post?.description ?? 'Subscription management tips and guides.'

  return new ImageResponse(
    <div
      style={{
        background: '#0a0a0a',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 80,
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#ffffff" fillOpacity="0.1" />
          <path
            d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
            fill="#ffffff"
          />
          <circle cx="12" cy="12" r="3" fill="#ffffff" />
        </svg>
        <span style={{ fontSize: 20, color: '#888888', letterSpacing: 0.5 }}>Suprascribe Blog</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div
          style={{
            fontSize: title.length > 50 ? 44 : 52,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.15,
            letterSpacing: -1,
            maxWidth: 900,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 22,
            color: '#888888',
            lineHeight: 1.4,
            maxWidth: 800,
          }}
        >
          {description}
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <div
          style={{
            background: '#1a1a1a',
            border: '1px solid #333',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#aaaaaa',
            fontSize: 14,
          }}
        >
          suprascribe.com
        </div>
      </div>
    </div>,
    { ...size },
  )
}
