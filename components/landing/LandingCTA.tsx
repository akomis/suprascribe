import { Button } from '@/components/ui/button'
import Link from 'next/link'

/**
 * The hero's call to action. Deliberately has no idea whether anyone is signed in:
 * middleware redirects visitors carrying a Supabase auth cookie from `/` straight to
 * `/dashboard`, so this only ever renders for logged-out visitors. Resolving the
 * session here as well would only re-derive what the redirect already settled, and
 * would cost the marketing page a client component and a hydration pass to render a
 * button nobody ever sees.
 */
export function LandingCTA() {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center">
        <Link href="/login?tab=signup">
          <Button size="lg" className="text-sm sm:text-base rounded-r-none">
            Sign Up
          </Button>
        </Link>
        <Link href="/login?tab=signin">
          <Button
            size="lg"
            variant="secondary"
            className="text-sm sm:text-base rounded-l-none border-l-0"
          >
            Sign In
          </Button>
        </Link>
      </div>

      <Link href="/demo">
        <Button size="lg" variant="link" className="text-shadow-neutral-400 text-xs underline">
          Dashboard Demo
        </Button>
      </Link>
    </div>
  )
}
