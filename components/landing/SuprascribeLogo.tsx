import Image from 'next/image'
import Link from 'next/link'
import { TierBadge } from '../dashboard/settings/TierBadge'
import { cn } from '@/lib/utils'

interface SuprascribeLogoProps {
  className?: string
  showTier?: boolean
  size?: number
  layout?: 'row' | 'column'
}

export function SuprascribeLogo({
  className = '',
  showTier = false,
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
        {showTier && <TierBadge />}
      </div>
    </div>
  )
}
