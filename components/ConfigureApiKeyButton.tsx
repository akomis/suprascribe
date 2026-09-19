'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ConfigureApiKeyButtonProps {
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

// Navigates on click instead of linking: /limits is public and indexed, and
// /dashboard redirects anonymous visitors (crawlers included) to /login.
export function ConfigureApiKeyButton({
  variant = 'default',
  size = 'sm',
  className,
}: ConfigureApiKeyButtonProps) {
  const router = useRouter()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => router.push('/dashboard?settings=byok')}
    >
      Configure BYOK
    </Button>
  )
}
