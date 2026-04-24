'use client'

import { Badge } from '@/components/ui/badge'
import { useAccountTier } from '@/lib/hooks/useAccount'
import { useSubscriptions } from '@/lib/hooks/useSubscriptions'
import { UpgradeButton } from '@/components/UpgradeButton'
import { Sparkles } from 'lucide-react'

interface TierBadgeProps {
  forceTier?: 'PRO' | 'BASIC'
}

export function TierBadge({ forceTier }: TierBadgeProps = {}) {
  const { data: tier, isLoading } = useAccountTier()
  const { data: subscriptions } = useSubscriptions()

  const displayTier = forceTier ?? tier

  if (!forceTier && isLoading) {
    return null
  }

  if (displayTier === 'PRO') {
    return (
      <Badge variant="default" className="bg-black text-white border-0 shadow-sm gap-1">
        <Sparkles className="size-3" />
        Pro
      </Badge>
    )
  }

  const hasSubscriptions = subscriptions && subscriptions.length > 0
  if (!hasSubscriptions) {
    return null
  }

  return (
    <UpgradeButton
      text="Upgrade to Pro"
      variant="outline"
      size="sm"
      className="h-7 text-xs"
      showIcon={true}
      hideIfPro={false}
      location="dashboard_tier_badge"
    />
  )
}
