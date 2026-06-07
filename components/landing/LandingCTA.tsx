'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Separator } from '../ui/separator'

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
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center">
        <Link href="/login?tab=signup">
          <Button size="lg" className="text-sm sm:text-base rounded-r-none">
            Get Started Free
          </Button>
        </Link>
        <Link href="/login?tab=signin">
          <Button
            size="lg"
            variant="outline"
            className="text-sm sm:text-base rounded-l-none border-l-0"
          >
            Sign In
          </Button>
        </Link>
      </div>
      <Separator className="max-w-24" orientation="horizontal" />
      <Link href="/demo">
        <Button size="lg" variant="secondary" className="text-sm sm:text-base">
          Try Demo
        </Button>
      </Link>
    </div>
  )
}
