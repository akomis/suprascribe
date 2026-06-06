import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import type { TierType } from '@/lib/config/features'
import { accountKeys, insightKeys, subscriptionKeys, STALE_TIME } from './query-keys'
import { discoveryRunKeys } from './discovery/useDiscoveryRuns'

async function fetchTier(): Promise<TierType | null> {
  const res = await fetch('/api/user/tier', { method: 'GET' })
  if (!res.ok) return null
  const json = await res.json()
  const tier = json?.tier as TierType | null
  if (!tier) return null
  return tier
}

export function useAccountTier() {
  return useQuery({
    queryKey: accountKeys.tier(),
    queryFn: fetchTier,
    staleTime: STALE_TIME.default,
  })
}

async function updateEmail(newEmail: string): Promise<void> {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  if (!data.user) throw new Error('Not signed in')
  const { error } = await supabase.auth.updateUser({ email: newEmail })
  if (error) throw new Error(error.message)
}

export function useUpdateEmail() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateEmail,
    onSuccess: () => {
      toast.success('Email updated. Please check your inbox to confirm the change.')
      queryClient.invalidateQueries({ queryKey: accountKeys.all })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update email')
    },
  })
}

async function deleteAccountRequest(): Promise<void> {
  const res = await fetch('/api/user', { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to delete account')
  }
}

export function useDeleteAccount() {
  return useMutation({
    mutationFn: deleteAccountRequest,
    onSuccess: async () => {
      const supabase = createClient()
      toast.success('Account deleted')
      await supabase.auth.signOut()
      window.location.href = '/login'
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to delete account')
    },
  })
}

async function resetAccountDataRequest(): Promise<void> {
  const res = await fetch('/api/user/reset', { method: 'DELETE' })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to reset account data')
  }
}

export function useResetAccountData() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: resetAccountDataRequest,
    onSuccess: () => {
      toast.success('Account data reset successfully')
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all })
      queryClient.invalidateQueries({ queryKey: discoveryRunKeys.all })
      queryClient.invalidateQueries({ queryKey: insightKeys.all })
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to reset account data')
    },
  })
}
