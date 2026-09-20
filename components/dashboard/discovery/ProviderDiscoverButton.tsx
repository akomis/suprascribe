'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type ProviderDiscoverButtonProps = {
  displayName: string
  logoQuery: string
  /** Local static logo path. When set, skips the remote logo fetch. */
  logoSrc?: string
  onClick: () => void
  disabled?: boolean
  isLoading?: boolean
  className?: string
  /** Why the button is locked. Setting it locks the button. */
  tooltipContent?: string | null
  /**
   * Where a locked button leads instead of running a scan - the upgrade dialog, for
   * a tier lock. Without it a locked button stays inert, which is what a rate limit
   * wants: waiting is the only way out of that one.
   */
  onLockedClick?: () => void
}

function ProviderDiscoverButton({
  displayName,
  logoQuery,
  logoSrc,
  onClick,
  disabled = false,
  isLoading = false,
  className,
  tooltipContent,
  onLockedClick,
}: ProviderDiscoverButtonProps) {
  // Covers both locks this button carries: out of discoveries, and not on PRO.
  const isLocked = !!tooltipContent

  const button = (
    <Button
      variant="outline"
      className={cn(
        'aspect-square h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 flex flex-col items-center justify-center gap-1 sm:gap-2 hover:scale-105 transition-transform disabled:cursor-not-allowed',
        isLocked && 'opacity-50',
        className,
      )}
      onClick={isLocked ? onLockedClick : onClick}
      disabled={disabled || isLoading || (isLocked && !onLockedClick)}
    >
      {isLoading ? (
        <Spinner className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
      ) : (
        <div className="flex flex-col gap-0.5 sm:gap-1 items-center">
          <ServiceLogo
            name={logoQuery}
            resolvedLogoUrl={logoSrc}
            size={48}
            className="object-contain rounded-lg w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
          />
          <span className="font-medium text-xs sm:text-sm">{displayName}</span>
        </div>
      )}
    </Button>
  )

  if (isLocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">{button}</span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[200px] text-center">
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return button
}

export default ProviderDiscoverButton
