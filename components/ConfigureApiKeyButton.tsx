'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ConfigureApiKeyButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function ConfigureApiKeyButton({
  variant = 'default',
  size = 'sm',
  className,
}: ConfigureApiKeyButtonProps) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <Link href="/dashboard?settings=byok">Configure AI API Key</Link>
    </Button>
  )
}
