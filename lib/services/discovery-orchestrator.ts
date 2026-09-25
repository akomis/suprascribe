import {
  EMAIL_DISCOVERY_CONFIG,
  TEASER_RESERVATION_TIMEOUT_MS,
  TEASER_RESERVED,
} from '@/lib/config/email-discovery'
import { hasFeatureAccess } from '@/lib/config/features'
import type { ProviderConfig } from '@/lib/services/ai-provider'
import { estimateCostUsd, recordAnalytics } from '@/lib/services/discovery-analytics'
import { getBYOKConfig } from '@/lib/services/byok'
import {
  countMatchingEmails,
  discover,
  resolveInboxAddress,
  type ImapCredentials,
} from '@/lib/services/subscription-discovery'
import { getUserTier } from '@/lib/supabase/tier'
import type { DiscoveryErrorKind, DiscoveryResponse } from '@/lib/types/discovery'
import { countDistinctServices } from '@/lib/utils'
import { checkRateLimit } from '@/lib/utils/discovery-rate-limit'
import { buildTeaserPreview } from '@/lib/utils/teaser-preview'
import { encryptApiKey } from '@/lib/utils/server-crypto'
import type { SupabaseClient } from '@supabase/supabase-js'

export type OrchestratorInput =
  | { provider: 'google' | 'microsoft'; token: string }
  | { provider: 'imap'; credentials: ImapCredentials }

type PolicyPass =
  | {
      ok: true
      mode: 'teaser'
      isByokMode: false
      byokConfig: undefined
      /** The row reserved for this scan, filled in once the results land. */
      teaserId: string
    }
  | { ok: true; mode: 'full'; isByokMode: boolean; byokConfig: ProviderConfig | undefined }
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
  // BYOK is a PRO feature - Basic users cannot use their stored keys
  const isByokMode = byokResult.ok && userTier === 'PRO'
  const byokConfig = isByokMode ? byokResult.config : undefined

  if (!isByokMode) {
    if (!hasFeatureAccess(userTier, 'auto_discovery')) {
      // BASIC, non-BYOK user: offer one free teaser scan instead of rejecting.
      return reserveTeaserSlot(userId, provider, supabase)
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

/**
 * Claims the user's single free-scan slot before the scan starts.
 *
 * The slot is the row in DISCOVERY_TEASERS, and its unique index on user_id is
 * what picks a winner. Checking for the row and inserting it only after the
 * scan would leave a 10-60s window in which a double-click, a retry or a second
 * tab all see no row, all scan, and every loser dies on
 * DISCOVERY_TEASERS_user_id_key with the model spend already incurred.
 * Inserting first collapses that window to nothing.
 *
 * The reserved row carries TEASER_RESERVED in the columns the scan has yet to
 * produce; `releaseTeaserSlot` removes it when the scan never gets that far.
 */
async function reserveTeaserSlot(
  userId: string,
  provider: string,
  supabase: SupabaseClient,
): Promise<PolicyResult> {
  const reserve = async () =>
    await supabase
      .from('DISCOVERY_TEASERS')
      .insert({
        user_id: userId,
        provider,
        email_address: TEASER_RESERVED,
        payload_encrypted: TEASER_RESERVED,
      })
      .select('id')
      .single()

  const slotTaken = async (): Promise<PolicyFail> => {
    const { data: holder } = await supabase
      .from('DISCOVERY_TEASERS')
      .select('email_address')
      .eq('user_id', userId)
      .maybeSingle()

    await recordAnalytics(supabase, 'rate_limited', {
      userId,
      provider,
      mode: 'teaser',
      isByok: false,
    })
    return {
      ok: false,
      kind: 'rate_limited',
      message:
        holder?.email_address === TEASER_RESERVED
          ? 'A free scan is already running - give it a moment.'
          : 'Free scan already used - upgrade to scan again.',
    }
  }

  let { data: reserved, error: reserveError } = await reserve()

  // 23505 = unique_violation: someone already holds this user's slot.
  if (reserveError?.code === '23505') {
    const { data: holder } = await supabase
      .from('DISCOVERY_TEASERS')
      .select('id, created_at, email_address')
      .eq('user_id', userId)
      .maybeSingle()

    const isStale =
      holder?.email_address === TEASER_RESERVED &&
      Date.now() - new Date(holder.created_at).getTime() > TEASER_RESERVATION_TIMEOUT_MS

    if (!isStale) return slotTaken()

    // The scan holding this one died mid-flight. Hand the slot back rather than
    // charging the user their free scan for a run that never returned.
    await supabase.from('DISCOVERY_TEASERS').delete().eq('id', holder.id)
    ;({ data: reserved, error: reserveError } = await reserve())

    // Lost the retry to another racer: they hold the slot now, not us.
    if (reserveError?.code === '23505') return slotTaken()
  }

  if (reserveError || !reserved) {
    console.error('[Discovery] Error reserving free scan slot:', reserveError)
    return { ok: false, kind: 'unknown', message: 'Failed to check free scan availability' }
  }

  return {
    ok: true,
    mode: 'teaser',
    isByokMode: false,
    byokConfig: undefined,
    teaserId: reserved.id,
  }
}

/**
 * How many emails the last completed scan of this address went through, or null
 * if this address has never been scanned to a stored run.
 *
 * Deliberately ignores DISCOVERY_TEASERS: an unclaimed teaser means the user
 * never received those results, so their first real scan must still run.
 */
async function lastScan(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<{ emailsScanned: number; subscriptionsFound: number } | null> {
  const { data: run } = await supabase
    .from('DISCOVERY_RUNS')
    .select('id, subscriptions_found')
    .eq('user_id', userId)
    .eq('email_address', email)
    .order('discovered_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!run) return null

  const { data: analytics } = await supabase
    .from('DISCOVERY_ANALYTICS')
    .select('emails_scanned')
    .eq('status', 'completed')
    .eq('run_id', run.id)
    .maybeSingle()

  if (analytics?.emails_scanned == null) return null

  return { emailsScanned: analytics.emails_scanned, subscriptionsFound: run.subscriptions_found }
}

/** How many distinct services the user currently tracks, across every inbox. */
async function trackedServiceCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number | null> {
  const { data, error } = await supabase
    .from('USER_SUBSCRIPTIONS')
    .select('subscription_service_id')
    .eq('user_id', userId)
    .is('deleted_at', null)

  if (error || !data) return null
  return new Set(data.map((row) => row.subscription_service_id)).size
}

/**
 * Whether this mailbox holds anything the last scan of it did not already see.
 *
 * Sizing the mailbox costs one listing call and no message bodies, where a scan
 * costs the user one of their 25 discoveries and us a model call. A re-scan of
 * an unchanged mailbox cannot produce anything the user does not already have,
 * so it should cost neither.
 *
 * The size is compared against DISCOVERY_ANALYTICS.emails_scanned rather than a
 * date cursor because every provider search window is day-granular - Gmail's
 * `after:`, Graph's `received>=` and IMAP's SINCE alike - and the re-scans this
 * exists to stop happen minutes apart.
 *
 * Two known imprecisions, both of which fail towards scanning:
 * - a message deleted and another arriving between scans leaves the count
 *   unchanged, so that one scan is skipped; the next new receipt clears it.
 * - at maxEmailsPerProvider the count saturates and stops meaning anything, so
 *   a capped mailbox always scans.
 *
 * An unchanged mailbox is also still worth scanning if the user has since
 * dropped subscriptions it had found: re-scanning is how someone recovers a row
 * they deleted by mistake, and skipping would leave them no way back.
 */
async function mailboxUnchanged(
  supabase: SupabaseClient,
  userId: string,
  input: OrchestratorInput,
  email: string,
): Promise<boolean> {
  const previous = await lastScan(supabase, userId, email)
  if (previous === null) return false

  const tracked = await trackedServiceCount(supabase, userId)
  if (tracked === null || tracked < previous.subscriptionsFound) return false

  const current = await countMatchingEmails(
    input.provider === 'imap'
      ? { provider: 'imap', credentials: input.credentials }
      : { provider: input.provider, credentials: { token: input.token } },
  )
  if (current === null) return false

  return current === previous.emailsScanned && current < EMAIL_DISCOVERY_CONFIG.maxEmailsPerProvider
}

/** Hands a free-scan slot back when its scan produced nothing to store. */
async function releaseTeaserSlot(supabase: SupabaseClient, teaserId: string): Promise<void> {
  const { error } = await supabase.from('DISCOVERY_TEASERS').delete().eq('id', teaserId)
  if (error) console.error('[Discovery] Error releasing free scan slot:', error)
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

  // Best-effort: anything that goes wrong sizing the mailbox falls through to a
  // normal scan, where the same failure gets reported properly. Never block a
  // discovery on the optimisation meant to save one.
  let knownEmail: string | undefined
  try {
    knownEmail = await resolveInboxAddress(discoveryInput)

    if (await mailboxUnchanged(supabase, userId, input, knownEmail)) {
      // Give the free-scan slot back: no scan ran, so it was never spent.
      if (policy.mode === 'teaser') await releaseTeaserSlot(supabase, policy.teaserId)

      await recordAnalytics(supabase, 'no_new_email', {
        userId,
        provider,
        mode,
        isByok: isByokMode,
        metrics: {
          emailsScanned: 0,
          durationMs: Date.now() - startTime,
          inputTokens: 0,
          outputTokens: 0,
          costUsd: 0,
          model: null,
        },
      })

      console.log(`[Discovery] ${provider} (${mode}) | skipped, mailbox unchanged`)

      return {
        success: false,
        kind: 'no_new_email',
        error: `No new receipts in ${knownEmail} since your last scan, so this did not use one of your discoveries.`,
      }
    }
  } catch (error) {
    console.error('[Discovery] Mailbox probe failed, scanning anyway:', error)
    knownEmail = undefined
  }

  try {
    result = await discover(discoveryInput, knownEmail)
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Discovery failed'
    // Nothing to store, so give the free-scan slot back - a provider hiccup
    // must not cost the user the one scan they get.
    if (policy.mode === 'teaser') await releaseTeaserSlot(supabase, policy.teaserId)
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

  // Counted per drop reason so an over-aggressive classifier shows up as a
  // lopsided histogram rather than as a quiet shortfall nobody can reproduce.
  const droppedByReason: Record<string, number> = {}
  // Its counterpart: which rule admitted each kept subscription, so a reported
  // false positive names the branch to tighten instead of starting a hunt.
  const keptByReason: Record<string, number> = {}
  for (const verdict of result.verdicts) {
    if (verdict.outcome === 'dropped' && verdict.reason) {
      droppedByReason[verdict.reason] = (droppedByReason[verdict.reason] ?? 0) + 1
    }
    if (verdict.outcome === 'recurring' && verdict.evidence) {
      keptByReason[verdict.evidence] = (keptByReason[verdict.evidence] ?? 0) + 1
    }
  }

  // A subscription the classifier accepted and the normalizer then rejected is
  // a loss no verdict records, so it is reported alongside the cadence drops
  // rather than vanishing between the two stages.
  if (result.rejectedCount > 0) droppedByReason.normalization_rejected = result.rejectedCount
  // Never a group, so never a verdict - but the count belongs in the same
  // histogram, because it is the rule most likely to be over-reaching.
  if (result.creditPurchases > 0) droppedByReason.credit_purchase = result.creditPurchases

  const classification = {
    chargesExtracted: result.chargeCount,
    subscriptionsKept: result.verdicts.filter((v) => v.outcome === 'recurring').length,
    droppedByReason,
    keptByReason,
    // Analysis units, not merchant groups: this is the denominator unitsFailed
    // is a fraction of, and verdicts.length counts something else entirely.
    unitsTotal: result.unitCount,
    unitsFailed: result.failedUnits.length,
    truncated: result.truncated,
    oldestEmailDate: result.oldestEmailDate,
  }
  const duration = Date.now() - startTime

  const { modelName } = EMAIL_DISCOVERY_CONFIG.analysisModel
  const totalCost = estimateCostUsd(usage)

  console.log(
    `[Discovery] ${provider} (${mode}, ${isByokMode ? 'BYOK' : 'default'}) | ✓ ${subscriptions.length}/${emailCount} subs | ${(duration / 1000).toFixed(1)}s | $${totalCost.toFixed(4)}`,
  )

  if (policy.mode === 'teaser') {
    // The stored count is what the teaser dialog shows: one card per service.
    const preview = buildTeaserPreview(subscriptions)

    // Fill in the slot reserved before the scan started. The full result is
    // persisted encrypted server-side; the client gets a count + preview only.
    const { error: teaserUpdateError } = await supabase
      .from('DISCOVERY_TEASERS')
      .update({
        email_address: email,
        subscriptions_found: preview.length,
        payload_encrypted: encryptApiKey(JSON.stringify(subscriptions)),
      })
      .eq('id', policy.teaserId)

    // Teasers always run on the default model, never BYOK.
    const teaserMetrics = {
      emailsScanned: emailCount,
      durationMs: duration,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: totalCost,
      model: modelName,
    }

    if (teaserUpdateError) {
      console.error('[Discovery] Error storing teaser:', teaserUpdateError)
      // The scan already ran and cost money, so log the spend even though the
      // results never landed, then release the slot rather than leaving the
      // user holding a reservation with nothing in it.
      await releaseTeaserSlot(supabase, policy.teaserId)
      await recordAnalytics(supabase, 'failed', {
        userId,
        provider,
        mode: 'teaser',
        isByok: false,
        errorMessage: `Failed to store teaser: ${teaserUpdateError.message}`,
        metrics: teaserMetrics,
      })
      return { success: false, kind: 'unknown', error: 'Failed to store discovery results' }
    }

    await recordAnalytics(supabase, 'completed', {
      userId,
      provider,
      mode: 'teaser',
      isByok: false,
      parent: { teaserId: policy.teaserId },
      metrics: teaserMetrics,
      classification,
    })

    return {
      success: true,
      teaser: true,
      subscriptionsFound: preview.length,
      preview,
      emailCount,
      email,
    }
  }

  // A mailbox that matched nothing never reached the model, so it must not cost
  // a discovery either - the quota is a plain DISCOVERY_RUNS row count. The
  // client still gets a success response, so the dialog says "no subscriptions
  // found" rather than reporting an error.
  if (emailCount === 0) {
    await recordAnalytics(supabase, 'no_new_email', {
      userId,
      provider,
      mode: 'full',
      isByok: isByokMode,
      metrics: {
        emailsScanned: 0,
        durationMs: duration,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        model: null,
      },
    })
    return { success: true, subscriptions, emailCount, email }
  }

  const { data: runRow, error: insertError } = await supabase
    .from('DISCOVERY_RUNS')
    .insert({
      user_id: userId,
      email_address: email,
      provider,
      discovered_at: new Date().toISOString(),
      subscriptions_found: countDistinctServices(subscriptions),
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
      classification,
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

  return { success: true, subscriptions, emailCount, email }
}
