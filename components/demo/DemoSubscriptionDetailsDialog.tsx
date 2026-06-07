'use client'

import {
  SubscriptionDetailsDialogBase,
  type SubscriptionDetailsActions,
} from '@/components/dashboard/SubscriptionDetailsDialog'
import { DemoEditBillingDialog } from '@/components/demo/DemoEditBillingDialog'
import {
  useDemoCreateSubscription,
  useDemoDeleteSubscription,
  useDemoUpdateSubscription,
} from '@/lib/demo/useDemoSubscriptions'
import type { CurrencyCode } from '@/lib/hooks/useCurrency'
import type { UserSubscriptionWithDetails } from '@/lib/types/database'

type DemoSubscriptionDetailsDialogProps = {
  subscription: UserSubscriptionWithDetails
  allSubscriptions?: UserSubscriptionWithDetails[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DemoSubscriptionDetailsDialog({
  subscription,
  allSubscriptions,
  open,
  onOpenChange,
}: DemoSubscriptionDetailsDialogProps) {
  const createMutation = useDemoCreateSubscription()
  const deleteMutation = useDemoDeleteSubscription()
  const updateMutation = useDemoUpdateSubscription()

  const actions: SubscriptionDetailsActions = {
    create: createMutation,
    delete: deleteMutation,
    markAsCancelled: async (sub, today) => {
      await updateMutation.mutateAsync({
        id: sub.id,
        data: {
          serviceName: sub.subscription_service?.name || '',
          serviceUrl: sub.subscription_service?.url || undefined,
          startDate: sub.start_date || '',
          endDate: today,
          autoRenew: false,
          price: sub.price || 0,
          currency: sub.currency as CurrencyCode,
          period: sub.period ?? 'MONTHLY',
          paymentMethod: sub.payment_method || undefined,
        },
      })
    },
    hasSubscriptionHistory: true,
    hasQuickUnsubscribe: true,
    EditBillingDialog: DemoEditBillingDialog,
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
