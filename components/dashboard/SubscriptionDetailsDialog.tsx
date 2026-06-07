'use client'

import { EditBillingDialog } from '@/components/dashboard/EditBillingDialog'
import { SubscriptionBadge } from '@/components/dashboard/SubscriptionBadge'
import { SubscriptionForm } from '@/components/dashboard/SubscriptionForm'
import SubscriptionHistory from '@/components/dashboard/SubscriptionHistory'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { CurrencyCode } from '@/lib/hooks/useCurrency'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { useCreateSubscription, useDeleteSubscription } from '@/lib/hooks/useSubscriptions'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { cn } from '@/lib/utils'
import { toDateString } from '@/lib/utils/date'
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Info, Pencil, Plus, Trash2, UserX } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  serviceName,
  count,
  isPending,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  serviceName: string | null | undefined
  count: number
  isPending: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete All Subscription Entries</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete all {count} billing {count === 1 ? 'period' : 'periods'}{' '}
            for {serviceName}? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function UnsubscribeConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  serviceName,
  isLoading,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  serviceName: string | null | undefined
  isLoading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mark as Cancelled?</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Did you successfully unsubscribe from {serviceName}? You can mark this subscription as
            cancelled, which will set the end date to today and disable auto-renew.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Not Yet
            </Button>
            <Button onClick={onConfirm} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Mark as Cancelled'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function AddBillingPeriodDialog({
  open,
  onOpenChange,
  subscription,
  suggestedStartDate,
  onSubmit,
  isPending,
  error,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: UserSubscriptionWithDetails
  suggestedStartDate: string
  onSubmit: (entries: CreateSubscriptionFormData[]) => Promise<void>
  isPending: boolean
  error: Error | null
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Billing Period</DialogTitle>
        </DialogHeader>
        <SubscriptionForm
          subscription={{ ...subscription, start_date: suggestedStartDate, end_date: '' }}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isPending}
          submitError={error}
          isNewBillingPeriod={true}
        />
      </DialogContent>
    </Dialog>
  )
}

function openExternalUrl(url: string | null | undefined) {
  if (!url) return
  window.open(url.startsWith('http') ? url : `https://${url}`, '_blank', 'noopener,noreferrer')
}

type SubscriptionHeaderProps = {
  subscription: UserSubscriptionWithDetails
  mostRecentSubscription: UserSubscriptionWithDetails
  isPast: boolean | null | Date | string
  hasQuickUnsubscribe: boolean
  onOpenServiceUrl: () => void
  onOpenUnsubscribeUrl: () => void
}

function SubscriptionHeader({
  subscription,
  mostRecentSubscription,
  isPast,
  hasQuickUnsubscribe,
  onOpenServiceUrl,
  onOpenUnsubscribeUrl,
}: SubscriptionHeaderProps) {
  return (
    <DialogHeader>
      <div className="flex flex-row items-start justify-between gap-4 pt-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <DialogTitle className="sr-only">
              {subscription.subscription_service?.name || 'Subscription Details'}
            </DialogTitle>
            <SubscriptionBadge
              name={subscription.subscription_service?.name || 'Subscription Details'}
              url={subscription.subscription_service?.url ?? undefined}
              showLabel={true}
              size="lg"
            />
            {subscription.subscription_service?.url && (
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={onOpenServiceUrl}
                title="Open service website"
              >
                <ExternalLink className="size-4" />
              </Button>
            )}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:w-full">
            <div className="flex gap-2 items-center">
              <Badge variant="outline" className="text-sm font-medium px-2 py-0.5">
                {formatCurrencyAmount(
                  mostRecentSubscription.price || 0,
                  mostRecentSubscription.currency as CurrencyCode,
                )}
                {(
                  { WEEKLY: '/wk', MONTHLY: '/mo', QUARTERLY: '/qtr', YEARLY: '/yr' } as Record<
                    string,
                    string
                  >
                )[mostRecentSubscription.period] ?? '/mo'}
              </Badge>
              {mostRecentSubscription.payment_method && (
                <p className="text-sm text-muted-foreground">
                  Paid with {mostRecentSubscription.payment_method}
                </p>
              )}
            </div>
            {mostRecentSubscription.source_email && (
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                - Sourced by {mostRecentSubscription.source_email}
              </p>
            )}
          </div>
        </div>
        {!isPast && hasQuickUnsubscribe && (
          <Button variant="outline" size="sm" onClick={onOpenUnsubscribeUrl}>
            <UserX className="size-4" />
            Unsubscribe
          </Button>
        )}
      </div>
    </DialogHeader>
  )
}

function SubscriptionActions({
  subscriptionsToShow,
  mostRecentSubscription,
  hasSubscriptionHistory,
  isPast,
  isDeletePending,
  onEditFromDot,
  onEditFromButton,
  onDelete,
  onAddBilling,
}: {
  subscriptionsToShow: UserSubscriptionWithDetails[]
  mostRecentSubscription: UserSubscriptionWithDetails
  hasSubscriptionHistory: boolean
  isPast: boolean | null | Date | string
  isDeletePending: boolean
  onEditFromDot: (sub: UserSubscriptionWithDetails) => void
  onEditFromButton: (sub: UserSubscriptionWithDetails) => void
  onDelete: () => void
  onAddBilling: () => void
}) {
  return (
    <div className="space-y-4 max-w-full overflow-x-hidden">
      {hasSubscriptionHistory && (
        <>
          <SubscriptionHistory subscriptions={subscriptionsToShow} onEdit={onEditFromDot} />
          <div className="flex items-center gap-1 -mt-8">
            <Info className="text-muted-foreground/70" size={12} />
            <p className="text-xs text-muted-foreground/60 text-start">
              Click on a dot to edit that billing period
            </p>
          </div>
          <Separator />
        </>
      )}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onDelete}
          disabled={isDeletePending}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4 mr-1" />
          Delete
        </Button>
        {!isPast && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditFromButton(mostRecentSubscription)}
              title="Edit latest billing period"
            >
              <Pencil className="size-4" />
            </Button>
            <Button onClick={onAddBilling} className="gap-2" size="sm">
              <Plus className="size-4" />
              Billing Period
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export type SubscriptionDetailsActions = {
  create: {
    mutateAsync: (data: CreateSubscriptionFormData) => Promise<unknown>
    isPending: boolean
    error: Error | null
  }
  delete: {
    mutateAsync: (id: number) => Promise<unknown>
    isPending: boolean
  }
  markAsCancelled: (subscription: UserSubscriptionWithDetails, today: string) => Promise<void>
  hasSubscriptionHistory: boolean
  hasQuickUnsubscribe: boolean
  EditBillingDialog: React.ComponentType<{
    subscription: UserSubscriptionWithDetails | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    disableServiceName?: boolean
  }>
}

type BaseProps = {
  subscription: UserSubscriptionWithDetails
  allSubscriptions?: UserSubscriptionWithDetails[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDetailsDialogBase({
  subscription,
  allSubscriptions,
  open,
  onOpenChange,
  actions,
}: BaseProps & { actions: SubscriptionDetailsActions }) {
  const {
    create: createMutation,
    delete: deleteMutation,
    markAsCancelled: markAsCancelledAction,
    hasSubscriptionHistory,
    hasQuickUnsubscribe,
    EditBillingDialog: EditBillingDialogComponent,
  } = actions

  const [showAddBillingDialog, setShowAddBillingDialog] = React.useState(false)
  const [editingSubscription, setEditingSubscription] =
    React.useState<UserSubscriptionWithDetails | null>(null)
  const [editingFromDot, setEditingFromDot] = React.useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = React.useState(false)
  const [isMarkingCancelled, setIsMarkingCancelled] = React.useState(false)

  const subscriptionsToShow = allSubscriptions || [subscription]

  const mostRecentSubscription = React.useMemo(
    () =>
      [...subscriptionsToShow].sort(
        (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
      )[0],
    [subscriptionsToShow],
  )

  const suggestedStartDate = React.useMemo(() => {
    if (!mostRecentSubscription.end_date) return ''
    const endDate = new Date(mostRecentSubscription.end_date)
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return toDateString(nextDay)
  }, [mostRecentSubscription.end_date])

  const isPast =
    mostRecentSubscription.end_date && new Date(mostRecentSubscription.end_date) < new Date()

  const handleAddBilling = async (entries: CreateSubscriptionFormData[]) => {
    await createMutation.mutateAsync(entries[0])
    setShowAddBillingDialog(false)
    onOpenChange(false)
  }

  const handleDeleteAllSubscriptions = async () => {
    try {
      await Promise.all(subscriptionsToShow.map((sub) => deleteMutation.mutateAsync(sub.id)))
      setShowDeleteConfirm(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to delete subscriptions')
    }
  }

  const handleOpenServiceUrl = () => openExternalUrl(subscription.subscription_service?.url)

  const handleOpenUnsubscribeUrl = () => {
    const unsubscribeUrl =
      subscription.subscription_service?.unsubscribe_url ||
      `https://justdeleteme.xyz/#${encodeURIComponent((subscription.subscription_service?.name ?? '').toLowerCase().replace(/\s+/g, ''))}`
    openExternalUrl(unsubscribeUrl)
    setShowUnsubscribeConfirm(true)
  }

  const handleMarkAsCancelled = async () => {
    setIsMarkingCancelled(true)
    const today = toDateString(new Date())
    try {
      await markAsCancelledAction(mostRecentSubscription, today)
      toast.success('Subscription marked as cancelled')
      setShowUnsubscribeConfirm(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to mark subscription as cancelled')
    } finally {
      setIsMarkingCancelled(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          !hasSubscriptionHistory && 'sm:max-w-[550px]',
          hasSubscriptionHistory &&
            'w-[calc(100vw-2rem)] max-w-[calc(100vw-2rem)] md:min-w-[80vw] md:max-w-[80vw] xl:min-w-[60vw] xl:max-w-[60vw]',
        )}
      >
        <SubscriptionHeader
          subscription={subscription}
          mostRecentSubscription={mostRecentSubscription}
          isPast={isPast}
          hasQuickUnsubscribe={hasQuickUnsubscribe}
          onOpenServiceUrl={handleOpenServiceUrl}
          onOpenUnsubscribeUrl={handleOpenUnsubscribeUrl}
        />
        <SubscriptionActions
          subscriptionsToShow={subscriptionsToShow}
          mostRecentSubscription={mostRecentSubscription}
          hasSubscriptionHistory={hasSubscriptionHistory}
          isPast={isPast}
          isDeletePending={deleteMutation.isPending}
          onEditFromDot={(sub) => {
            setEditingSubscription(sub)
            setEditingFromDot(true)
          }}
          onEditFromButton={(sub) => {
            setEditingSubscription(sub)
            setEditingFromDot(false)
          }}
          onDelete={() => setShowDeleteConfirm(true)}
          onAddBilling={() => setShowAddBillingDialog(true)}
        />
      </DialogContent>

      <AddBillingPeriodDialog
        open={showAddBillingDialog}
        onOpenChange={setShowAddBillingDialog}
        subscription={mostRecentSubscription}
        suggestedStartDate={suggestedStartDate}
        onSubmit={handleAddBilling}
        isPending={createMutation.isPending}
        error={createMutation.error}
      />

      <EditBillingDialogComponent
        subscription={editingSubscription}
        open={Boolean(editingSubscription)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSubscription(null)
            setEditingFromDot(false)
          }
        }}
        onSuccess={() => onOpenChange(false)}
        disableServiceName={editingFromDot}
      />

      <DeleteConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDeleteAllSubscriptions}
        serviceName={subscription.subscription_service?.name}
        count={subscriptionsToShow.length}
        isPending={deleteMutation.isPending}
      />

      <UnsubscribeConfirmDialog
        open={showUnsubscribeConfirm}
        onOpenChange={setShowUnsubscribeConfirm}
        onConfirm={handleMarkAsCancelled}
        serviceName={subscription.subscription_service?.name}
        isLoading={isMarkingCancelled}
      />
    </Dialog>
  )
}

export function SubscriptionDetailsDialog({
  subscription,
  allSubscriptions,
  open,
  onOpenChange,
}: BaseProps) {
  const createMutation = useCreateSubscription()
  const deleteMutation = useDeleteSubscription()
  const queryClient = useQueryClient()
  const { hasAccess: hasSubscriptionHistory } = useFeatureAccess('subscription_history')
  const { hasAccess: hasQuickUnsubscribe } = useFeatureAccess('quick_unsubscribe')

  const actions: SubscriptionDetailsActions = {
    create: createMutation,
    delete: deleteMutation,
    markAsCancelled: async (sub, today) => {
      const response = await fetch(`/api/subscriptions/${sub.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ end_date: today, auto_renew: false }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark as cancelled')
      }
      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    },
    hasSubscriptionHistory,
    hasQuickUnsubscribe,
    EditBillingDialog,
  }

  return (
    <SubscriptionDetailsDialogBase
      subscription={subscription}
      allSubscriptions={allSubscriptions}
      open={open}
      onOpenChange={onOpenChange}
      actions={actions}
    />
  )
}
