'use client'

import { CurrencyToggle } from '@/components/landing/CurrencyToggle'
import { TierCard } from '@/components/landing/TierCard'
import { OneTimePurchaseNote } from '@/components/shared/OneTimePurchaseNote'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getDiscountStatus } from '@/lib/config/discount'
import { getEnabledFeaturesByTier, TIER } from '@/lib/config/features'
import { PRO_DISCOUNT_PRICES, PRO_FULL_PRICES } from '@/lib/config/pricing'

interface UpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** What prompted the upgrade, for PostHog attribution. */
  location: string
}

/**
 * The one place a signed-in user sees what PRO costs and switches currency before
 * reaching Stripe. Every in-app upgrade prompt opens this; the prompts themselves
 * show no price.
 *
 * A dialog rather than a page because only a signed-in dashboard user ever reaches
 * it, and a navigation would tear down whatever they were in the middle of. The
 * price itself is the same `TierCard` the landing page uses, so the two can never
 * quote different numbers.
 */
export function UpgradeDialog({ open, onOpenChange, location }: UpgradeDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-md">
        <DialogHeader className="items-center gap-3 text-center">
          <DialogTitle className="text-2xl font-bold tracking-tight">Upgrade to PRO</DialogTitle>
          <CurrencyToggle />
        </DialogHeader>

        <TierCard
          name="PRO"
          description="For power users who want more"
          priceCents={PRO_FULL_PRICES}
          discountPriceCents={PRO_DISCOUNT_PRICES}
          // Resolved at render rather than passed from the server: the dialog is
          // client-only, so there is no cached HTML for it to match.
          discount={getDiscountStatus()}
          period="once, forever"
          features={getEnabledFeaturesByTier(TIER.PRO)}
          buttonText="Upgrade to PRO"
          buttonVariant="default"
          isUpgradeButton={true}
          upgradeLocation={`upgrade_dialog:${location}`}
          badge="One-Time Purchase"
          highlighted={true}
          checkmarkColor="text-primary"
          additionalNote="Everything in Basic, plus:"
        />

        <OneTimePurchaseNote className="text-center" />
      </DialogContent>
    </Dialog>
  )
}
