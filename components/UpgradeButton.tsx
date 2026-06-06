'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
interface UpgradeButtonProps {
  text?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  hideIfPro?: boolean
  fullWidth?: boolean
  location?: string
}

export function UpgradeButton({
  text = 'Upgrade to Pro',
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  fullWidth = false,
  location,
}: UpgradeButtonProps) {
  const handleClick = () => {
    import('posthog-js').then(({ default: posthog }) =>
      posthog.capture('upgrade_button_clicked', { location: location ?? 'unknown' }),
    )
    window.location.href = '/api/upgrade'
  }

  const baseClasses =
    variant === 'outline'
      ? 'border-black/50 text-black hover:bg-black/10 hover:text-purple-700 dark:border-white/50 dark:text-white dark:hover:bg-white/10 dark:hover:text-purple-300'
      : ''

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={cn(baseClasses, fullWidth && 'w-full', className)}
    >
      {showIcon && <Sparkles className="size-4" />}
      {text}
    </Button>
  )
}
