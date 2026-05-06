'use client'

import { Button } from '@/components/ui/button'
import { LifeBuoy } from 'lucide-react'

interface SupportButtonProps {
  className?: string
  variant?: 'outline' | 'ghost' | 'default' | 'secondary' | 'destructive' | 'link'
}

export function SupportButton({ className, variant = 'outline' }: SupportButtonProps) {
  return (
    <Button
      variant={variant}
      type="button"
      aria-label="Open support page"
      className={className}
      onClick={() => window.open('/dashboard/support', '_blank')}
    >
      <LifeBuoy className="h-4 w-4" />
      Support
    </Button>
  )
}
