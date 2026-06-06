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
import dynamic from 'next/dynamic'
const UpgradeButton = dynamic(
  () => import('@/components/UpgradeButton').then((m) => m.UpgradeButton),
  { ssr: false },
)
import { FeatureDefinition } from '@/lib/config/features'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface TierCardProps {
  name: string
  description: string
  price: string
  originalPrice?: string
  earlyBirdLabel?: string
  period: string
  features: FeatureDefinition[]
  buttonText: string
  buttonVariant?: 'default' | 'outline'
  href?: string
  isUpgradeButton?: boolean
  badge?: string
  highlighted?: boolean
  checkmarkColor?: string
  additionalNote?: string
}

export function TierCard({
  name,
  description,
  price,
  originalPrice,
  earlyBirdLabel,
  period,
  features,
  buttonText,
  buttonVariant = 'outline',
  href,
  isUpgradeButton = false,
  badge,
  highlighted = false,
  checkmarkColor = 'text-muted-foreground',
  additionalNote,
}: TierCardProps) {
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
        <div className="flex items-center gap-2">
          <CardTitle className="text-2xl">{name}</CardTitle>
          {earlyBirdLabel && (
            <Badge variant="outline">
              <ShinyText text={earlyBirdLabel} speed={3} color="#888888" shineColor="#ffffff" />
            </Badge>
          )}
        </div>
        <CardDescription>{description}</CardDescription>
        <div className="mt-4 flex items-baseline gap-2">
          {originalPrice && (
            <span className="text-xl text-muted-foreground line-through">{originalPrice}</span>
          )}
          <span className="text-4xl font-bold">{price}</span>
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
            text={buttonText}
            variant={buttonVariant as any}
            fullWidth={true}
            hideIfPro={true}
            location="landing_pricing"
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
