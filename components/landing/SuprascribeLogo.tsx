import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface SuprascribeLogoProps {
  className?: string
  size?: number
  layout?: 'row' | 'column'
}

/**
 * Home link, used in the site footer and so present on every marketing, SEO and blog
 * page. It deliberately renders nothing account-aware: pairing it with `TierBadge`
 * here made every one of those pages statically import the badge, its hooks and the
 * whole Supabase browser SDK, for a badge only the dashboard ever showed. The
 * dashboard composes the two itself instead.
 */
export function SuprascribeLogo({
  className = '',
  size = 24,
  layout = 'row',
}: SuprascribeLogoProps) {
  const isColumn = layout === 'column'

  return (
    <div className={cn('flex flex-col items-center gap-1', className)}>
      <div className="flex items-center justify-center gap-1">
        <Link
          href="/"
          className={cn(
            'flex items-center hover:opacity-80 transition-opacity',
            isColumn ? 'flex-col gap-2' : 'gap-1.5',
          )}
        >
          <Image
            src="/logo.jpg"
            alt="Suprascribe Logo"
            width={size}
            height={size}
            className="rounded-lg"
            priority
          />
        </Link>
      </div>
    </div>
  )
}
