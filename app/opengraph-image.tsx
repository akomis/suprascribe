import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Suprascribe - Free Subscription Tracker & Manager'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: '#0a0a0a',
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
        gap: 24,
        padding: 80,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#ffffff" fillOpacity="0.1" />
          <path
            d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"
            fill="#ffffff"
          />
          <circle cx="12" cy="12" r="3" fill="#ffffff" />
        </svg>
        <span style={{ fontSize: 40, fontWeight: 700, color: '#ffffff', letterSpacing: -1 }}>
          Suprascribe
        </span>
      </div>
      <p
        style={{
          fontSize: 22,
          color: '#888888',
          textAlign: 'center',
          maxWidth: 700,
          margin: 0,
          lineHeight: 1.4,
        }}
      >
        Automatically discover and manage your subscriptions. Free forever - Pro with a one-time €5
        purchase.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 16,
          marginTop: 8,
        }}
      >
        {['Gmail', 'Outlook', 'iCloud', 'IMAP'].map((provider) => (
          <div
            key={provider}
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 8,
              padding: '8px 16px',
              color: '#aaaaaa',
              fontSize: 14,
            }}
          >
            {provider}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  )
}
