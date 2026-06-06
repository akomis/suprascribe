'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function AffiliateTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      document.cookie = `referral_code=${ref}; path=/; max-age=2592000; SameSite=Lax`
    }
  }, [searchParams])

  return null
}
