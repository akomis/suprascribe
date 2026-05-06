import type { TierType } from '@/lib/config/features'
import type { SupabaseClient } from '@supabase/supabase-js'

export async function getUserTier(supabase: SupabaseClient, userId: string): Promise<TierType> {
  const { data } = await supabase
    .from('USER_TIERS')
    .select('tier')
    .eq('user_id', userId)
    .maybeSingle()

  return (data?.tier as TierType | null) ?? 'BASIC'
}
