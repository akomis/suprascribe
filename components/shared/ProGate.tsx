'use client'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Features, type FeatureKey } from '@/lib/config/features'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { useUpgradeDialog } from '@/providers/UpgradeDialogProvider'
import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface ProGateProps {
  feature: FeatureKey
  children: React.ReactNode
  /** Applied to the wrapper. Pass `w-full` where the child filled its container. */
  className?: string
  /** Overrides the default "<name> is a PRO feature" tooltip copy. */
  tooltip?: string
  /** Drop the lock badge where the surrounding copy already says it is locked. */
  showLock?: boolean
}

/**
 * Wraps a PRO-only control so a BASIC user can see it, understand why it is locked,
 * and click through to the upgrade dialog.
 *
 * The locked state keeps the control on screen and dimmed rather than hiding it, and
 * takes the click on a transparent overlay rather than by re-enabling the control.
 * That is what lets natively-disabled inputs and Radix triggers respond at all -
 * a `disabled` element swallows pointer events - and it keeps the child's own
 * `disabled` prop, so any data-layer gating tied to the same feature stays honest.
 *
 * Renders children untouched for anyone who has access, and while the tier is still
 * loading, so nothing flashes locked for a PRO user on first paint.
 */
export function ProGate({ feature, children, className, tooltip, showLock = true }: ProGateProps) {
  const { requiresUpgrade, isLoading } = useFeatureAccess(feature)
  const { openUpgradeDialog } = useUpgradeDialog()

  if (isLoading || !requiresUpgrade) return <>{children}</>

  const name = Features[feature]?.name ?? 'This'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('relative inline-flex', className)}>
          <span aria-hidden className="pointer-events-none w-full opacity-50">
            {children}
          </span>

          {showLock && (
            <span
              aria-hidden
              className="pointer-events-none absolute -top-1 -right-1 z-20 flex size-4 items-center justify-center rounded-full border bg-background text-muted-foreground"
            >
              <Lock className="size-2.5" />
            </span>
          )}

          <button
            type="button"
            onClick={() => openUpgradeDialog(`locked:${feature}`)}
            aria-label={`${name} - PRO feature, upgrade to unlock`}
            className="absolute inset-0 z-10 cursor-pointer rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-hidden"
          />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[220px] text-center">
        <p>{tooltip ?? `${name} is a PRO feature. Click to upgrade.`}</p>
      </TooltipContent>
    </Tooltip>
  )
}
