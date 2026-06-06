'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function LandingCTA() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])

  if (user) {
    return (
      <Link href="/dashboard">
        <Button size="lg" className="text-sm sm:text-base">
          Go to Dashboard
        </Button>
      </Link>
    )
  }

  return (
    <>
      <Link href="/login?tab=signup">
        <Button size="lg" className="text-sm sm:text-base">
          Get Started Free
        </Button>
      </Link>
      <Link href="/demo">
        <Button size="lg" variant="outline" className="text-sm sm:text-base">
          Try Demo
        </Button>
      </Link>
    </>
  )
}
