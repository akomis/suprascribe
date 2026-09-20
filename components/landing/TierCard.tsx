'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ShinyText } from '@/components/landing/ShinyText'
import { UpgradeButton } from '@/components/UpgradeButton'
import { FeatureDefinition } from '@/lib/config/features'
import { formatDiscountLabel, getDiscountStatus, type DiscountStatus } from '@/lib/config/discount'
import { getProDiscountPercent, type PriceByCurrency } from '@/lib/config/pricing'
import { usePricingCurrency } from '@/lib/hooks/usePricingCurrency'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface TierCardProps {
  name: string
  description: string
  /**
   * Full price in cents, in every currency. Shown as-is, or struck through next to
   * `discountPriceCents` while the discount runs. A map rather than a formatted
   * string because the card picks the visitor's currency itself - the server render
   * it comes from is cached and shared, so it cannot know which one to pick.
   */
  priceCents: PriceByCurrency
  /** Discounted price in cents. Only used while the discount is active - pass together with `discount`. */
  discountPriceCents?: PriceByCurrency
  /**
   * Discount state as resolved on the server. The card re-resolves it after mount and
   * every minute after that, so a page cached from before the deadline still drops
   * the badge and the discount for the visitor.
   */
  discount?: DiscountStatus
  period: string
  features: FeatureDefinition[]
  buttonText: string
  buttonVariant?: 'default' | 'outline'
  href?: string
  isUpgradeButton?: boolean
  /** PostHog `location` for the upgrade click. */
  upgradeLocation?: string
  badge?: string
  highlighted?: boolean
  checkmarkColor?: string
  additionalNote?: string
}

/**
 * Keeps the discount countdown honest on the client. Starts from the server-resolved
 * status so hydration matches the cached HTML, then re-resolves against the
 * visitor's own clock on mount and once a minute.
 */
function useLiveDiscountStatus(initial: DiscountStatus | undefined) {
  const [status, setStatus] = useState(initial)

  useEffect(() => {
    if (!initial) return

    const update = () => setStatus(getDiscountStatus())
    update()
    const interval = setInterval(update, 60 * 1000)
    return () => clearInterval(interval)
  }, [initial])

  return status
}

export function TierCard({
  name,
  description,
  priceCents,
  discountPriceCents,
  discount,
  period,
  features,
  buttonText,
  buttonVariant = 'outline',
  href,
  isUpgradeButton = false,
  upgradeLocation = 'landing_pricing',
  badge,
  highlighted = false,
  checkmarkColor = 'text-muted-foreground',
  additionalNote,
}: TierCardProps) {
  const status = useLiveDiscountStatus(discount)
  const { currency, format } = usePricingCurrency()

  const fullCents = priceCents[currency]
  const discountActive = Boolean(status?.active && discountPriceCents)
  const discountLabel = status ? formatDiscountLabel(status, getProDiscountPercent(currency)) : null
  const displayPrice = format(discountActive ? discountPriceCents![currency] : fullCents)
  const struckPrice = discountActive ? format(fullCents) : null

  return (
    <Card className={cn('relative h-full', highlighted && 'border-primary')}>
      {badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className={highlighted ? '' : 'bg-secondary text-secondary-foreground'}>
            {badge}
          </Badge>
        </div>
      )}
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-2xl">{name}</CardTitle>
          {discountLabel && discountActive && (
            <Badge variant="outline" className="whitespace-nowrap">
              <ShinyText text={discountLabel} speed={3} color="#888888" shineColor="#ffffff" />
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4 flex items-baseline gap-2">
          {struckPrice && (
            <span className="text-xl text-muted-foreground line-through">{struckPrice}</span>
          )}
          <span className="text-4xl font-bold">{displayPrice}</span>
          <span className="text-muted-foreground">{period}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {additionalNote && <p className="text-sm font-medium">{additionalNote}</p>}
        <ul className="space-y-2 text-sm">
          {features.map((feature) => (
            <li key={feature.key} className="flex items-start gap-2">
              <span className={checkmarkColor}>✓</span>
              <div className="flex flex-col gap-1">
                <span>{feature.description}</span>
                {feature.moreInfoLink && (
                  <Link
                    href={feature.moreInfoLink.href}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {feature.moreInfoLink.label}
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        {isUpgradeButton ? (
          <UpgradeButton
            // The card is the price, so there is nothing to show first.
            checkout
            text={buttonText}
            variant={buttonVariant as any}
            fullWidth={true}
            location={upgradeLocation}
          />
        ) : (
          <Link href={href!} className="w-full">
            <Button variant={buttonVariant} className="w-full">
              {buttonText}
            </Button>
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
