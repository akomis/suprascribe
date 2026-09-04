'use client'

import ProviderDiscoverButton from '@/components/dashboard/discovery/ProviderDiscoverButton'
import { OneTimePurchaseNote } from '@/components/shared/OneTimePurchaseNote'
import { UpgradeButton } from '@/components/UpgradeButton'
import { useTeaserStatus } from '@/lib/hooks/discovery/useTeaserStatus'
import { Lock } from 'lucide-react'

const LOCKED_TOOLTIP = 'Free scan already used - upgrade to Pro to scan again'

const noop = () => {}

/**
 * What a BASIC user sees where the provider buttons would be once their one free
 * scan is spent. The providers stay on screen, disabled, so the locked state reads
 * as the same surface rather than an unrelated upsell - and when the earlier scan
 * still has an unclaimed result, the import CTA leads straight back to it.
 */
export function TeaserUsedCard() {
  const { status } = useTeaserStatus()
  const discoveredCount = status?.subscriptionsFound ?? 0
  const canImport = !!status?.hasPendingTeaser && !status?.isPro && discoveredCount > 0

  return (
    <div className="fade-on-mount flex flex-col gap-4 rounded-lg border border-dashed p-4 w-[300px] sm:w-[350px] md:w-[450px]">
      <div className="flex gap-4 justify-center">
        <ProviderDiscoverButton
          displayName="Gmail"
          logoQuery="google"
          logoSrc="/logos/google.svg"
          onClick={noop}
          tooltipContent={LOCKED_TOOLTIP}
        />
        <ProviderDiscoverButton
          displayName="Outlook"
          logoQuery="microsoft"
          logoSrc="/logos/microsoft.svg"
          onClick={noop}
          tooltipContent={LOCKED_TOOLTIP}
        />
        <ProviderDiscoverButton
          displayName="iCloud"
          logoQuery="apple"
          logoSrc="/logos/apple.svg"
          onClick={noop}
          tooltipContent={LOCKED_TOOLTIP}
        />
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Lock className="size-4 shrink-0" />
          You&apos;ve used your free scan
        </div>
        <p className="text-sm text-muted-foreground max-w-sm">
          {canImport &&
            `We saved the ${discoveredCount} subscription${discoveredCount !== 1 ? 's' : ''} we found in your inbox - no need to scan again. `}
          Auto-discovery is a Pro feature, along with totals, start/renewal dates, quick unsubscribe
          links, renewal reminders and more.
        </p>
      </div>

      {canImport ? (
        <UpgradeButton
          variant="default"
          location="discovery_teaser_used"
          className="mx-auto"
          text={'Upgrade & Import'}
        />
      ) : (
        <UpgradeButton location="discovery_teaser_used" className="mx-auto" />
      )}

      <OneTimePurchaseNote className="text-center pt-1" />
    </div>
  )
}
