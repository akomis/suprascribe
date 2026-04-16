'use client'

import SpotlightCard from '@/components/landing/SpotlightCard'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import * as React from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  actionHref?: string
  actionText?: string
  actionComponent?: React.ReactNode
}

export function FeatureCard({
  icon,
  title,
  description,
  actionHref,
  actionText,
  actionComponent,
}: FeatureCardProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const currentTheme = mounted ? resolvedTheme : 'dark'
  const spotlightColor =
    currentTheme === 'light' ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.25)'

  return (
    <SpotlightCard className="h-full p-6 rounded-xl" spotlightColor={spotlightColor}>
      <div className="flex flex-col gap-4">
        <h3 className="flex items-center gap-3 text-lg font-semibold">
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
}
