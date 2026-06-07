'use client'

import {
  EditBillingDialogBase,
  type EditBillingActions,
} from '@/components/dashboard/EditBillingDialog'
import {
  useDemoDeleteSubscription,
  useDemoUpdateSubscription,
} from '@/lib/demo/useDemoSubscriptions'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'

type DemoEditBillingDialogProps = {
  subscription: UserSubscriptionWithDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  disableServiceName?: boolean
}

export function DemoEditBillingDialog({
  subscription,
  open,
  onOpenChange,
  onSuccess,
  disableServiceName,
}: DemoEditBillingDialogProps) {
  const updateMutation = useDemoUpdateSubscription()
  const deleteMutation = useDemoDeleteSubscription()

  const actions: EditBillingActions = {
    update: updateMutation,
    delete: deleteMutation,
  }

  return (
    <EditBillingDialogBase
      subscription={subscription}
      open={open}
      onOpenChange={onOpenChange}
      onSuccess={onSuccess}
      actions={actions}
      disableServiceName={disableServiceName}
    />
  )
}
