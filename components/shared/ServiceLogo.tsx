'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { useLogo } from '@/lib/hooks/useLogo'
import { cn } from '@/lib/utils'
import { Box } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'

interface ServiceLogoProps {
  name: string
  serviceUrl?: string
  /** Pre-resolved logo URL. When provided, skips the useLogo fetch. */
  resolvedLogoUrl?: string | null
  size?: number
  /** Render at natural image dimensions, capped at size. For hero/decorative use. */
  naturalSize?: boolean
  className?: string
  fallbackClassName?: string
}

export function ServiceLogo({
  name,
  serviceUrl,
  resolvedLogoUrl,
  size = 24,
  naturalSize = false,
  className,
  fallbackClassName,
}: ServiceLogoProps) {
  const isPreResolved = resolvedLogoUrl !== undefined
  const fetched = useLogo(isPreResolved ? undefined : name, isPreResolved ? undefined : serviceUrl)

  const [preResolvedError, setPreResolvedError] = React.useState(false)
  const [preResolvedLoaded, setPreResolvedLoaded] = React.useState(false)

  React.useEffect(() => {
    setPreResolvedError(false)
    setPreResolvedLoaded(false)
  }, [resolvedLogoUrl])

  const src = isPreResolved ? (preResolvedError ? null : (resolvedLogoUrl ?? null)) : fetched.src
  const isLoading = isPreResolved
    ? Boolean(resolvedLogoUrl) && !preResolvedLoaded && !preResolvedError
    : fetched.isLoading
  const handleLoad = isPreResolved ? () => setPreResolvedLoaded(true) : fetched.onLoad
  const handleError = isPreResolved ? () => setPreResolvedError(true) : fetched.onError

  // Callers that pass a className own the sizing; otherwise size the box inline.
  const boxStyle = className ? undefined : { width: size, height: size }

  if (src) {
    if (naturalSize) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`${name} logo`}
          loading="lazy"
          style={{ maxWidth: size, maxHeight: size, width: 'auto', height: 'auto' }}
          className={cn('object-contain', className)}
          onLoad={handleLoad}
          onError={handleError}
        />
      )
    }

    return (
      <span
        className={cn('relative inline-flex items-center justify-center', className)}
        style={boxStyle}
      >
        {isLoading && <Skeleton className="absolute inset-0 size-full rounded" />}
        <Image
          src={src}
          alt={`${name} logo`}
          width={size}
          height={size}
          className={cn('h-full w-full object-contain transition-opacity', {
            'opacity-0': isLoading,
          })}
          unoptimized
          onLoad={handleLoad}
          onError={handleError}
        />
      </span>
    )
  }

  // No candidate to render yet: still resolving, so hold the space with a skeleton.
  if (isLoading) {
    return <Skeleton className={cn('rounded', className)} style={boxStyle} />
  }

  return (
    <Box
      className={cn('text-muted-foreground', fallbackClassName)}
      style={fallbackClassName ? undefined : { width: size, height: size }}
      aria-hidden="true"
    />
  )
}
