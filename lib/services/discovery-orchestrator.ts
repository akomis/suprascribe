import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import { hasFeatureAccess } from '@/lib/config/features'
import type { ProviderConfig } from '@/lib/services/ai-provider'
import { estimateCostUsd, recordAnalytics } from '@/lib/services/discovery-analytics'
import { getBYOKConfig } from '@/lib/services/byok'
import { discover, type ImapCredentials } from '@/lib/services/subscription-discovery'
import { getUserTier } from '@/lib/supabase/tier'
import type { DiscoveryErrorKind, DiscoveryResponse } from '@/lib/types/discovery'
import { TEASER_PREVIEW_COUNT } from '@/lib/types/discovery'
import { checkRateLimit } from '@/lib/utils/discovery-rate-limit'
import { encryptApiKey } from '@/lib/utils/server-crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export type OrchestratorInput =
  | { provider: 'google' | 'microsoft'; token: string }
  | { provider: 'imap'; credentials: ImapCredentials }

type DiscoveryMode = 'full' | 'teaser'
type PolicyPass = {
  ok: true
  mode: DiscoveryMode
  isByokMode: boolean
  byokConfig: ProviderConfig | undefined
}
type PolicyFail = { ok: false; kind: DiscoveryErrorKind | 'rate_limited'; message: string }
type PolicyResult = PolicyPass | PolicyFail

async function checkDiscoveryPolicy(
  userId: string,
  provider: string,
  supabase: SupabaseClient,
): Promise<PolicyResult> {
  const byokResult = await getBYOKConfig(userId, supabase)

  if (!byokResult.ok && byokResult.reason === 'decrypt_failed') {
    return {
      ok: false,
      kind: 'auth_failed',
      message: 'Failed to decrypt your API key. Please re-add it in settings.',
    }
  }

  const userTier = await getUserTier(supabase, userId)
  // BYOK is a Pro feature - Basic users cannot use their stored keys
  const isByokMode = byokResult.ok && userTier === 'PRO'
  const byokConfig = isByokMode ? byokResult.config : undefined

  if (!isByokMode) {
    if (!hasFeatureAccess(userTier, 'auto_discovery')) {
      // BASIC, non-BYOK user: offer one free teaser scan instead of rejecting.
      const { data: existingTeaser, error: teaserError } = await supabase
        .from('DISCOVERY_TEASERS')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle()

      if (teaserError) {
        console.error('[Discovery] Error checking teaser usage:', teaserError)
        return { ok: false, kind: 'unknown', message: 'Failed to check free scan availability' }
      }

      if (existingTeaser) {
        await recordAnalytics(supabase, 'rate_limited', {
          userId,
          provider,
          mode: 'teaser',
          isByok: false,
        })
        return {
          ok: false,
          kind: 'rate_limited',
          message: 'Free scan already used - upgrade to scan again.',
        }
      }

      return { ok: true, mode: 'teaser', isByokMode: false, byokConfig: undefined }
    }

    const { data: existingRuns, error: runsError } = await supabase
      .from('DISCOVERY_RUNS')
      .select('*')
      .eq('user_id', userId)
      .eq('is_byok', false)

    if (runsError) {
      console.error('[Discovery] Error fetching discovery runs:', runsError)
      return { ok: false, kind: 'unknown', message: 'Failed to check rate limits' }
    }

    const rateLimitCheck = checkRateLimit(existingRuns || [])
    if (!rateLimitCheck.canDiscover) {
      await recordAnalytics(supabase, 'rate_limited', {
        userId,
        provider,
        mode: 'full',
        isByok: false,
      })
      return {
        ok: false,
        kind: 'rate_limited',
        message: rateLimitCheck.reason || 'Rate limit exceeded',
      }
    }
  }

  return { ok: true, mode: 'full', isByokMode, byokConfig }
}

export async function runDiscovery(
  supabase: SupabaseClient,
  userId: string,
  input: OrchestratorInput,
): Promise<DiscoveryResponse> {
  const { provider } = input

  const policy = await checkDiscoveryPolicy(userId, provider, supabase)
  if (!policy.ok) return { success: false, kind: policy.kind, error: policy.message }

  const { mode, isByokMode, byokConfig } = policy

  const startTime = Date.now()
  let result: Awaited<ReturnType<typeof discover>>

  const discoveryInput =
    input.provider === 'imap'
      ? { provider: 'imap' as const, credentials: input.credentials, byokConfig }
      : { provider: input.provider, credentials: { token: input.token }, byokConfig }

  try {
    result = await discover(discoveryInput)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Discovery failed'
    await recordAnalytics(supabase, 'failed', {
      userId,
      provider,
      mode,
      isByok: isByokMode,
      errorMessage,
      metrics: {
        emailsScanned: 0,
        durationMs: Date.now() - startTime,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        model: isByokMode ? (byokConfig?.model ?? null) : null,
      },
    })
    return { success: false, kind: 'provider_error', error: errorMessage }
  }

  const { subscriptions, emailCount, email, usage } = result
  const duration = Date.now() - startTime

  const { modelName } = EMAIL_DISCOVERY_CONFIG.analysisModel
  const totalCost = estimateCostUsd(usage)

  console.log(
    `[Discovery] ${provider} (${mode}, ${isByokMode ? 'BYOK' : 'default'}) | ✓ ${subscriptions.length}/${emailCount} subs | ${(duration / 1000).toFixed(1)}s | $${totalCost.toFixed(4)}`,
  )

  if (mode === 'teaser') {
    // Persist the full result encrypted server-side; send only a count + preview to the client.
    const { data: teaserRow, error: teaserInsertError } = await supabase
      .from('DISCOVERY_TEASERS')
      .insert({
        user_id: userId,
        provider,
        email_address: email,
        subscriptions_found: subscriptions.length,
        payload_encrypted: encryptApiKey(JSON.stringify(subscriptions)),
      })
      .select('id')
      .single()

    // Teasers always run on the default model, never BYOK.
    const teaserMetrics = {
      emailsScanned: emailCount,
      durationMs: duration,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: totalCost,
      model: modelName,
    }

    if (teaserInsertError) {
      console.error('[Discovery] Error storing teaser:', teaserInsertError)
      // The scan already ran and cost money, so log the spend even though there
      // is no parent row to attach it to.
      await recordAnalytics(supabase, 'failed', {
        userId,
        provider,
        mode: 'teaser',
        isByok: false,
        errorMessage: `Failed to store teaser: ${teaserInsertError.message}`,
        metrics: teaserMetrics,
      })
      return { success: false, kind: 'unknown', error: 'Failed to store discovery results' }
    }

    await recordAnalytics(supabase, 'completed', {
      userId,
      provider,
      mode: 'teaser',
      isByok: false,
      parent: { teaserId: teaserRow.id },
      metrics: teaserMetrics,
    })

    return {
      success: true,
      teaser: true,
      subscriptionsFound: subscriptions.length,
      preview: subscriptions.slice(0, TEASER_PREVIEW_COUNT),
      emailCount,
      email,
    }
  }

  const { data: runRow, error: insertError } = await supabase
    .from('DISCOVERY_RUNS')
    .insert({
      user_id: userId,
      email_address: email,
      provider,
      discovered_at: new Date().toISOString(),
      subscriptions_found: subscriptions.length,
      is_byok: isByokMode,
    })
    .select('id')
    .single()

  const runMetrics = {
    emailsScanned: emailCount,
    durationMs: duration,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    costUsd: totalCost,
    model: isByokMode ? (byokConfig?.model ?? null) : modelName,
  }

  if (runRow) {
    await recordAnalytics(supabase, 'completed', {
      userId,
      provider,
      mode: 'full',
      isByok: isByokMode,
      parent: { runId: runRow.id },
      metrics: runMetrics,
    })
  } else {
    console.error('[Discovery] Error recording discovery run:', insertError)
    // The scan already ran and cost money. Record the spend unparented rather
    // than losing it, since the run row this would have pointed at never landed.
    await recordAnalytics(supabase, 'failed', {
      userId,
      provider,
      mode: 'full',
      isByok: isByokMode,
      errorMessage: `Failed to record discovery run: ${insertError?.message ?? 'unknown error'}`,
      metrics: runMetrics,
    })
  }

  return { success: true, subscriptions, emailCount, email, runId: runRow?.id }
}
