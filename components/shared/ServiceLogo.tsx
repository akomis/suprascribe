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
  className?: string
  fallbackClassName?: string
}

export function ServiceLogo({
  name,
  serviceUrl,
  resolvedLogoUrl,
  size = 24,
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
