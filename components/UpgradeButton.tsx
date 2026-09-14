'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useUpgradeDialog } from '@/providers/UpgradeDialogProvider'
import { Sparkles } from 'lucide-react'
interface UpgradeButtonProps {
  /**
   * Send the visitor straight to Stripe instead of opening the upgrade dialog. Set
   * this only where the price and the currency toggle are already on screen - a
   * pricing card - so nobody reaches a payment form without having seen what they
   * will be charged. It is also what stops the dialog's own button reopening it.
   */
  checkout?: boolean
  text?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  fullWidth?: boolean
  location?: string
}

export function UpgradeButton({
  checkout = false,
  text = 'Upgrade to PRO',
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  fullWidth = false,
  location,
}: UpgradeButtonProps) {
  const { openUpgradeDialog } = useUpgradeDialog()

  const handleClick = () => {
    import('posthog-js').then(({ default: posthog }) =>
      posthog.capture('upgrade_button_clicked', { location: location ?? 'unknown' }),
    )

    if (checkout) {
      window.location.href = '/api/upgrade'
      return
    }

    // Everywhere else shows no price, so the visitor sees one in the dialog first.
    // The location carries into it, so the conversion click there is still
    // attributed to whatever prompted it rather than to the dialog itself.
    openUpgradeDialog(location ?? 'unknown')
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
