import type { SupabaseClient } from '@supabase/supabase-js'
import { decryptApiKey } from '@/lib/utils/server-crypto'
import { type LLMProvider, type ProviderConfig } from './ai-provider'

export type BYOKResult =
  | { ok: true; config: ProviderConfig }
  | { ok: false; reason: 'not_configured' | 'decrypt_failed' }

export async function getBYOKConfig(userId: string, supabase: SupabaseClient): Promise<BYOKResult> {
  const { data: settings } = await supabase
    .from('USER_SETTINGS')
    .select('active_key_id')
    .eq('user_id', userId)
    .single()

  if (!settings?.active_key_id) return { ok: false, reason: 'not_configured' }

  const { data: key } = await supabase
    .from('USER_API_KEYS')
    .select('provider, encrypted_key, model')
    .eq('id', settings.active_key_id)
    .single()

  if (!key) return { ok: false, reason: 'not_configured' }

  try {
    return {
      ok: true,
      config: {
        provider: key.provider as LLMProvider,
        apiKey: decryptApiKey(key.encrypted_key),
        model: key.model,
      },
    }
  } catch (err) {
    console.error('[BYOK] Failed to decrypt API key for user', userId, err)
    return { ok: false, reason: 'decrypt_failed' }
  }
}
