import type { DiscoveredSubscription } from '@/lib/types/forms'

// Client-side persistence for one-time discovery results so an accidental page
// leave doesn't lose them. Stored in localStorage only - never sent to a server.
export interface SavedRun {
  id: string
  email: string | null
  discoveredAt: string // ISO timestamp
  subscriptions: DiscoveredSubscription[]
}

const STORAGE_KEY = 'suprascribe_once_runs'
const DISMISS_KEY = 'suprascribe_once_import_dismissed'
const MAX_RUNS = 10

// Persistent flag so a user who opts out of the import prompt is never asked again.
export function isImportDismissed(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function setImportDismissed(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Storage full or disabled - non-fatal.
  }
}

export function loadRuns(): SavedRun[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedRun[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveRun(run: SavedRun): SavedRun[] {
  const runs = [run, ...loadRuns().filter((r) => r.id !== run.id)].slice(0, MAX_RUNS)
  persist(runs)
  return runs
}

export function removeRun(id: string): SavedRun[] {
  const runs = loadRuns().filter((r) => r.id !== id)
  persist(runs)
  return runs
}

function persist(runs: SavedRun[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
  } catch {
    // Storage full or disabled - non-fatal.
  }
}
