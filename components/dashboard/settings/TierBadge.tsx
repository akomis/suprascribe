'use client'

import { ProTierBadge } from '@/components/shared/ProTierBadge'
import { useAccountTier } from '@/lib/hooks/useAccount'
import { useSubscriptions } from '@/lib/hooks/useSubscriptions'
import { UpgradeButton } from '@/components/UpgradeButton'

/** The visitor's own tier. To simply render the PRO badge, use ProTierBadge. */
export function TierBadge() {
  const { data: tier, isLoading } = useAccountTier()
  const { data: subscriptions } = useSubscriptions()

  if (isLoading) {
    return null
  }

  if (tier === 'PRO') {
    return <ProTierBadge />
  }

  const hasSubscriptions = subscriptions && subscriptions.length > 0
  if (!hasSubscriptions) {
    return null
  }

  return (
    <UpgradeButton
      text="Upgrade to PRO"
      variant="outline"
      size="sm"
      className="h-7 text-xs"
      showIcon={true}
      location="dashboard_tier_badge"
    />
  )
}
