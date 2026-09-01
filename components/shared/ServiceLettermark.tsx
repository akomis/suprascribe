import { getLettermarkColor, getLettermarkInitials } from '@/lib/utils/lettermark'
import { cn } from '@/lib/utils'
import * as React from 'react'

interface ServiceLettermarkProps {
  name: string
  className?: string
  style?: React.CSSProperties
}

/**
 * Logo stand-in: the service's initials on a deterministic coloured tile.
 * Drawn as SVG so the text scales with whatever box the caller sizes.
 */
export function ServiceLettermark({ name, className, style }: ServiceLettermarkProps) {
  const initials = getLettermarkInitials(name)

  return (
    <svg
      viewBox="0 0 40 40"
      className={cn('shrink-0', className)}
      style={style}
      role="img"
      aria-label={`${name} logo`}
    >
      <rect width="40" height="40" rx="9" fill={getLettermarkColor(name)} />
      <text
        x="20"
        y="21"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize={initials.length > 1 ? 17 : 20}
        fontWeight={600}
        fontFamily="inherit"
        letterSpacing="0.5"
      >
        {initials}
      </text>
    </svg>
  )
}
