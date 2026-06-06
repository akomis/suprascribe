'use client'

import { Button } from '@/components/ui/button'

interface SupportButtonProps {
  className?: string
  variant?: 'outline' | 'ghost' | 'default' | 'secondary' | 'destructive' | 'link'
  category?: string
}

export function SupportButton({ className, variant = 'outline', category }: SupportButtonProps) {
  const url = category ? `/dashboard/support?category=${category}` : '/dashboard/support'
  return (
    <Button
      variant={variant}
      type="button"
      aria-label="Open support page"
      className={className}
      onClick={() => window.open(url, '_blank')}
    >
      Support
    </Button>
  )
}
