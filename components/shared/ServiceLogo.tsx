'use client'

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
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        width={size}
        height={size}
        className={cn('object-contain', className)}
        unoptimized
        onError={() => setLogoError(true)}
      />
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
