import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Route prefixes whose server code reads the Supabase session, and so need this
 * middleware to refresh the auth cookie before they run - server components cannot
 * set cookies themselves.
 *
 * Everything else - the landing page, the blog, the SEO and marketing pages - is
 * prerendered and user-agnostic. Running the check there bought nothing and cost a
 * signed-in visitor a getUser() round-trip to Supabase (~100-180ms locally) on every
 * navigation between marketing pages. Anonymous visitors and crawlers were never
 * charged the network hop - getUser() short-circuits with no auth cookie to validate.
 *
 * New public pages are therefore free by default; a new signed-in area has to be
 * added here (and to `PROTECTED_ROUTES` if anonymous visitors must be bounced).
 */
const SESSION_ROUTES = ['/api', '/auth', '/dashboard', '/support']

/** Subset of `SESSION_ROUTES` that anonymous visitors are redirected away from. */
const PROTECTED_ROUTES = ['/dashboard', '/support']

const matchesPrefix = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))

/** Supabase's own cookie name, chunked into `.0`, `.1`, ... once the JWT grows. */
const AUTH_COOKIE = /^sb-.+-auth-token(\.\d+)?$/

const hasAuthCookie = (request: NextRequest) =>
  request.cookies.getAll().some((cookie) => AUTH_COOKIE.test(cookie.name))

export async function middleware(request: NextRequest) {
  // No TRACE/TRACK guard here on purpose: neither method ever reaches this function.
  // The edge runtime throws "'TRACE' HTTP method is unsupported" while building the
  // Request, and Node's HTTP parser rejects TRACK outright, so they are refused with
  // a 500 and a 400 before any of our code runs. Nothing is reflected back to the
  // caller either way, which is the point of blocking them. Turning those into a
  // clean 405 is a job for the proxy in front of the app, not for middleware.
  const { pathname } = request.nextUrl

  // Signed-in visitors have no use for the marketing page, so send them to the app.
  // The cookie's mere presence decides this - validating it here would cost a
  // getUser() round-trip to prove something /dashboard is about to re-check anyway,
  // and a forged cookie buys nothing: it lands on the guard below. Crawlers and
  // logged-out visitors carry no such cookie and get the prerendered landing page.
  if (pathname === '/' && hasAuthCookie(request)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  if (!matchesPrefix(pathname, SESSION_ROUTES)) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && matchesPrefix(pathname, PROTECTED_ROUTES)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    const redirect = NextResponse.redirect(url)

    // Drop the cookie that got them here. Without this, an expired session traps the
    // visitor: the redirect above sends `/` to `/dashboard`, which lands here and
    // bounces to `/login`, and the landing page stays unreachable until the stale
    // cookie expires on its own.
    request.cookies
      .getAll()
      .filter((cookie) => AUTH_COOKIE.test(cookie.name))
      .forEach((cookie) => redirect.cookies.delete(cookie.name))

    return redirect
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    // .txt covers robots.txt, llms.txt, and the IndexNow key file - all public,
    // so none of them should pay for a Supabase getUser() round-trip.
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|sw.js|manifest.webmanifest|\\.well-known|.*\\.(?:txt|svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
