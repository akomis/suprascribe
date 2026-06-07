'use client'

import { SubscriptionForm } from '@/components/dashboard/SubscriptionForm'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { useDeleteSubscription, useUpdateSubscription } from '@/lib/hooks/useSubscriptions'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import { CreateSubscriptionFormData } from '@/lib/types/forms'

export type EditBillingActions = {
  update: {
    mutateAsync: (args: { id: number; data: CreateSubscriptionFormData }) => Promise<unknown>
    isPending: boolean
    error: Error | null
  }
  delete: {
    mutateAsync: (id: number) => Promise<unknown>
    isPending: boolean
  }
}

type EditBillingDialogBaseProps = {
  subscription: UserSubscriptionWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  actions: EditBillingActions
  disableServiceName?: boolean
}

export function EditBillingDialogBase({
  subscription,
  open,
  onOpenChange,
  onSuccess,
  actions,
  disableServiceName = false,
}: EditBillingDialogBaseProps) {
  const handleSubmit = async (entries: CreateSubscriptionFormData[]) => {
    if (!subscription) return
    await actions.update.mutateAsync({ id: subscription.id, data: entries[0] })
    onOpenChange(false)
    onSuccess?.()
  }

  const handleDelete = async () => {
    if (!subscription) return
    await actions.delete.mutateAsync(subscription.id)
    onOpenChange(false)
    onSuccess?.()
  }

  if (!subscription) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Billing Period</DialogTitle>
        </DialogHeader>
        <SubscriptionForm
          subscription={subscription}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={actions.update.isPending}
          submitError={actions.update.error}
          disableServiceName={disableServiceName}
          deleteButton={
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={actions.delete.isPending || actions.update.isPending}
                    >
                      {actions.delete.isPending ? <Spinner className="size-4" /> : 'Delete'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this billing period?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will remove this billing period and its related costs. It cannot
                        be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={actions.delete.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} disabled={actions.delete.isPending}>
                        DELETE
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}

export function EditBillingDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
  disableServiceName,
}: Omit<EditBillingDialogBaseProps, 'actions'>) {
  const updateMutation = useUpdateSubscription()
  const deleteMutation = useDeleteSubscription()

  return (
    <EditBillingDialogBase
      subscription={subscription}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      actions={{ update: updateMutation, delete: deleteMutation }}
      disableServiceName={disableServiceName}
    />
  )
}
