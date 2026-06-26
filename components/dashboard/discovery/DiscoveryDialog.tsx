'use client'

import { DiscoveredSubscriptionGroupCard } from '@/components/dashboard/discovery/DiscoveredSubscriptionGroupCard'
import { DiscoveryEditDialog } from '@/components/dashboard/discovery/DiscoveryEditDialog'
import { SupportButton } from '@/components/shared/SupportButton'
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
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useSubscriptions } from '@/lib/hooks/useSubscriptions'
import type { DiscoveryTeaser } from '@/lib/hooks/discovery/useDiscoveryCore'
import type { CreateSubscriptionFormData, DiscoveredSubscription } from '@/lib/types/forms'
import {
  cn,
  convertDiscoveredToFormData,
  formDataToDiscovered,
  isDuplicateSubscription,
  isSubscriptionActive,
} from '@/lib/utils'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { UpgradeButton } from '@/components/UpgradeButton'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type GroupedItem = { sub: DiscoveredSubscription; index: number }
type SubscriptionGroup = { serviceName: string; serviceUrl?: string; items: GroupedItem[] }

function getGroupedItems(items: GroupedItem[]): SubscriptionGroup[] {
  const groups = new Map<string, GroupedItem[]>()
  items.forEach((item) => {
    if (!groups.has(item.sub.service_name)) groups.set(item.sub.service_name, [])
    groups.get(item.sub.service_name)!.push(item)
  })
  groups.forEach((g) =>
    g.sort((a, b) => {
      const diff = new Date(b.sub.end_date).getTime() - new Date(a.sub.end_date).getTime()
      return diff !== 0
        ? diff
        : new Date(b.sub.start_date).getTime() - new Date(a.sub.start_date).getTime()
    }),
  )
  return Array.from(groups.entries())
    .sort(
      ([, a], [, b]) =>
        new Date(b[0].sub.end_date).getTime() - new Date(a[0].sub.end_date).getTime(),
    )
    .map(([serviceName, items]) => ({ serviceName, serviceUrl: items[0]?.sub.service_url, items }))
}

function DiscoveryGroupList({
  groups,
  selectedSubscriptions,
  isDuplicateGroup,
  isSaving,
  onToggle,
  onEdit,
}: {
  groups: SubscriptionGroup[]
  selectedSubscriptions: Set<number>
  isDuplicateGroup: boolean
  isSaving: boolean
  onToggle: (index: number, checked: boolean) => void
  onEdit: (index: number) => void
}) {
  return (
    <>
      {groups.map((group) => (
        <DiscoveredSubscriptionGroupCard
          key={`${isDuplicateGroup ? 'dup' : 'sub'}-${group.serviceName}`}
          serviceName={group.serviceName}
          serviceUrl={group.serviceUrl}
          items={group.items.map(({ sub, index }) => ({
            subscription: sub,
            index,
            isSelected: isDuplicateGroup ? false : selectedSubscriptions.has(index),
            isDuplicate: isDuplicateGroup,
          }))}
          onToggle={onToggle}
          onEdit={onEdit}
          disabled={isSaving}
        />
      ))}
    </>
  )
}

function DiscoveringView({
  providerName,
  isByok,
  isLoadingAI,
  aiProvider,
  aiModel,
  elapsedSeconds,
}: {
  providerName: string
  isByok?: boolean
  isLoadingAI?: boolean
  aiProvider?: string
  aiModel?: string
  elapsedSeconds: number
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Discovering Your Subscriptions</DialogTitle>
        <DialogDescription>
          Using {providerName} inbox to find subscriptions
          {isByok &&
            (isLoadingAI ? (
              <span className="inline-flex items-center gap-1 ml-1">
                <Spinner className="size-3" />
              </span>
            ) : (
              aiProvider &&
              aiModel && (
                <>
                  {' '}
                  with {aiProvider}&apos;s {aiModel}
                </>
              )
            ))}
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center justify-between py-8 px-4">
        <div className="flex items-center gap-2">
          <Spinner className="size-10 text-primary shrink-0" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Analyzing...</p>
            <p className="text-xs text-muted-foreground">This may take a few moments</p>
          </div>
        </div>
        <div className="text-2xl font-mono text-muted-foreground tabular-nums">
          {elapsedSeconds}
          <span className="text-sm">s</span>
        </div>
      </div>
    </>
  )
}

function ErrorView({
  error,
  onClose,
  onRetry,
  isRetrying,
}: {
  error: string
  onClose: () => void
  onRetry: () => void
  isRetrying: boolean
}) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Discovery Failed</DialogTitle>
        <DialogDescription>
          There was a technical error discovering your subscriptions.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">{error}</div>
      </div>
      <DialogFooter>
        <SupportButton category="bug_report" />
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? (
            <>
              <Spinner />
              Retrying...
            </>
          ) : (
            'Retry'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

function WarningView({ warning, onClose }: { warning: string; onClose: () => void }) {
  return (
    <>
      <DialogHeader>
        <DialogTitle>Discovery Limit Reached</DialogTitle>
        <DialogDescription>This email address was recently discovered.</DialogDescription>
      </DialogHeader>
      <div className="rounded-md bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-400">
        {warning}
        <p className="text-sm text-muted-foreground">
          <a
            href="/limits"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Learn more about discovery limits
          </a>
        </p>
      </div>
      <DialogFooter>
        <SupportButton />
        <Button onClick={onClose}>Close</Button>
      </DialogFooter>
    </>
  )
}

function NoResultsView({
  providerName,
  emailCount,
  elapsedTime,
  onClose,
}: {
  providerName: string
  emailCount?: number | null
  elapsedTime: number | null
  onClose: () => void
}) {
  const suffix =
    emailCount != null
      ? ` (scanned ${emailCount} email${emailCount !== 1 ? 's' : ''})`
      : elapsedTime !== null
        ? ` (searched for ${elapsedTime}s)`
        : ''
  return (
    <>
      <DialogHeader>
        <DialogTitle>No Subscriptions Found</DialogTitle>
        <DialogDescription>
          We couldn&apos;t find any subscription emails in your {providerName} inbox{suffix}.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <p className="text-sm text-muted-foreground text-center">
          You can continue adding subscriptions manually or try again later.
        </p>
      </div>
      <DialogFooter>
        <Button onClick={onClose}>Continue</Button>
      </DialogFooter>
    </>
  )
}

function ReviewSubscriptionsView({
  discoveredSubscriptions,
  selectedSubscriptions,
  isSaving,
  showDuplicates,
  onToggleShowDuplicates,
  checkIfDuplicate,
  onToggle,
  onEdit,
  onCancel,
  onSave,
}: {
  discoveredSubscriptions: DiscoveredSubscription[]
  selectedSubscriptions: Set<number>
  isSaving: boolean
  showDuplicates: boolean
  onToggleShowDuplicates: () => void
  checkIfDuplicate: (index: number) => boolean
  onToggle: (index: number, checked: boolean) => void
  onEdit: (index: number) => void
  onCancel: () => void
  onSave: () => void
}) {
  const allSubs = discoveredSubscriptions.map((sub, index) => ({ sub, index }))
  const nonDuplicates = allSubs.filter(({ index }) => !checkIfDuplicate(index))
  const duplicates = allSubs.filter(({ index }) => checkIfDuplicate(index))

  const activeGroups = getGroupedItems(
    nonDuplicates.filter(({ sub }) => isSubscriptionActive(sub.start_date, sub.end_date)),
  )
  const pastGroups = getGroupedItems(
    nonDuplicates.filter(({ sub }) => !isSubscriptionActive(sub.start_date, sub.end_date)),
  )
  const duplicateGroups = getGroupedItems(duplicates)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-hidden">
      <DialogHeader>
        <DialogTitle>Review Subscriptions</DialogTitle>
        <DialogDescription asChild>
          <div className="space-y-2 my-4">
            <p className="text-sm text-muted-foreground">
              These subscriptions were identified by AI and may contain mistakes. Use the edit
              button to correct any details before importing and the X to mark false positives to
              not be imported to Suprascribe.
            </p>
          </div>
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 py-2 overflow-y-auto flex-1 pr-2">
        <div className="flex flex-col gap-2 mb-4">
          {activeGroups.length > 0 && (
            <Badge variant="outline" className="text-xs font-medium">
              Active
            </Badge>
          )}
          <DiscoveryGroupList
            groups={activeGroups}
            selectedSubscriptions={selectedSubscriptions}
            isDuplicateGroup={false}
            isSaving={isSaving}
            onToggle={onToggle}
            onEdit={onEdit}
          />
        </div>
        {pastGroups.length > 0 && (
          <Badge variant="outline" className="text-xs font-medium">
            Past
          </Badge>
        )}
        <DiscoveryGroupList
          groups={pastGroups}
          selectedSubscriptions={selectedSubscriptions}
          isDuplicateGroup={false}
          isSaving={isSaving}
          onToggle={onToggle}
          onEdit={onEdit}
        />

        {duplicateGroups.length > 0 && (
          <>
            <Separator orientation="horizontal" />
            <button
              type="button"
              onClick={onToggleShowDuplicates}
              className="flex items-center justify-between w-full py-2 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Duplicate subscriptions ({duplicates.length})</span>
              <ChevronDown
                className={cn('size-4 transition-transform', showDuplicates && 'rotate-180')}
              />
            </button>
            {showDuplicates && (
              <DiscoveryGroupList
                groups={duplicateGroups}
                selectedSubscriptions={selectedSubscriptions}
                isDuplicateGroup={true}
                isSaving={isSaving}
                onToggle={onToggle}
                onEdit={onEdit}
              />
            )}
          </>
        )}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Spinner /> : 'Done'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function TeaserPreviewRow({ sub }: { sub: DiscoveredSubscription }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
        <ServiceLogo name={sub.service_name} serviceUrl={sub.service_url} />
      </div>
      <div className="flex flex-1 items-center justify-between gap-2 min-w-0">
        <span className="font-medium truncate">{sub.service_name}</span>
        {sub.price > 0 && (
          <span className="text-sm text-muted-foreground tabular-nums">
            {formatCurrencyAmount(sub.price, (sub.currency as CurrencyCode) ?? 'USD')}
          </span>
        )}
      </div>
    </div>
  )
}

function TeaserBlurredRow() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border p-3 blur-sm select-none pointer-events-none"
      aria-hidden="true"
    >
      <div className="size-10 rounded-lg bg-muted flex-shrink-0" />
      <div className="flex flex-1 items-center justify-between gap-2">
        <span className="h-4 w-32 rounded bg-muted" />
        <span className="h-4 w-12 rounded bg-muted" />
      </div>
    </div>
  )
}

function TeaserLockedView({ teaser, onClose }: { teaser: DiscoveryTeaser; onClose: () => void }) {
  const hiddenCount = Math.max(teaser.subscriptionsFound - teaser.preview.length, 0)
  // Cap the number of blurred placeholder rows so the dialog stays compact.
  const placeholderRows = Math.min(hiddenCount, 4)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-hidden">
      <DialogHeader>
        <DialogTitle>We found {teaser.subscriptionsFound} subscriptions!</DialogTitle>
        <DialogDescription>
          Here&apos;s a peek at what we discovered in your inbox. Upgrade to Pro to unlock and
          import the full list - no need to scan again.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 py-4 overflow-y-auto flex-1 pr-1">
        {teaser.preview.map((sub, i) => (
          <TeaserPreviewRow key={`preview-${i}`} sub={sub} />
        ))}

        {placeholderRows > 0 && (
          <div className="relative">
            <div className="flex flex-col gap-2">
              {Array.from({ length: placeholderRows }).map((_, i) => (
                <TeaserBlurredRow key={`blur-${i}`} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-sm font-medium shadow-sm">
                <Lock className="size-4" />
                {hiddenCount} more locked
              </div>
            </div>
          </div>
        )}
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={onClose}>
          Maybe later
        </Button>
        <UpgradeButton text="Upgrade to unlock all" location="discovery_teaser" />
      </DialogFooter>
    </div>
  )
}

function ExitWarningDialog({
  open,
  onKeepGoing,
  onClose,
}: {
  open: boolean
  onKeepGoing: () => void
  onClose: () => void
}) {
  return (
    <AlertDialog open={open} onOpenChange={onKeepGoing}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Discovery?</AlertDialogTitle>
          <AlertDialogDescription>
            Closing now will discard your progress. You&apos;ll need to reinitialize the discovery
            process to try again.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onKeepGoing}>Keep Going</AlertDialogCancel>
          <AlertDialogAction onClick={onClose}>Close Anyway</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

interface DiscoveryDialogProps {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  teaser?: DiscoveryTeaser | null
  emailCount?: number | null
  error: string | null
  warning: string | null
  clearDiscovery: () => void
  retry: () => void
  providerName: string
  aiProvider?: string
  aiModel?: string
  isLoadingAI?: boolean
  isByok?: boolean
  onImport?: (entries: CreateSubscriptionFormData[]) => Promise<void>
}

export function DiscoveryDialog({
  isDiscovering,
  discoveredSubscriptions,
  teaser,
  emailCount,
  error,
  warning,
  clearDiscovery,
  retry,
  providerName,
  aiProvider,
  aiModel,
  isLoadingAI,
  isByok,
  onImport,
}: DiscoveryDialogProps) {
  const queryClient = useQueryClient()
  const { data: existingSubscriptions = [] } = useSubscriptions({ skipStale: true })
  const [showDialog, setShowDialog] = useState(false)
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<number>>(new Set())
  const [editedSubscriptions, setEditedSubscriptions] = useState<DiscoveredSubscription[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showExitWarning, setShowExitWarning] = useState(false)
  const hasStartedDiscovery = useRef(false)
  const [finalElapsedTime, setFinalElapsedTime] = useState<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  // Keep a local, editable copy of the discovered list so edits live in the data itself.
  useEffect(() => {
    setEditedSubscriptions(discoveredSubscriptions)
  }, [discoveredSubscriptions])

  const checkIfDuplicate = (discoveredIndex: number): boolean => {
    const discovered = editedSubscriptions[discoveredIndex]
    if (!discovered) return false

    return existingSubscriptions.some((merged) => {
      return merged.subscriptions.some((existing) => {
        return isDuplicateSubscription(
          {
            service_name: discovered.service_name,
            start_date: discovered.start_date,
            end_date: discovered.end_date,
          },
          {
            subscription_service: existing.subscription_service
              ? { name: existing.subscription_service.name }
              : null,
            start_date: existing.start_date,
            end_date: existing.end_date,
          },
        )
      })
    })
  }

  useEffect(() => {
    if (isDiscovering) {
      // Use setTimeout to avoid synchronous setState during effect
      const initTimer = setTimeout(() => {
        setElapsedSeconds(0)
        setFinalElapsedTime(null)
        startTimeRef.current = Date.now()
      }, 0)

      const interval = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 1000)

      return () => {
        clearTimeout(initTimer)
        clearInterval(interval)
        if (startTimeRef.current && finalElapsedTime === null) {
          setFinalElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }
    }
  }, [isDiscovering, finalElapsedTime])

  useEffect(() => {
    if (isDiscovering) {
      hasStartedDiscovery.current = true
    }

    if (
      isDiscovering ||
      discoveredSubscriptions.length > 0 ||
      teaser != null ||
      error !== null ||
      warning !== null ||
      hasStartedDiscovery.current
    ) {
      setShowDialog(true)
    }
  }, [isDiscovering, discoveredSubscriptions, teaser, error, warning])

  useEffect(() => {
    if (editedSubscriptions.length > 0) {
      const nonDuplicateIndices = editedSubscriptions
        .map((_, index) => index)
        .filter((index) => !checkIfDuplicate(index))
      // Use setTimeout to avoid synchronous setState during effect
      const timer = setTimeout(() => {
        setSelectedSubscriptions(new Set(nonDuplicateIndices))
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [editedSubscriptions, existingSubscriptions])

  const handleClose = () => {
    setShowDialog(false)
    setSelectedSubscriptions(new Set())
    setEditedSubscriptions([])
    setEditingIndex(null)
    hasStartedDiscovery.current = false
    setFinalElapsedTime(null)
    startTimeRef.current = null
    setElapsedSeconds(0)
    clearDiscovery()
  }

  const handleEditSave = (index: number, data: CreateSubscriptionFormData) => {
    setEditedSubscriptions((prev) =>
      prev.map((sub, i) => (i === index ? formDataToDiscovered(data, sub) : sub)),
    )
  }

  const handleToggleSubscription = (index: number, checked: boolean) => {
    setSelectedSubscriptions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(index)
      } else {
        newSet.delete(index)
      }
      return newSet
    })
  }

  const handleSaveSelected = async () => {
    setIsSaving(true)

    const subscriptionsToAdd = editedSubscriptions
      .map((sub, index) => ({ sub, index }))
      .filter(({ index }) => selectedSubscriptions.has(index))

    if (onImport) {
      const entries = subscriptionsToAdd.map(({ sub }) => convertDiscoveredToFormData(sub))
      try {
        await onImport(entries)
        toast.success('Subscriptions Added', {
          description: `Successfully added ${entries.length} subscription${entries.length !== 1 ? 's' : ''}.`,
        })
      } catch {
        toast.error('Some subscriptions failed', {
          description: 'Could not add the selected subscriptions.',
        })
      }
      setIsSaving(false)
      handleClose()
      return
    }

    const results = await Promise.allSettled(
      subscriptionsToAdd.map(async ({ sub }) => {
        const formData = convertDiscoveredToFormData(sub)

        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to add subscription')
        }

        return response
      }),
    )

    const successCount = results.filter((result) => result.status === 'fulfilled').length
    const failCount = results.filter((result) => result.status === 'rejected').length

    setIsSaving(false)

    if (successCount > 0) {
      toast.success('Subscriptions Added', {
        description: `Successfully added ${successCount} subscription${successCount !== 1 ? 's' : ''}.`,
      })
    }

    if (failCount > 0) {
      toast.error('Some subscriptions failed', {
        description: `${failCount} subscription${failCount !== 1 ? 's' : ''} could not be added.`,
      })
    }

    if (successCount >= 0) {
      handleClose()
      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    }
  }

  if (!showDialog) return null

  return (
    <>
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open && editingIndex === null) setShowExitWarning(true)
        }}
      >
        <DialogContent
          className="sm:max-w-[600px] flex flex-col overflow-hidden"
          showCloseButton={true}
          onInteractOutside={(e) => {
            if (editingIndex !== null) return
            e.preventDefault()
            setShowExitWarning(true)
          }}
          onEscapeKeyDown={(e) => {
            if (editingIndex !== null) return
            e.preventDefault()
            setShowExitWarning(true)
          }}
        >
          {isDiscovering ? (
            <DiscoveringView
              providerName={providerName}
              isByok={isByok}
              isLoadingAI={isLoadingAI}
              aiProvider={aiProvider}
              aiModel={aiModel}
              elapsedSeconds={elapsedSeconds}
            />
          ) : error ? (
            <ErrorView
              error={error}
              onClose={handleClose}
              onRetry={retry}
              isRetrying={isDiscovering}
            />
          ) : teaser ? (
            <TeaserLockedView teaser={teaser} onClose={handleClose} />
          ) : discoveredSubscriptions.length > 0 ? (
            <ReviewSubscriptionsView
              discoveredSubscriptions={editedSubscriptions}
              selectedSubscriptions={selectedSubscriptions}
              isSaving={isSaving}
              showDuplicates={showDuplicates}
              onToggleShowDuplicates={() => setShowDuplicates((prev) => !prev)}
              checkIfDuplicate={checkIfDuplicate}
              onToggle={handleToggleSubscription}
              onEdit={setEditingIndex}
              onCancel={handleClose}
              onSave={handleSaveSelected}
            />
          ) : warning ? (
            <WarningView warning={warning} onClose={handleClose} />
          ) : (
            <NoResultsView
              providerName={providerName}
              emailCount={emailCount}
              elapsedTime={finalElapsedTime}
              onClose={handleClose}
            />
          )}
        </DialogContent>
      </Dialog>

      <ExitWarningDialog
        open={showExitWarning}
        onKeepGoing={() => setShowExitWarning(false)}
        onClose={() => {
          setShowExitWarning(false)
          handleClose()
        }}
      />

      {editingIndex !== null && (
        <DiscoveryEditDialog
          open={editingIndex !== null}
          onOpenChange={(open) => {
            if (!open) setEditingIndex(null)
          }}
          subscription={editedSubscriptions[editingIndex]}
          onSave={(data) => handleEditSave(editingIndex, data)}
        />
      )}
    </>
  )
}
