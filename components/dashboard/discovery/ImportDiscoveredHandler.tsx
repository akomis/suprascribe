'use client'

import { DiscoveryDialog } from '@/components/dashboard/discovery/DiscoveryDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  isImportDismissed,
  loadRuns,
  removeRun,
  setImportDismissed,
  type SavedRun,
} from '@/lib/discovery/saved-runs'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { useEffect, useState } from 'react'

export function ImportDiscoveredHandler() {
  const [runs, setRuns] = useState<SavedRun[]>([])
  const [dismissed, setDismissed] = useState(false)
  const [importSubscriptions, setImportSubscriptions] = useState<DiscoveredSubscription[]>([])

  // localStorage read must happen after mount to avoid hydration mismatch.
  useEffect(() => {
    if (isImportDismissed()) {
      setDismissed(true)
      return
    }
    setRuns(loadRuns())
  }, [])

  const mergedSubscriptions = runs.flatMap((run) => run.subscriptions)
  const count = mergedSubscriptions.length

  const showPrompt = !dismissed && importSubscriptions.length === 0 && count > 0

  const handleNeverShow = () => {
    setImportDismissed()
    setDismissed(true)
  }

  const handleReview = () => {
    setImportSubscriptions(mergedSubscriptions)
  }

  const handleClearImport = () => {
    // Clear the local runs once the review dialog closes (imported or skipped).
    for (const run of runs) removeRun(run.id)
    setRuns([])
    setImportSubscriptions([])
    setDismissed(true)
  }

  const noun = `subscription${count !== 1 ? 's' : ''}`

  return (
    <>
      <AlertDialog open={showPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import your discovered subscriptions</AlertDialogTitle>
            <AlertDialogDescription>
              We found {count} {noun} from a scan on this device. Review and import them to your
              dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <button
              type="button"
              onClick={handleNeverShow}
              className="text-muted-foreground hover:text-foreground mr-auto text-sm underline-offset-4 hover:underline"
            >
              Don&apos;t show again
            </button>
            <AlertDialogCancel onClick={() => setDismissed(true)}>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={handleReview}>Review &amp; import</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {importSubscriptions.length > 0 && (
        <DiscoveryDialog
          isDiscovering={false}
          discoveredSubscriptions={importSubscriptions}
          emailCount={null}
          error={null}
          warning={null}
          clearDiscovery={handleClearImport}
          retry={() => {}}
          providerName="your scan"
        />
      )}
    </>
  )
}
