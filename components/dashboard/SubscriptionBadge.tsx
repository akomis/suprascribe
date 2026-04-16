import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useLogo } from '@/lib/hooks/useLogo'
import { cn } from '@/lib/utils'
import { Box } from 'lucide-react'
import Image from 'next/image'
import * as React from 'react'

interface SubscriptionBadgeProps {
  name: string
  url?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  daysUntilRenewal?: number
  onClick?: () => void
}

export function SubscriptionBadge({
  name,
  url,
  showLabel = false,
  size = 'md',
  daysUntilRenewal,
  onClick,
}: SubscriptionBadgeProps) {
  const logoUrl = useLogo(name, url)
  const [logoError, setLogoError] = React.useState(false)

  const sizeClasses = {
    sm: {
      badge: showLabel
        ? 'text-xs gap-1 sm:gap-1.5 bg-white dark:bg-neutral-900 w-fit px-2 py-0.5'
        : 'gap-1 bg-white dark:bg-neutral-900 w-fit p-0.5 sm:p-1 cursor-default',
      logo: 'size-3 sm:size-4',
      iconFallback: 'size-2 sm:size-3',
    },
    md: {
      badge: showLabel
        ? 'text-sm md:text-md font-light gap-1 sm:gap-2 bg-white dark:bg-neutral-900 w-fit'
        : 'gap-1 sm:gap-2 bg-white dark:bg-neutral-900 w-fit p-1 sm:p-1.5 cursor-default',
      logo: 'size-4 sm:size-6',
      iconFallback: 'size-3 sm:size-4',
    },
    lg: {
      badge: showLabel
        ? 'text-base md:text-lg font-medium gap-2 sm:gap-3 bg-white dark:bg-neutral-900 w-fit px-3 py-1'
        : 'gap-2 sm:gap-3 bg-white dark:bg-neutral-900 w-fit p-2 cursor-default',
      logo: 'size-6 sm:size-8',
      iconFallback: 'size-5 sm:size-6',
    },
  }

  const currentSize = sizeClasses[size]

  const badgeContent = (
    <Badge
      variant="outline"
      className={cn(
        currentSize.badge,
        onClick && 'cursor-pointer hover:bg-accent transition-colors',
      )}
      onClick={onClick}
    >
      {logoUrl && (
        <div
          className={cn(
            'flex items-center justify-center rounded overflow-hidden flex-shrink-0',
            currentSize.logo,
          )}
        >
          {!logoError ? (
            <Image
              src={logoUrl}
              alt={`${name} logo`}
              className="size-full object-contain"
              onError={() => setLogoError(true)}
              width={size === 'lg' ? 32 : 24}
              height={size === 'lg' ? 32 : 24}
              unoptimized
            />
          ) : (
            <Box
              className={cn('text-muted-foreground', currentSize.iconFallback)}
              aria-hidden="true"
            />
          )}
        </div>
      )}
      {showLabel && <span className="truncate">{name}</span>}
    </Badge>
  )

  if (showLabel) {
    return badgeContent
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
      <TooltipContent>
        {daysUntilRenewal !== undefined ? (
          <div className="flex flex-col gap-0.5 text-center">
            <p className="font-medium">{name}</p>
            <p className="text-muted-foreground text-xs">
              {daysUntilRenewal === 0 ? 'Renews today' : `Renews in ${daysUntilRenewal}d`}
            </p>
          </div>
        ) : (
          <p>{name}</p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
