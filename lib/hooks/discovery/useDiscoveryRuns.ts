'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { DiscoveryRun } from '@/lib/types/database'
import { calculateRateLimitInfo, type RateLimitInfo } from '@/lib/utils/discovery-rate-limit'

export const discoveryRunKeys = {
  all: ['discoveryRuns'] as const,
  list: () => [...discoveryRunKeys.all, 'list'] as const,
}

const discoveryRunApi = {
  async getDiscoveryRuns(): Promise<DiscoveryRun[]> {
    const response = await fetch('/api/discovery/runs', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to fetch discovery runs')
    }

    return response.json()
  },
}

interface UseDiscoveryRunsReturn {
  data: DiscoveryRun[] | undefined
  rateLimitInfo: RateLimitInfo | null
  isLoading: boolean
  isError: boolean
  error: Error | null
  refetch: () => void
}

export function useDiscoveryRuns(): UseDiscoveryRunsReturn {
  const query = useQuery({
    queryKey: discoveryRunKeys.list(),
    queryFn: discoveryRunApi.getDiscoveryRuns,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  const rateLimitInfo = query.data ? calculateRateLimitInfo(query.data) : null

  return {
    data: query.data,
    rateLimitInfo,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  }
}

export function useInvalidateDiscoveryRuns() {
  const queryClient = useQueryClient()

  return () => {
    queryClient.invalidateQueries({ queryKey: discoveryRunKeys.list() })
  }
}
