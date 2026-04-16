import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const allowedOrigin = process.env.NEXT_PUBLIC_BASE_URL
    const requestOrigin = request.headers.get('origin') || request.headers.get('referer')

    if (allowedOrigin && requestOrigin) {
      const allowedUrl = new URL(allowedOrigin)
      const requestUrl = new URL(requestOrigin)

      if (requestUrl.origin !== allowedUrl.origin) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 })
    }

    const apiKey = process.env.BRANDFETCH_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: 'Logo API key not configured' }, { status: 500 })
    }

    const brandfetchUrl = `https://cdn.brandfetch.io/${encodeURIComponent(query)}?c=${encodeURIComponent(apiKey)}`

    return NextResponse.json(
      { logoUrl: brandfetchUrl },
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
