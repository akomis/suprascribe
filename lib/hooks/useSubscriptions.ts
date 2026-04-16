import { useQuery, useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { insightKeys } from './useInsights'
import { type MergedSubscriptionResponse } from '@/app/api/subscriptions/route'

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: () => [...subscriptionKeys.all, 'list'] as const,
}

async function parseErrorResponse(response: Response, fallback: string): Promise<never> {
  try {
    const error = await response.json()
    throw new Error(error.error || fallback)
  } catch (e) {
    if (e instanceof Error && e.message !== fallback) throw e
    throw new Error(fallback)
  }
}

const subscriptionApi = {
  async getUserSubscriptions(): Promise<MergedSubscriptionResponse[]> {
    const response = await fetch('/api/subscriptions', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      await parseErrorResponse(response, 'Failed to fetch subscriptions')
    }

    const result = await response.json()
    return result.data || []
  },

  async createSubscription(
    input: CreateSubscriptionFormData,
  ): Promise<UserSubscriptionWithDetails> {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      await parseErrorResponse(response, 'Failed to create subscription')
    }

    const result = await response.json()
    return result.data
  },

  async updateSubscription(
    subscriptionId: number,
    input: CreateSubscriptionFormData,
  ): Promise<UserSubscriptionWithDetails> {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      await parseErrorResponse(response, 'Failed to update subscription')
    }

    const result = await response.json()
    return result.data
  },

  async deleteSubscription(subscriptionId: number): Promise<void> {
    const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      await parseErrorResponse(response, 'Failed to delete subscription')
    }
  },
}

export function useSubscriptions(options?: { skipStale?: boolean }) {
  return useQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: subscriptionApi.getUserSubscriptions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...(options?.skipStale && { staleTime: 0 }),
  })
}

export function useSubscriptionsSuspense(options?: { skipStale?: boolean }) {
  return useSuspenseQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: subscriptionApi.getUserSubscriptions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...(options?.skipStale && { staleTime: 0 }),
  })
}

export function useCreateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionApi.createSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() })
    },
  })
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateSubscriptionFormData }) =>
      subscriptionApi.updateSubscription(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() })
    },
  })
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: subscriptionApi.deleteSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() })
    },
  })
}
