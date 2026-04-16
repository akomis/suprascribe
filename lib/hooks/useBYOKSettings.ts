import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { LLMProvider } from '@/lib/services/ai-provider'

export interface ApiKeyInfo {
  id: string
  provider: string
  key_hint: string
  model: string
  validated_at: string
}

interface ApiKeysResponse {
  keys: ApiKeyInfo[]
  activeKeyId: string | null
}

const byokKeys = {
  all: ['byok'] as const,
  keys: () => [...byokKeys.all, 'keys'] as const,
}

async function fetchKeys(): Promise<ApiKeysResponse> {
  const res = await fetch('/api/user/api-keys')
  if (!res.ok) throw new Error('Failed to fetch API keys')
  const data = await res.json()
  return { keys: data.keys, activeKeyId: data.activeKeyId }
}

async function saveApiKey(params: { provider: LLMProvider; model: string; apiKey: string }) {
  const res = await fetch('/api/user/api-keys', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || 'Failed to save API key')
  }
  const data = await res.json()
  return { ...data, provider: params.provider }
}

async function deleteApiKey(keyId: string) {
  const res = await fetch('/api/user/api-keys', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId }),
  })
  if (!res.ok) throw new Error('Failed to delete API key')
}

async function setActiveKey(keyId: string | null) {
  const res = await fetch('/api/user/api-keys', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ keyId }),
  })
  if (!res.ok) throw new Error('Failed to set active key')
}

export function useBYOKSettings() {
  const queryClient = useQueryClient()

  const keysQuery = useQuery({
    queryKey: byokKeys.keys(),
    queryFn: fetchKeys,
  })

  const saveMutation = useMutation({
    mutationFn: saveApiKey,
    onSuccess: (data) => {
      const message =
        data.provider === 'openrouter' ? 'API key saved!' : 'API key saved and validated!'
      toast.success(message)
      queryClient.invalidateQueries({ queryKey: byokKeys.keys() })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteApiKey,
    onSuccess: () => {
      toast.success('API key removed')
      queryClient.invalidateQueries({ queryKey: byokKeys.keys() })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const setActiveMutation = useMutation({
    mutationFn: setActiveKey,
    onSuccess: (_, keyId) => {
      toast.success(keyId === null ? 'API key disabled' : 'Active key updated')
      queryClient.invalidateQueries({ queryKey: byokKeys.keys() })
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  return {
    keys: keysQuery.data?.keys || [],
    activeKeyId: keysQuery.data?.activeKeyId || null,
    isLoading: keysQuery.isLoading,
    saveKey: async (params: { provider: LLMProvider; model: string; apiKey: string }) => {
      try {
        await saveMutation.mutateAsync(params)
        return { success: true }
      } catch (err) {
        return { error: (err as Error).message }
      }
    },
    deleteKey: deleteMutation.mutate,
    setActiveKey: setActiveMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingActive: setActiveMutation.isPending,
  }
}
