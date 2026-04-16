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
import { formatCurrencyAmount } from '@/lib/utils/currency'
import { useQueryClient } from '@tanstack/react-query'
import { ExternalLink, Info, Mail, Pencil, Plus, Trash2, UserX } from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'

type SubscriptionDetailsDialogProps = {
  subscription: UserSubscriptionWithDetails
  allSubscriptions?: UserSubscriptionWithDetails[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SubscriptionDetailsDialog({
  subscription,
  allSubscriptions,
  open,
  onOpenChange,
}: SubscriptionDetailsDialogProps) {
  const createSubscriptionMutation = useCreateSubscription()
  const deleteSubscriptionMutation = useDeleteSubscription()
  const queryClient = useQueryClient()
  const [showAddBillingDialog, setShowAddBillingDialog] = React.useState(false)
  const [editingSubscription, setEditingSubscription] =
    React.useState<UserSubscriptionWithDetails | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false)
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = React.useState(false)
  const [isMarkingCancelled, setIsMarkingCancelled] = React.useState(false)

  const { hasAccess: hasSubscriptionHistory } = useFeatureAccess('subscription_history')
  const { hasAccess: hasQuickUnsubscribe } = useFeatureAccess('quick_unsubscribe')

  const subscriptionsToShow = allSubscriptions || [subscription]

  const mostRecentSubscription = React.useMemo(() => {
    return [...subscriptionsToShow].sort(
      (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
    )[0]
  }, [subscriptionsToShow])

  const suggestedStartDate = React.useMemo(() => {
    if (!mostRecentSubscription.end_date) return ''
    const endDate = new Date(mostRecentSubscription.end_date)
    const nextDay = new Date(endDate)
    nextDay.setDate(nextDay.getDate() + 1)
    return nextDay.toISOString().split('T')[0]
  }, [mostRecentSubscription.end_date])

  const isPast =
    mostRecentSubscription.end_date && new Date(mostRecentSubscription.end_date) < new Date()

  const handleAddBilling = async (data: CreateSubscriptionFormData) => {
    await createSubscriptionMutation.mutateAsync(data)
    setShowAddBillingDialog(false)
    onOpenChange(false)
  }

  const handleDeleteAllSubscriptions = async () => {
    try {
      await Promise.all(
        subscriptionsToShow.map((sub) => deleteSubscriptionMutation.mutateAsync(sub.id)),
      )
      setShowDeleteConfirm(false)
      onOpenChange(false)
    } catch {
      toast.error('Failed to delete subscriptions')
    }
  }

  const handleOpenServiceUrl = () => {
    const serviceUrl = subscription.subscription_service?.url
    if (serviceUrl) {
      const url = serviceUrl.startsWith('http') ? serviceUrl : `https://${serviceUrl}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const handleOpenUnsubscribeUrl = () => {
    const unsubscribeUrl = subscription.subscription_service?.unsubscribe_url
    if (unsubscribeUrl) {
      const url = unsubscribeUrl.startsWith('http') ? unsubscribeUrl : `https://${unsubscribeUrl}`
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    setShowUnsubscribeConfirm(true)
  }

  const handleMarkAsCancelled = async () => {
    setIsMarkingCancelled(true)
    const today = new Date().toISOString().split('T')[0]

    try {
      const response = await fetch(`/api/subscriptions/${mostRecentSubscription.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          end_date: today,
          auto_renew: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark as cancelled')
      }

      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
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
                    onClick={handleOpenServiceUrl}
                    title="Open service website"
                  >
                    <ExternalLink className="size-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <Badge variant="outline" className="text-sm font-medium px-2 py-0.5">
                  {formatCurrencyAmount(
                    mostRecentSubscription.price || 0,
                    mostRecentSubscription.currency as CurrencyCode,
                  )}
                </Badge>
                {mostRecentSubscription.payment_method && (
                  <p className="text-sm text-muted-foreground">
                    Paid with {mostRecentSubscription.payment_method}
                  </p>
                )}
                {mostRecentSubscription.source_email && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    {mostRecentSubscription.source_email}
                  </p>
                )}
              </div>
            </div>
            {!isPast &&
              hasQuickUnsubscribe &&
              subscription.subscription_service?.unsubscribe_url && (
                <Button variant="outline" size="sm" onClick={handleOpenUnsubscribeUrl}>
                  <UserX className="size-4" />
                  Unsubscribe
                </Button>
              )}
          </div>
        </DialogHeader>

        <div className="space-y-4 max-w-full overflow-x-hidden">
          {hasSubscriptionHistory && (
            <>
              <SubscriptionHistory
                subscriptions={subscriptionsToShow}
                onEdit={(sub) => setEditingSubscription(sub)}
              />
              <div className="flex items-center gap-1 -mt-8">
                <Info className="text-muted-foreground/70" size={12} />
                <p className="text-xs text-muted-foreground/60 text-start ">
                  Click on a dot to edit that billing period
                </p>
              </div>

              <Separator />
            </>
          )}

          {/* Footer with Action Buttons */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
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
                  onClick={() => setEditingSubscription(mostRecentSubscription)}
                  title="Edit latest billing period"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button onClick={() => setShowAddBillingDialog(true)} className="gap-2" size="sm">
                  <Plus className="size-4" />
                  Billing Period
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>

      {/* Nested Dialog for Adding New Billing Period */}
      <Dialog open={showAddBillingDialog} onOpenChange={setShowAddBillingDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Billing Period</DialogTitle>
          </DialogHeader>
          <SubscriptionForm
            subscription={{
              ...mostRecentSubscription,
              start_date: suggestedStartDate,
              end_date: '',
            }}
            onSubmit={handleAddBilling}
            onCancel={() => setShowAddBillingDialog(false)}
            isSubmitting={createSubscriptionMutation.isPending}
            submitError={createSubscriptionMutation.error}
            isNewBillingPeriod={true}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Billing Dialog */}
      <EditBillingDialog
        subscription={editingSubscription}
        open={Boolean(editingSubscription)}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSubscription(null)
          }
        }}
        onSuccess={() => {
          onOpenChange(false)
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete All Subscription Entries</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete all {subscriptionsToShow.length} billing{' '}
              {subscriptionsToShow.length === 1 ? 'period' : 'periods'} for{' '}
              {subscription.subscription_service?.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteSubscriptionMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAllSubscriptions}
                disabled={deleteSubscriptionMutation.isPending}
              >
                {deleteSubscriptionMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Unsubscribe Confirmation Dialog */}
      <Dialog open={showUnsubscribeConfirm} onOpenChange={setShowUnsubscribeConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Cancelled?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Did you successfully unsubscribe from {subscription.subscription_service?.name}? You
              can mark this subscription as cancelled, which will set the end date to today and
              disable auto-renew.
            </p>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowUnsubscribeConfirm(false)}
                disabled={isMarkingCancelled}
              >
                Not Yet
              </Button>
              <Button onClick={handleMarkAsCancelled} disabled={isMarkingCancelled}>
                {isMarkingCancelled ? 'Updating...' : 'Mark as Cancelled'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}
