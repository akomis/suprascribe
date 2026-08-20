import { NextRequest, NextResponse } from 'next/server'

/**
 * Brandfetch serves its own logo as the default placeholder for unknown brands,
 * which loads with a 200 and never triggers an image `onError`. Forcing the 404
 * fallback makes a miss detectable so the UI can render its own fallback icon.
 */
function buildCdnUrl(identifier: string, apiKey: string): string {
  return `https://cdn.brandfetch.io/${encodeURIComponent(identifier)}/fallback/404?c=${encodeURIComponent(apiKey)}`
}

export async function GET(request: NextRequest) {
  try {
    const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer')

    if (allowedOrigin && requestOrigin) {
      try {
        const allowedUrl = new URL(allowedOrigin)
        const requestUrl = new URL(requestOrigin)
        const isLocalhost =
          requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1'
        const allowedHostname = allowedUrl.hostname.replace(/^www\./, '')
        const requestHostname = requestUrl.hostname.replace(/^www\./, '')

        if (!isLocalhost && requestHostname !== allowedHostname) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } catch {
        // malformed URL - allow through, downstream auth handles it
      }
    }
    const searchParams = request.nextUrl.searchParams
    const queries = searchParams.getAll('q').filter(Boolean)

    if (queries.length === 0) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.BRANDFETCH_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Logo API key not configured' }, { status: 500 })
    }

    const logoUrls = queries.map((query) => buildCdnUrl(query, apiKey))

    return NextResponse.json(
      { logoUrls, logoUrl: logoUrls[0] },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400',
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    )
  }
}
