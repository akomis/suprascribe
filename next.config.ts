import withBundleAnalyzer from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import path from 'path'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Content-Security-Policy',
    value: `frame-ancestors 'none'; form-action 'self'; object-src 'none'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com${process.env.NODE_ENV !== 'production' ? " 'unsafe-eval'" : ''}`,
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Server', value: 'webserver' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(process.env.NODE_ENV === 'production'
    ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]
    : []),
]

const nextConfig = {
  poweredByHeader: false,
  // Put metadata in <head> for every user agent, not just the ones on Next's built-in
  // HTML-limited list. On dynamic routes Next 15 streams metadata into <body> by default,
  // and that list leaves out Googlebot, Screaming Frog and the AI crawlers - so /login
  // (dynamic, it reads searchParams) served its `noindex` outside <head> to all of them.
  // The only dynamic routes are /login and /dashboard/*, whose metadata is a static
  // object, so blocking on it costs nothing. Revisit if one of them grows a slow
  // generateMetadata.
  htmlLimitedBots: /.*/,
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'suprascribe.com' }],
        destination: 'https://www.suprascribe.com/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/microsoft-identity-association',
        destination: '/.well-known/microsoft-identity-association.json',
      },
      {
        source: '/supraph/static/:path*',
        destination: 'https://eu-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/supraph/:path*',
        destination: 'https://eu.i.posthog.com/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      {
        source: '/.well-known/microsoft-identity-association',
        headers: [
          { key: 'Content-Type', value: 'application/json; charset=utf-8' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        // IndexNow key file. Its name is its contents; rotating the key means
        // renaming public/<key>.txt, rewriting it, and updating this source.
        source: '/87ba2ab97f619db3326326912d92d6eb.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          // Never cache the worker script itself, or clients pin a stale SW
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: '/robots.txt',
        headers: [
          { key: 'Content-Type', value: 'text/plain; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/sitemap.xml',
        headers: [
          { key: 'Content-Type', value: 'application/xml; charset=utf-8' },
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/:file(.*\\.(?:jpg|jpeg|png|svg|webp|ico))',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
        ],
      },
      {
        source: '/dashboard(.*)',
        headers: [{ key: 'Cache-Control', value: 'private, no-store' }],
      },
      {
        source: '/api/(subscriptions|user|stripe)(.*)',
        headers: [{ key: 'Content-Type', value: 'application/json; charset=utf-8' }],
      },
      {
        source: '/api/(subscriptions|user|discovery)(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, private' }],
      },
      {
        source: '/api/stripe/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ]
  },
} satisfies NextConfig

export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(nextConfig)
