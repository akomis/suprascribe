'use client'

import { createClient } from '@/lib/supabase/client'
import posthog from 'posthog-js'
import { useEffect } from 'react'

export function PostHogIdentifier() {
  useEffect(() => {
    createClient()
      .auth.getUser()
      .then(({ data: { user } }) => {
        if (user) posthog.identify(user.id, { email: user.email })
      })
  }, [])
  return null
}
