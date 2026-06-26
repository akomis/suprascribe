'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { TeaserStatusResponse } from '@/app/api/discovery/teaser/route'
import { STALE_TIME } from '@/lib/hooks/query-keys'

const teaserStatusKey = ['discovery', 'teaser', 'status'] as const

async function fetchTeaserStatus(): Promise<TeaserStatusResponse> {
  const res = await fetch('/api/discovery/teaser', { method: 'GET' })
  if (!res.ok) throw new Error('Failed to fetch teaser status')
  return res.json()
}

export function useTeaserStatus() {
  const query = useQuery({
    queryKey: teaserStatusKey,
    queryFn: fetchTeaserStatus,
    staleTime: STALE_TIME.short,
    // Re-check after a Stripe upgrade returns the user to the dashboard.
    refetchOnWindowFocus: true,
  })

  return {
    status: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}

export function useInvalidateTeaserStatus() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: teaserStatusKey })
}
