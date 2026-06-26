'use client'

import { Button } from '@/components/ui/button'
import type { SavedRun } from '@/lib/discovery/saved-runs'
import { Trash2 } from 'lucide-react'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export function SavedRunsList({
  runs,
  onView,
  onRemove,
}: {
  runs: SavedRun[]
  onView: (run: SavedRun) => void
  onRemove: (id: string) => void
}) {
  if (runs.length === 0) return null

  return (
    <div className="w-full max-w-md flex flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground text-left">Your previous scans</p>
      {runs.map((run) => (
        <div key={run.id} className="flex items-center gap-3 rounded-lg border p-3 text-left">
          <button
            type="button"
            onClick={() => onView(run)}
            className="flex flex-1 items-start flex-col min-w-0 hover:opacity-80 transition-opacity"
          >
            <span className="font-medium truncate">{run.email ?? 'Inbox scan'}</span>
            <span className="text-xs text-muted-foreground">
              {run.subscriptions.length} subscription{run.subscriptions.length !== 1 ? 's' : ''} ·{' '}
              {formatDate(run.discoveredAt)}
            </span>
          </button>
          <Button variant="outline" size="sm" onClick={() => onView(run)} className="shrink-0">
            View
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(run.id)}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Remove saved scan"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  )
}
