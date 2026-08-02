'use client'

import SpotlightCard from '@/components/landing/SpotlightCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import * as React from 'react'

interface FeatureCardProps {
  icon?: React.ReactNode
  title: string
  description: string
  /** Makes the whole card a link. Not for use together with actionHref/actionComponent. */
  href?: string
  /** Opens `href` in a new tab. */
  openInNewTab?: boolean
  /** Source publication shown as a flat badge. When provided, the arrow is replaced by this badge. */
  source?: string
  /** Logo for `source`. Replaces the text badge. Falls back to the badge if it fails to load. */
  sourceLogo?: string
  actionHref?: string
  actionText?: string
  actionComponent?: React.ReactNode
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  openInNewTab,
  source,
  sourceLogo,
  actionHref,
  actionText,
  actionComponent,
}: FeatureCardProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [logoError, setLogoError] = React.useState(false)

  React.useEffect(() => {
    // Use setTimeout to avoid synchronous setState during effect
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const currentTheme = mounted ? resolvedTheme : 'dark'
  const spotlightColor =
    currentTheme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'

  const card = (
    <SpotlightCard className="h-full p-6 rounded-xl" spotlightColor={spotlightColor}>
      <div className="flex flex-col gap-4 h-full">
        <h3 className="flex items-center gap-3 pr-10 text-lg font-semibold">
          {icon}
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
        {actionComponent ? (
          <div className="flex justify-end">{actionComponent}</div>
        ) : (
          actionHref &&
          actionText && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-neutral-600 dark:text-neutral-300"
                asChild
              >
                <Link href={actionHref}>{actionText}</Link>
              </Button>
            </div>
          )
        )}
      </div>
    </SpotlightCard>
  )

  const sourceBadge = source ? (
    <div className="pointer-events-none absolute top-8 right-6">
      {sourceLogo && !logoError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={sourceLogo}
          alt={`${source} logo`}
          loading="lazy"
          // Logos are single-file and mostly dark ink, so they get a light chip in dark mode.
          className="h-5 w-auto max-w-24 object-contain dark:rounded-sm dark:bg-white dark:px-1.5 dark:py-0.5"
          onError={() => setLogoError(true)}
        />
      ) : (
        <Badge variant="secondary" className="rounded-none px-2 py-0.5 text-xs font-medium">
          {source}
        </Badge>
      )}
    </div>
  ) : href ? (
    <div className="pointer-events-none absolute bottom-6 right-6 flex h-8 w-8 items-center justify-center rounded-full border border-muted-foreground/20 bg-background/80">
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </div>
  ) : null

  if (href) {
    return (
      <Link
        href={href}
        className="relative block h-full"
        {...(openInNewTab && { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {card}
        {sourceBadge}
      </Link>
    )
  }

  return (
    <div className="relative h-full">
      {card}
      {sourceBadge}
    </div>
  )
}
