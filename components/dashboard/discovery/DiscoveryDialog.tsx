'use client'

import { DiscoveredSubscriptionGroupCard } from '@/components/dashboard/discovery/DiscoveredSubscriptionGroupCard'
import { DiscoveryEditDialog } from '@/components/dashboard/discovery/DiscoveryEditDialog'
import { OneTimePurchaseNote } from '@/components/shared/OneTimePurchaseNote'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { overlapsExistingPeriod } from '@/lib/services/subscription-intake'
import type { MergedSubscriptionResponse } from '@/lib/types/subscriptions'
import type { DiscoveryTeaser } from '@/lib/hooks/discovery/useDiscoveryCore'
import type {
  DiscoveryErrorKind,
  TeaserPreviewEntry,
  TeaserPreviewGroup,
} from '@/lib/types/discovery'
import type {
  BillingPeriod,
  CreateSubscriptionFormData,
  DiscoveredSubscription,
} from '@/lib/types/forms'
import {
  cn,
  convertDiscoveredToFormData,
  formDataToDiscovered,
  isDuplicateSubscription,
  isSubscriptionActive,
} from '@/lib/utils'
import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import { UpgradeButton } from '@/components/UpgradeButton'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

// Loaded lazily to break the import cycle: this dialog opens the add dialog, whose
// auto-discover view renders EmailProviderSelection, which renders a DiscoveryDialog.
const AddSubscriptionDialog = dynamic(
  () => import('@/components/dashboard/AddSubscriptionDialog'),
  { ssr: false },
)

// What happens once the selected subscriptions are committed.
type ImportOutcome = 'close' | 'scan-another'

const TEASER_PERIOD_SUFFIX: Record<BillingPeriod, string> = {
  WEEKLY: '/wk',
  MONTHLY: '/mo',
  QUARTERLY: '/qtr',
  YEARLY: '/yr',
}

// Stable empty default, so the classification memo below is not invalidated on
// every render while the existing-subscriptions query has no data yet.
const NO_EXISTING_SUBSCRIPTIONS: MergedSubscriptionResponse[] = []

/**
 * What importing one discovered entry would actually do, mirroring what
 * intakeSubscription does on the server:
 *
 * - `duplicate`: refused outright as an exact match.
 * - `extend`: silently widens a period the user already owns and returns a 201
 *   that is indistinguishable from an insert. The row count does not change.
 * - `new`: inserted as a row the user can see.
 *
 * Only `new` puts anything in the list, so only `new` may be presented as
 * something found. Reporting the other two as additions is what makes a re-scan
 * look broken and sends people round the discovery flow again.
 */
type TrackedKind = 'new' | 'extend' | 'duplicate'

function classifyDiscovered(
  discovered: DiscoveredSubscription,
  existing: MergedSubscriptionResponse[],
): TrackedKind {
  const name = discovered.service_name.toLowerCase().trim()
  // The cadence classifier gives every discovered entry a period, and that is
  // the period intake judges the overlap on.
  const period = discovered.period
  let wouldExtend = false

  for (const merged of existing) {
    for (const row of merged.subscriptions) {
      // overlapsExistingPeriod does not look at service names - intake gets that
      // for free from its subscription_service_id filter - so scope it here, or
      // an overlapping Netflix period marks a Spotify charge as tracked.
      if ((row.subscription_service?.name ?? '').toLowerCase().trim() !== name) continue

      const isExact = isDuplicateSubscription(
        {
          service_name: discovered.service_name,
          start_date: discovered.start_date,
          end_date: discovered.end_date,
        },
        {
          subscription_service: row.subscription_service
            ? { name: row.subscription_service.name }
            : null,
          start_date: row.start_date,
          end_date: row.end_date,
        },
      )
      // Intake runs its exact-duplicate loop over every row before it considers
      // extending any of them, so an exact match anywhere outranks an overlap.
      if (isExact) return 'duplicate'

      if (
        overlapsExistingPeriod(
          { start_date: discovered.start_date, end_date: discovered.end_date, period },
          { start_date: row.start_date, end_date: row.end_date, period: row.period },
        )
      ) {
        wouldExtend = true
      }
    }
  }

  return wouldExtend ? 'extend' : 'new'
}

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
  kinds,
  isSaving,
  onToggle,
  onEdit,
}: {
  groups: SubscriptionGroup[]
  selectedSubscriptions: Set<number>
  kinds: TrackedKind[]
  isSaving: boolean
  onToggle: (index: number, checked: boolean) => void
  onEdit: (index: number) => void
}) {
  return (
    <>
      {groups.map((group) => (
        <DiscoveredSubscriptionGroupCard
          key={`${kinds[group.items[0]?.index] ?? 'new'}-${group.serviceName}`}
          serviceName={group.serviceName}
          serviceUrl={group.serviceUrl}
          items={group.items.map(({ sub, index }) => ({
            subscription: sub,
            index,
            // No longer forced false for the tracked group: an entry that would
            // extend a period the user owns stays selected, so the extension
            // still happens and their end dates keep up with the mailbox.
            isSelected: selectedSubscriptions.has(index),
            trackedAs: kinds[index] === 'new' ? null : (kinds[index] ?? null),
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

function WarningView({
  warning,
  warningKind,
  onClose,
}: {
  warning: string
  warningKind?: DiscoveryErrorKind | null
  onClose: () => void
}) {
  // A skipped scan is not a limit: nothing was spent and there is nothing to
  // upgrade for, so it gets its own framing rather than the rate-limit one.
  const isSkipped = warningKind === 'no_new_email'

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isSkipped ? 'Your List Is Up To Date' : 'Discovery Limit Reached'}
        </DialogTitle>
        <DialogDescription>
          {isSkipped
            ? 'Nothing has arrived in this inbox since your last scan, so there was nothing to look through.'
            : 'Upgrade to PRO for multiple discovery runs and more features.'}
        </DialogDescription>
      </DialogHeader>
      <div className="rounded-md bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-400">
        {warning}
        {!isSkipped && (
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
        )}
      </div>
      <DialogFooter>
        {!isSkipped && <SupportButton />}
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

/**
 * Shown when a scan found things but none of them would change the list.
 *
 * NoResultsView cannot say this: "we couldn't find any subscription emails" is
 * a different claim, and a false one here. What a user in this state needs is
 * the one sentence that stops them scanning again - that the inbox holds
 * nothing new - plus the evidence, because a bare "nothing new" from a scanner
 * they already distrust is exactly what sends them round again.
 */
function AlreadyTrackedView({
  subscriptions,
  kinds,
  selectedSubscriptions,
  showDetails,
  onToggleShowDetails,
  isSaving,
  onSave,
  onScanAnother,
}: {
  subscriptions: DiscoveredSubscription[]
  kinds: TrackedKind[]
  selectedSubscriptions: Set<number>
  showDetails: boolean
  onToggleShowDetails: () => void
  isSaving: boolean
  onSave: () => void
  onScanAnother?: () => void
}) {
  const count = subscriptions.length
  const groups = getGroupedItems(subscriptions.map((sub, index) => ({ sub, index })))

  return (
    <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-hidden">
      <DialogHeader>
        <DialogTitle>Nothing New to Import</DialogTitle>
        <DialogDescription>
          All {count} subscription{count !== 1 ? 's' : ''} we found {count !== 1 ? 'are' : 'is'}{' '}
          already in your list.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 py-2 overflow-y-auto flex-1 pr-2">
        <p className="text-sm text-muted-foreground">
          Your list is already up to date. Scanning this inbox again will keep finding the same{' '}
          {count}.
        </p>

        <Separator orientation="horizontal" />
        <button
          type="button"
          onClick={onToggleShowDetails}
          className="flex items-center justify-between w-full py-2 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <span>Show what we found ({count})</span>
          <ChevronDown className={cn('size-4 transition-transform', showDetails && 'rotate-180')} />
        </button>
        {showDetails && (
          <DiscoveryGroupList
            groups={groups}
            selectedSubscriptions={selectedSubscriptions}
            kinds={kinds}
            isSaving={isSaving}
            onToggle={() => {}}
            onEdit={() => {}}
          />
        )}
      </div>

      <DialogFooter className="flex flex-wrap justify-end items-center pt-4">
        {onScanAnother && (
          <Button variant="secondary" onClick={onScanAnother} disabled={isSaving}>
            Scan Another Inbox
          </Button>
        )}
        <Button onClick={onSave} disabled={isSaving}>
          {isSaving ? <Spinner /> : 'Done'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function ReviewSubscriptionsView({
  discoveredSubscriptions,
  selectedSubscriptions,
  isSaving,
  showDuplicates,
  onToggleShowDuplicates,
  kinds,
  isCheckingExisting,
  onToggle,
  onEdit,
  onSave,
  onScanAnother,
}: {
  discoveredSubscriptions: DiscoveredSubscription[]
  selectedSubscriptions: Set<number>
  isSaving: boolean
  showDuplicates: boolean
  onToggleShowDuplicates: () => void
  kinds: TrackedKind[]
  isCheckingExisting: boolean
  onToggle: (index: number, checked: boolean) => void
  onEdit: (index: number) => void
  onSave: () => void
  onScanAnother?: () => void
}) {
  const allSubs = discoveredSubscriptions.map((sub, index) => ({ sub, index }))
  // Duplicates and period extensions share one bucket: neither puts a row in
  // the list, so to the user they are the same thing - already tracked.
  const newItems = allSubs.filter(({ index }) => kinds[index] === 'new')
  const trackedItems = allSubs.filter(({ index }) => kinds[index] !== 'new')

  const activeGroups = getGroupedItems(
    newItems.filter(({ sub }) => isSubscriptionActive(sub.start_date, sub.end_date)),
  )
  const pastGroups = getGroupedItems(
    newItems.filter(({ sub }) => !isSubscriptionActive(sub.start_date, sub.end_date)),
  )
  const trackedGroups = getGroupedItems(trackedItems)

  // The counts read as part of the description rather than a separate tally
  // line, so the header is one sentence instead of a number strip plus prose.
  const isSingle = allSubs.length === 1
  const subject = isSingle ? 'This subscription' : `These ${allSubs.length} subscriptions`
  const breakdown =
    trackedItems.length > 0
      ? `, ${trackedItems.length} already tracked and ${newItems.length} new,`
      : ''
  const identifiedSentence = `${subject} ${isSingle ? 'was' : 'were'} identified by AI${breakdown} and may contain mistakes.`

  return (
    <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-hidden">
      <DialogHeader>
        <DialogTitle>Review Subscriptions</DialogTitle>
        <DialogDescription className="tabular-nums">
          {identifiedSentence} Use the edit button to correct any details before importing and the X
          to mark false positives to not be imported to Suprascribe.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 py-2 overflow-y-auto flex-1 pr-2">
        <div className="flex flex-col gap-2 mb-2">
          <DiscoveryGroupList
            groups={activeGroups}
            selectedSubscriptions={selectedSubscriptions}
            kinds={kinds}
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
          kinds={kinds}
          isSaving={isSaving}
          onToggle={onToggle}
          onEdit={onEdit}
        />

        {trackedGroups.length > 0 && (
          <>
            <Separator orientation="horizontal" />
            <button
              type="button"
              onClick={onToggleShowDuplicates}
              className="flex items-center justify-between w-full py-2 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Already in your list ({trackedItems.length})</span>
              <ChevronDown
                className={cn('size-4 transition-transform', showDuplicates && 'rotate-180')}
              />
            </button>
            {showDuplicates && (
              <DiscoveryGroupList
                groups={trackedGroups}
                selectedSubscriptions={selectedSubscriptions}
                kinds={kinds}
                isSaving={isSaving}
                onToggle={onToggle}
                onEdit={onEdit}
              />
            )}
          </>
        )}
      </div>

      <DialogFooter className="flex flex-wrap justify-end items-center pt-4">
        {onScanAnother && (
          <Button
            variant="secondary"
            onClick={onScanAnother}
            disabled={isSaving || isCheckingExisting}
          >
            Scan Another Inbox
          </Button>
        )}
        <Button onClick={onSave} disabled={isSaving || isCheckingExisting}>
          {isSaving ? <Spinner /> : 'Done'}
        </Button>
      </DialogFooter>
    </div>
  )
}

function TeaserPrice({ entry }: { entry: TeaserPreviewEntry }) {
  const periodSuffix = TEASER_PERIOD_SUFFIX[entry.period]

  return (
    <span className="font-medium text-sm whitespace-nowrap tabular-nums shrink-0">
      {formatCurrencyAmount(entry.price, (entry.currency as CurrencyCode) ?? 'EUR')}
      {periodSuffix}
    </span>
  )
}

function TeaserPreviewEntryRow({ entry }: { entry: TeaserPreviewEntry }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5 border-t first:border-t-0">
      <span className="text-xs text-muted-foreground">Recurring</span>
      <TeaserPrice entry={entry} />
    </div>
  )
}

function TeaserPreviewGroupCard({ group }: { group: TeaserPreviewGroup }) {
  // A single charge needs no breakdown, so its price sits on the service row itself.
  const soleEntry = group.entries.length === 1 ? group.entries[0] : null

  return (
    <Card className="border gap-0 py-4">
      <CardHeader className="gap-0">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg overflow-hidden flex-shrink-0">
            <ServiceLogo
              name={group.service_name}
              serviceUrl={group.service_url}
              size={64}
              className="size-full rounded-lg"
            />
          </div>
          <CardTitle className="text-base break-words flex-1 min-w-0">
            {group.service_name}
          </CardTitle>
          {soleEntry && <TeaserPrice entry={soleEntry} />}
        </div>
      </CardHeader>
      {!soleEntry && (
        <CardContent className="flex flex-col gap-0 pt-0">
          {group.entries.map((entry, i) => (
            <TeaserPreviewEntryRow key={`${group.service_name}-entry-${i}`} entry={entry} />
          ))}
        </CardContent>
      )}
    </Card>
  )
}

function TeaserPreviewList({ groups }: { groups: TeaserPreviewGroup[] }) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <TeaserPreviewGroupCard key={group.service_name} group={group} />
      ))}
    </div>
  )
}

function TeaserLockedView({ teaser, onClose }: { teaser: DiscoveryTeaser; onClose: () => void }) {
  // Cards arrive pre-grouped and sorted, live services first.
  const activeServices = teaser.preview.filter((group) => group.is_active)
  const pastServices = teaser.preview.filter((group) => !group.is_active)

  return (
    <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-hidden">
      <DialogHeader>
        <DialogTitle>We found {teaser.preview.length} subscriptions!</DialogTitle>
        <DialogDescription>
          Here&apos;s everything we discovered in your inbox. Upgrade to PRO to scan multiple
          inboxes and discover more subscriptions, import the full list with totals, start/renewal
          dates, quick unsubscribe links and renewal reminders - no need to scan again.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-2 py-4 overflow-y-auto flex-1 pr-1">
        {activeServices.length > 0 && (
          <>
            <Badge variant="outline" className="text-xs font-medium self-start">
              Active
            </Badge>
            <TeaserPreviewList groups={activeServices} />
          </>
        )}

        {pastServices.length > 0 && (
          <>
            <Badge variant="outline" className="text-xs font-medium self-start">
              Past
            </Badge>
            <TeaserPreviewList groups={pastServices} />
          </>
        )}
      </div>

      <DialogFooter className="flex-col sm:flex-row gap-2">
        <Button variant="outline" onClick={onClose}>
          Maybe later
        </Button>
        <UpgradeButton text="Upgrade to import & manage" location="discovery_teaser" />
      </DialogFooter>

      <OneTimePurchaseNote className="text-right pt-3" />
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
  warningKind?: DiscoveryErrorKind | null
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
  warningKind,
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
  // A literal [] default here would allocate a new array on every render, which
  // invalidates the classification memo, which re-runs the selection effect,
  // which re-renders - a loop that sustains itself whenever this query has no
  // data yet (the demo page, a teaser claim before the dashboard has loaded).
  const { data: existingSubscriptions = NO_EXISTING_SUBSCRIPTIONS, isPending: isCheckingExisting } =
    useSubscriptions({ skipStale: true })
  const [showDialog, setShowDialog] = useState(false)
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<number>>(new Set())
  const [editedSubscriptions, setEditedSubscriptions] = useState<DiscoveredSubscription[]>([])
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showExitWarning, setShowExitWarning] = useState(false)
  const [showProviderDialog, setShowProviderDialog] = useState(false)
  const hasStartedDiscovery = useRef(false)
  const [finalElapsedTime, setFinalElapsedTime] = useState<number | null>(null)
  const startTimeRef = useRef<number | null>(null)
  // Indices the user explicitly included/skipped. The default-selection effect below reruns on
  // every edit and on every existing-subscriptions refetch, so it must not overwrite these.
  const manuallyToggled = useRef<Set<number>>(new Set())

  // Keep a local, editable copy of the discovered list so edits live in the data itself.
  useEffect(() => {
    manuallyToggled.current = new Set()
    setEditedSubscriptions(discoveredSubscriptions)
  }, [discoveredSubscriptions])

  // One pass per data change, rather than an uncached scan of every existing
  // subscription per entry per render, in each of two separate consumers.
  const kinds = useMemo(
    () => editedSubscriptions.map((sub) => classifyDiscovered(sub, existingSubscriptions)),
    [editedSubscriptions, existingSubscriptions],
  )

  // Guard the frame between a new prop arriving and the copy effect running, so
  // a stale empty list cannot flash the all-tracked view.
  const allAlreadyTracked = editedSubscriptions.length > 0 && kinds.every((kind) => kind !== 'new')

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
      // Everything but an exact duplicate is selected: a period extension is a
      // real write that keeps the user's end dates level with their mailbox, so
      // it still goes. Only the entries intake would refuse are left out.
      const defaultSelectedIndices = editedSubscriptions
        .map((_, index) => index)
        .filter((index) => kinds[index] !== 'duplicate')
      // Use setTimeout to avoid synchronous setState during effect
      const timer = setTimeout(() => {
        setSelectedSubscriptions((prev) => {
          const next = new Set(defaultSelectedIndices)
          // Anything the user decided on wins over the default.
          manuallyToggled.current.forEach((index) => {
            if (prev.has(index)) next.add(index)
            else next.delete(index)
          })
          // ...except a duplicate, which the server would reject anyway. The
          // replay above can otherwise re-add an entry the user selected before
          // the existing-subscriptions refetch landed and reclassified it.
          kinds.forEach((kind, index) => {
            if (kind === 'duplicate') next.delete(index)
          })
          return next
        })
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [editedSubscriptions, kinds])

  const handleClose = () => {
    setShowDialog(false)
    setSelectedSubscriptions(new Set())
    manuallyToggled.current = new Set()
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
    manuallyToggled.current.add(index)
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

  // Runs once the import commits. "Scan Another Inbox" closes this dialog and hands off to
  // the existing add dialog on its email-provider view; everything else just closes.
  const finishImport = (next: ImportOutcome) => {
    handleClose()
    if (next === 'scan-another') setShowProviderDialog(true)
  }

  const handleSaveSelected = async (next: ImportOutcome = 'close') => {
    setIsSaving(true)

    // An exact duplicate is refused by intake, so posting one only ever buys a
    // failure toast. Filtering here makes that a property of the commit path
    // rather than something three effects happen to agree on.
    const subscriptionsToAdd = editedSubscriptions
      .map((sub, index) => ({ sub, index }))
      .filter(({ index }) => selectedSubscriptions.has(index) && kinds[index] !== 'duplicate')

    if (onImport) {
      const entries = subscriptionsToAdd.map(({ sub }) => convertDiscoveredToFormData(sub))
      try {
        await onImport(entries)
        if (entries.length > 0) {
          toast.success('Subscriptions Added', {
            description: `Successfully added ${entries.length} subscription${entries.length !== 1 ? 's' : ''}.`,
          })
        }
      } catch {
        toast.error('Some subscriptions failed', {
          description: 'Could not add the selected subscriptions.',
        })
      }
      setIsSaving(false)
      finishImport(next)
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

    // allSettled preserves input order, so each result maps back to the entry it
    // came from - and to whether that entry became a row or only moved an end
    // date. Intake returns 201 for both, so this is the only place the two can
    // still be told apart, and reporting an extension as an addition is what
    // made an unchanged list look like a failed import.
    const failCount = results.filter((result) => result.status === 'rejected').length
    let addedCount = 0
    let updatedCount = 0
    results.forEach((result, position) => {
      if (result.status !== 'fulfilled') return
      if (kinds[subscriptionsToAdd[position].index] === 'extend') updatedCount++
      else addedCount++
    })

    setIsSaving(false)

    if (addedCount > 0 || updatedCount > 0) {
      const parts = [
        addedCount > 0 ? `${addedCount} added` : null,
        updatedCount > 0 ? `${updatedCount} kept up to date` : null,
      ].filter(Boolean)

      toast.success('Import complete', { description: `${parts.join(' \u00b7 ')}.` })
    }

    if (failCount > 0) {
      toast.error('Some subscriptions failed', {
        description: `${failCount} subscription${failCount !== 1 ? 's' : ''} could not be added.`,
      })
    }

    await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    finishImport(next)
  }

  // Stay mounted while the handed-off provider dialog is open, then unmount with it.
  if (!showDialog) {
    return showProviderDialog ? (
      <AddSubscriptionDialog
        externalOpen={showProviderDialog}
        onExternalOpenChange={setShowProviderDialog}
        initialView="auto-discover"
        hideTrigger
      />
    ) : null
  }

  // Closing only discards something in two states: a scan still running, and
  // results with new entries waiting for review. Everywhere else - an error, a
  // limit notice, a list already up to date, no results, a locked teaser - there
  // is nothing to lose, and a confirmation warning about reinitialising
  // discovery is pure friction. Mirrors the view precedence below.
  const hasProgressToDiscard =
    isDiscovering ||
    (error === null && !teaser && discoveredSubscriptions.length > 0 && !allAlreadyTracked)

  const requestClose = () => {
    if (hasProgressToDiscard) setShowExitWarning(true)
    else handleClose()
  }

  return (
    <>
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open && editingIndex === null) requestClose()
        }}
      >
        <DialogContent
          className="sm:max-w-[600px] flex flex-col overflow-hidden"
          showCloseButton={true}
          onInteractOutside={(e) => {
            if (editingIndex !== null) return
            e.preventDefault()
            requestClose()
          }}
          onEscapeKeyDown={(e) => {
            if (editingIndex !== null) return
            e.preventDefault()
            requestClose()
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
            allAlreadyTracked ? (
              // Still committed through handleSaveSelected: nothing here is new,
              // but the period extensions among it are still worth writing.
              <AlreadyTrackedView
                subscriptions={editedSubscriptions}
                kinds={kinds}
                selectedSubscriptions={selectedSubscriptions}
                showDetails={showDuplicates}
                onToggleShowDetails={() => setShowDuplicates((prev) => !prev)}
                isSaving={isSaving}
                onSave={() => handleSaveSelected('close')}
                onScanAnother={() => handleSaveSelected('scan-another')}
              />
            ) : (
              <ReviewSubscriptionsView
                discoveredSubscriptions={editedSubscriptions}
                selectedSubscriptions={selectedSubscriptions}
                isSaving={isSaving}
                showDuplicates={showDuplicates}
                onToggleShowDuplicates={() => setShowDuplicates((prev) => !prev)}
                kinds={kinds}
                isCheckingExisting={isCheckingExisting && !onImport}
                onToggle={handleToggleSubscription}
                onEdit={setEditingIndex}
                onSave={() => handleSaveSelected('close')}
                onScanAnother={() => handleSaveSelected('scan-another')}
              />
            )
          ) : warning ? (
            <WarningView warning={warning} warningKind={warningKind} onClose={handleClose} />
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
