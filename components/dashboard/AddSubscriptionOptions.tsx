'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAutoDiscoveryAccess } from '@/lib/hooks/useAutoDiscoveryAccess'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { Lock, Mail, PenLine } from 'lucide-react'
import { useEffect } from 'react'

interface AddSubscriptionOptionsProps {
  onSelectAutoDiscover: () => void
  onSelectManual: () => void
  forceDisableAutoDiscovery?: boolean
  disabledTooltipMessage?: string
}

export function AddSubscriptionOptions({
  onSelectAutoDiscover,
  onSelectManual,
  forceDisableAutoDiscovery = false,
  disabledTooltipMessage = 'Email discovery requires sign-in',
}: AddSubscriptionOptionsProps) {
  const {
    hasAccess: hasAutoDiscovery,
    requiresUpgrade: autoDiscoveryRequiresUpgrade,
    isEnabled: isAutoDiscoveryEnabled,
  } = useAutoDiscoveryAccess()
  const { hasAccess: hasManualAdd } = useFeatureAccess('manual_add')

  const isAutoDiscoveryDisabled = forceDisableAutoDiscovery || autoDiscoveryRequiresUpgrade

  useEffect(() => {
    if (hasAutoDiscovery && !hasManualAdd && !forceDisableAutoDiscovery) {
      onSelectAutoDiscover()
    } else if (hasManualAdd && !hasAutoDiscovery && !isAutoDiscoveryEnabled) {
      onSelectManual()
    }
  }, [
    hasAutoDiscovery,
    hasManualAdd,
    isAutoDiscoveryEnabled,
    forceDisableAutoDiscovery,
    onSelectAutoDiscover,
    onSelectManual,
  ])

  if (hasAutoDiscovery && !hasManualAdd && !forceDisableAutoDiscovery) {
    return null
  }

  if (hasManualAdd && !hasAutoDiscovery && !isAutoDiscoveryEnabled) {
    return null
  }

  if (!hasManualAdd && !isAutoDiscoveryEnabled) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-muted-foreground text-sm">No subscription add methods available.</p>
      </div>
    )
  }

  const autoDiscoverButton = (
    <Button
      variant="outline"
      onClick={isAutoDiscoveryDisabled ? undefined : onSelectAutoDiscover}
      disabled={isAutoDiscoveryDisabled}
      className="flex-1 h-auto py-6 px-4 flex flex-col items-center gap-3 hover:bg-accent hover:border-primary/50 relative disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {autoDiscoveryRequiresUpgrade && !forceDisableAutoDiscovery && (
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
            PRO
          </Badge>
          <Lock className="size-3 text-muted-foreground" />
        </div>
      )}
      {forceDisableAutoDiscovery && (
        <div className="absolute top-2 right-2 flex items-center gap-1 text-muted-foreground">
          <Lock className="size-3" />
        </div>
      )}
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <span className="font-medium">Auto-discover</span>
        <span className="text-xs text-muted-foreground">
          {forceDisableAutoDiscovery ? 'Sign in required' : 'Scan your email inbox'}
        </span>
      </div>
    </Button>
  )

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm text-muted-foreground text-center">
        Choose how you want to add your subscription
      </p>

      <div className="flex gap-3">
        {/* Always show auto-discovery if enabled, but disable it if requires upgrade or force-disabled */}
        {isAutoDiscoveryEnabled &&
          (isAutoDiscoveryDisabled ? (
            <Tooltip>
              <TooltipTrigger asChild>{autoDiscoverButton}</TooltipTrigger>
              <TooltipContent>
                <p>
                  {forceDisableAutoDiscovery ? disabledTooltipMessage : 'Upgrade to PRO to unlock'}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : (
            autoDiscoverButton
          ))}

        {hasManualAdd && (
          <Button
            variant="outline"
            onClick={onSelectManual}
            className="flex-1 h-auto py-6 px-4 flex flex-col items-center gap-3 hover:bg-accent hover:border-primary/50"
          >
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-secondary/50">
              <PenLine className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <span className="font-medium">Add Manually</span>
              <span className="text-xs text-muted-foreground">Enter details yourself</span>
            </div>
          </Button>
        )}
      </div>
    </div>
  )
}
