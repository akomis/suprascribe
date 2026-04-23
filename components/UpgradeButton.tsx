'use client'

import { Button } from '@/components/ui/button'
import { useAccountTier } from '@/lib/hooks/useAccount'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface UpgradeButtonProps {
  text?: string
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
  showIcon?: boolean
  hideIfPro?: boolean
  fullWidth?: boolean
}

const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK

export function UpgradeButton({
  text = 'Upgrade to Pro',
  variant = 'outline',
  size = 'default',
  className = '',
  showIcon = true,
  hideIfPro = true,
  fullWidth = false,
}: UpgradeButtonProps) {
  const router = useRouter()
  const { data: tier, isLoading: isTierLoading } = useAccountTier()
  const [isUserLoaded, setIsUserLoaded] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      setIsUserLoaded(true)
    }
    checkUser()
  }, [])

  const isLoading = !isUserLoaded || isTierLoading

  if (hideIfPro && tier === 'PRO') {
    return null
  }

  const handleClick = () => {
    if (!user) {
      router.push(`/login`)
      return
    }

    const paymentUrl = `${STRIPE_PAYMENT_LINK}?prefilled_email=${encodeURIComponent(user.email || '')}&client_reference_id=${user.id}`
    window.location.href = paymentUrl
  }

  const baseClasses =
    variant === 'outline'
      ? 'border-black/50 text-black hover:bg-black/10 hover:text-purple-700 dark:border-white/50 dark:text-white dark:hover:bg-white/10 dark:hover:text-purple-300'
      : ''

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn(baseClasses, fullWidth && 'w-full', className)}
    >
      {showIcon && <Sparkles className="size-4" />}
      {text}
    </Button>
  )
}
