import { EMAIL_DISCOVERY_CONFIG } from '@/lib/config/email-discovery'
import type { SupabaseClient } from '@supabase/supabase-js'

export type AnalyticsMode = 'full' | 'teaser' | 'one_time'
export type AnalyticsStatus = 'completed' | 'failed' | 'rate_limited' | 'no_new_email'

/** Exactly one of these is set on a completed attempt, none on a failed one. */
export type AnalyticsParent = { runId: string } | { teaserId: string } | { oneTimeId: string }

export type TokenUsage = { inputTokens: number; outputTokens: number }

/**
 * Estimates run cost from the default analysis model's pricing. BYOK runs bill
 * the user on their own provider, so for those this is indicative only - filter
 * on `is_byok` when totalling real spend.
 */
export function estimateCostUsd(usage: TokenUsage): number {
  const { inputCostPerMillion, outputCostPerMillion } = EMAIL_DISCOVERY_CONFIG.analysisModel
  const total =
    (usage.inputTokens / 1_000_000) * inputCostPerMillion +
    (usage.outputTokens / 1_000_000) * outputCostPerMillion
  return parseFloat(total.toFixed(6))
}

export type AnalyticsEntry = {
  /** Null only for the one-time funnel, which is anonymous by design. */
  userId?: string | null
  provider: string
  mode: AnalyticsMode
  isByok: boolean
  /** Present only when the attempt succeeded and produced a parent row. */
  parent?: AnalyticsParent
  errorMessage?: string
  metrics?: {
    emailsScanned: number
    durationMs: number
    inputTokens: number
    outputTokens: number
    costUsd: number
    model: string | null
  }
  /**
   * What the scan actually decided. Without this a run that discarded most of
   * the mailbox is indistinguishable from one that found little, which is how
   * the over-reporting in the first place went unnoticed for so long.
   */
  classification?: {
    chargesExtracted: number
    subscriptionsKept: number
    droppedByReason: Record<string, number>
    keptByReason: Record<string, number>
    unitsTotal: number
    unitsFailed: number
    truncated: boolean
    oldestEmailDate?: string
  }
}

/**
 * Records one discovery attempt - completed, failed, rate-limited, or skipped
 * because the mailbox held nothing new - with its cost and performance metrics.
 * This is the only place attempts are logged; DISCOVERY_RUNS, DISCOVERY_TEASERS
 * and ONE_TIME_DISCOVERIES hold successful scans only, which is what keeps the
 * quota rule a plain row count.
 *
 * Requires a service-role client: the table has no RLS policies so users can
 * never read cost data. Best-effort - telemetry must never fail a user's
 * discovery, so errors are logged and swallowed.
 */
export async function recordAnalytics(
  supabase: SupabaseClient,
  status: AnalyticsStatus,
  entry: AnalyticsEntry,
): Promise<void> {
  const parent = entry.parent
  const base = {
    user_id: entry.userId ?? null,
    provider: entry.provider,
    mode: entry.mode,
    status,
    error_message: entry.errorMessage ?? null,
    run_id: parent && 'runId' in parent ? parent.runId : null,
    teaser_id: parent && 'teaserId' in parent ? parent.teaserId : null,
    one_time_id: parent && 'oneTimeId' in parent ? parent.oneTimeId : null,
    emails_scanned: entry.metrics?.emailsScanned ?? null,
    duration_ms: entry.metrics?.durationMs ?? null,
    input_tokens: entry.metrics?.inputTokens ?? null,
    output_tokens: entry.metrics?.outputTokens ?? null,
    cost_usd: entry.metrics?.costUsd ?? null,
    model: entry.metrics?.model ?? null,
    is_byok: entry.isByok,
  }

  const classification = {
    charges_extracted: entry.classification?.chargesExtracted ?? null,
    subscriptions_kept: entry.classification?.subscriptionsKept ?? null,
    dropped_by_reason: entry.classification?.droppedByReason ?? null,
    kept_by_reason: entry.classification?.keptByReason ?? null,
    units_total: entry.classification?.unitsTotal ?? null,
    units_failed: entry.classification?.unitsFailed ?? null,
    truncated: entry.classification?.truncated ?? null,
    oldest_email_date: entry.classification?.oldestEmailDate ?? null,
  }

  const { error } = await supabase
    .from('DISCOVERY_ANALYTICS')
    .insert({ ...base, ...classification })

  if (!error) return

  console.error(`[Discovery] Failed to record ${status} analytics:`, error)

  // One bad value in the classification block rejects the whole insert, taking
  // the run's cost and token counts with it. That is not hypothetical: a
  // malformed oldest_email_date ("Fri, 14 Au") lost two complete scans before
  // anyone noticed, because the error is swallowed to keep telemetry from
  // failing a user's discovery. The base columns are values we constructed, so
  // retrying with those alone keeps the expensive half of the record.
  const { error: retryError } = await supabase.from('DISCOVERY_ANALYTICS').insert(base)

  if (retryError) {
    console.error(`[Discovery] Retry without classification also failed:`, retryError)
  }
}
