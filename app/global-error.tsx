'use client'

import posthog from 'posthog-js'
import { useEffect } from 'react'
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    posthog.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'sans-serif',
          margin: 0,
          gap: '1rem',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/" style={{ display: 'inline-block', marginBottom: '0.5rem', opacity: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpg"
            alt="Suprascribe"
            width={48}
            height={48}
            style={{ borderRadius: '8px', display: 'block' }}
          />
        </a>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Something went wrong</h1>
        <button
          onClick={reset}
          style={{
            cursor: 'pointer',
            color: 'inherit',
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
          }}
        >
          Try again
        </button>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/"
          style={{
            color: 'inherit',
            border: '1px solid currentColor',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            textDecoration: 'none',
          }}
        >
          Return Home
        </a>
      </body>
    </html>
  )
}
