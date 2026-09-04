'use client'

import { Button } from '@/components/ui/button'
import { useAutoDiscoveryAccess } from '@/lib/hooks/useAutoDiscoveryAccess'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { Mail, PenLine } from 'lucide-react'
import { useEffect } from 'react'

function AutoDiscoverButton({ isEnabled, onClick }: { isEnabled: boolean; onClick: () => void }) {
  if (!isEnabled) return null

  // No locked state here: the button leads to the auto-discover view either way, and
  // that view is where the Pro pitch belongs.
  return (
    <Button
      variant="outline"
      onClick={onClick}
      className="flex-1 h-auto py-6 px-4 flex flex-col items-center gap-3 hover:bg-accent hover:border-primary/50 relative"
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <div className="flex flex-col items-center text-center gap-1">
        <span className="font-medium">Auto-discover</span>
        <span className="text-xs text-muted-foreground">Scan your email inbox</span>
      </div>
    </Button>
  )
}

interface AddSubscriptionOptionsProps {
  onSelectAutoDiscover: () => void
  onSelectManual: () => void
}

export function AddSubscriptionOptions({
  onSelectAutoDiscover,
  onSelectManual,
}: AddSubscriptionOptionsProps) {
  const { hasAccess: hasAutoDiscovery, isEnabled: isAutoDiscoveryEnabled } =
    useAutoDiscoveryAccess()
  const { hasAccess: hasManualAdd } = useFeatureAccess('manual_add')

  useEffect(() => {
    if (hasAutoDiscovery && !hasManualAdd) {
      onSelectAutoDiscover()
    } else if (hasManualAdd && !hasAutoDiscovery && !isAutoDiscoveryEnabled) {
      onSelectManual()
    }
  }, [hasAutoDiscovery, hasManualAdd, isAutoDiscoveryEnabled, onSelectAutoDiscover, onSelectManual])

  if (hasAutoDiscovery && !hasManualAdd) {
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <p className="text-sm text-muted-foreground text-center">
        Choose how you want to add your subscription
      </p>

      <div className="flex gap-3">
        <AutoDiscoverButton isEnabled={isAutoDiscoveryEnabled} onClick={onSelectAutoDiscover} />

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
