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
import { useTeaserStatus, useInvalidateTeaserStatus } from '@/lib/hooks/discovery/useTeaserStatus'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import { useState } from 'react'
import { toast } from 'sonner'

export function TeaserUnlockHandler() {
  const { status } = useTeaserStatus()
  const invalidateTeaserStatus = useInvalidateTeaserStatus()
  const [dismissed, setDismissed] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimedSubscriptions, setClaimedSubscriptions] = useState<DiscoveredSubscription[]>([])

  const showPrompt =
    !dismissed && claimedSubscriptions.length === 0 && !!status?.isPro && !!status?.hasPendingTeaser

  const handleClaim = async () => {
    setIsClaiming(true)
    try {
      const res = await fetch('/api/discovery/teaser', { method: 'POST' })
      const data: DiscoveryResponse = await res.json()

      if (!data.success || data.teaser) {
        toast.error('Unable to unlock', {
          description: !data.success ? data.error : 'Unexpected response.',
        })
        return
      }

      setClaimedSubscriptions(
        data.subscriptions.map((sub) => ({ ...sub, source_email: data.email })),
      )
      invalidateTeaserStatus()
    } catch {
      toast.error('Unable to unlock', { description: 'Please try again.' })
    } finally {
      setIsClaiming(false)
    }
  }

  const clearDiscovery = () => {
    setClaimedSubscriptions([])
    setDismissed(true)
    invalidateTeaserStatus()
  }

  return (
    <>
      <AlertDialog open={showPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Your subscriptions are ready to import</AlertDialogTitle>
            <AlertDialogDescription>
              We saved the {status?.subscriptionsFound ?? 0} subscriptions we discovered from your
              earlier scan. Unlock them now to review and import - no need to scan again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDismissed(true)} disabled={isClaiming}>
              Not now
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleClaim} disabled={isClaiming}>
              {isClaiming ? 'Unlocking…' : 'Unlock & review'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {claimedSubscriptions.length > 0 && (
        <DiscoveryDialog
          isDiscovering={false}
          discoveredSubscriptions={claimedSubscriptions}
          emailCount={null}
          error={null}
          warning={null}
          clearDiscovery={clearDiscovery}
          retry={() => {}}
          providerName="your inbox"
        />
      )}
    </>
  )
}
