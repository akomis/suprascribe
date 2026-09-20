'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
  variant?: ComponentProps<typeof Button>['variant']
  size?: ComponentProps<typeof Button>['size']
}

/**
 * A button, not a link, on purpose: it points into the signed-in app, which answers
 * anonymous visitors with a redirect to /login. Public pages (/limits, /imap) render it,
 * and an `<a href="/dashboard">` there is an internal link to a redirect for every
 * crawler. Signed-in visitors lose nothing but middle-click.
 */
export function BackButton({
  href = '/dashboard',
  label = 'Back to Dashboard',
  className,
  variant = 'ghost',
  size = 'sm',
}: BackButtonProps) {
  const router = useRouter()

  return (
    <Button variant={variant} size={size} className={className} onClick={() => router.push(href)}>
      <ArrowLeft className="size-4 mr-1" />
      {label}
    </Button>
  )
}
