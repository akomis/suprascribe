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

type EditBillingDialogProps = {
  subscription: UserSubscriptionWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function EditBillingDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
}: EditBillingDialogProps) {
  const updateSubscriptionMutation = useUpdateSubscription()
  const deleteSubscriptionMutation = useDeleteSubscription()

  const handleSubmit = async (data: CreateSubscriptionFormData) => {
    if (!subscription) return

    await updateSubscriptionMutation.mutateAsync({
      id: subscription.id,
      data,
    })
    onOpenChange(false)
    onSuccess?.()
  }

  const handleDelete = async () => {
    if (!subscription) return

    await deleteSubscriptionMutation.mutateAsync(subscription.id)
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
          isSubmitting={updateSubscriptionMutation.isPending}
          submitError={updateSubscriptionMutation.error}
          deleteButton={
            <div className="flex flex-col gap-2 w-full">
              <div className="flex items-center gap-2">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      disabled={
                        deleteSubscriptionMutation.isPending || updateSubscriptionMutation.isPending
                      }
                    >
                      {deleteSubscriptionMutation.isPending ? (
                        <Spinner className="size-4" />
                      ) : (
                        'Delete'
                      )}
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
                      <AlertDialogCancel disabled={deleteSubscriptionMutation.isPending}>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleteSubscriptionMutation.isPending}
                      >
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
