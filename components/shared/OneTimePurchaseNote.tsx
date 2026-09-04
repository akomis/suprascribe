'use client'

import { TierBadge } from '@/components/dashboard/settings/TierBadge'
import { cn } from '@/lib/utils'

interface OneTimePurchaseNoteProps {
  className?: string
}

/**
 * The reassurance line that sits under every Pro upsell: Pro is bought once, so
 * upgrading is not swapping one recurring charge for another.
 */
export function OneTimePurchaseNote({ className }: OneTimePurchaseNoteProps) {
  return (
    <div className={cn('items-center text-sm text-muted-foreground', className)}>
      <TierBadge forceTier="PRO" /> is a one-time purchase, not a subscription.
    </div>
  )
}
