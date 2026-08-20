'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import * as React from 'react'

const STARS = [1, 2, 3, 4, 5] as const

interface StarRatingProps {
  value: number | null
  onChange: (rating: number) => void
  disabled?: boolean
  className?: string
  /** Sizing for each star glyph. */
  starClassName?: string
}

export function StarRating({
  value,
  onChange,
  disabled = false,
  className,
  starClassName = 'size-8',
}: StarRatingProps) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  // While hovering, preview the hovered value instead of the committed one.
  const shown = hovered ?? value ?? 0

  return (
    <div className={cn('flex items-center gap-1', className)} onMouseLeave={() => setHovered(null)}>
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          aria-pressed={value === star}
          onMouseEnter={() => !disabled && setHovered(star)}
          onFocus={() => !disabled && setHovered(star)}
          onBlur={() => setHovered(null)}
          onClick={() => onChange(star)}
          className={cn(
            'rounded-md p-0.5 transition-transform focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
            !disabled && 'cursor-pointer hover:scale-110',
            disabled && 'cursor-not-allowed opacity-70',
          )}
        >
          <Star
            className={cn(
              'transition-colors',
              starClassName,
              star <= shown ? 'fill-current' : 'text-muted-foreground',
            )}
          />
        </button>
      ))}
    </div>
  )
}
