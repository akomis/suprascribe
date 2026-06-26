'use client'

import { Spinner } from '@/components/ui/spinner'
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
  const fetchedLogoUrl = useLogo(
    resolvedLogoUrl !== undefined ? undefined : name,
    resolvedLogoUrl !== undefined ? undefined : serviceUrl,
  )
  const logoUrl = resolvedLogoUrl !== undefined ? resolvedLogoUrl : fetchedLogoUrl
  const [logoError, setLogoError] = React.useState(false)
  const [isLoaded, setIsLoaded] = React.useState(false)

  React.useEffect(() => {
    setIsLoaded(false)
    setLogoError(false)
  }, [logoUrl])

  if (logoUrl && !logoError) {
    if (naturalSize) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${name} logo`}
          loading="lazy"
          style={{ maxWidth: size, maxHeight: size, width: 'auto', height: 'auto' }}
          className={cn('object-contain', className)}
          onError={() => setLogoError(true)}
        />
      )
    }
    return (
      <span
        className={cn('relative inline-flex items-center justify-center', className)}
        style={className ? undefined : { width: size, height: size }}
      >
        {!isLoaded && (
          <Spinner
            className="absolute size-auto text-muted-foreground"
            style={{ width: '60%', height: '60%' }}
          />
        )}
        <Image
          src={logoUrl}
          alt={`${name} logo`}
          width={size}
          height={size}
          className={cn('h-full w-full object-contain transition-opacity', {
            'opacity-0': !isLoaded,
          })}
          unoptimized
          onLoad={() => setIsLoaded(true)}
          onError={() => setLogoError(true)}
        />
      </span>
    )
  }

  return (
    <Box
      className={cn('text-muted-foreground', fallbackClassName)}
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  )
}
