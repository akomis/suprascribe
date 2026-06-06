'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface BackButtonProps {
  href?: string
  label?: string
  className?: string
}

export function BackButton({
  href = '/dashboard',
  label = 'Back to Dashboard',
  className,
}: BackButtonProps) {
  const router = useRouter()

  return (
    <Button variant="ghost" size="sm" className={className} onClick={() => router.push(href)}>
      <ArrowLeft className="size-4 mr-1" />
      {label}
    </Button>
  )
}
