'use client'

import { SubscriptionForm } from '@/components/dashboard/SubscriptionForm'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { UserSubscriptionWithDetails } from '@/lib/types/database'
import { CreateSubscriptionFormData, DiscoveredSubscription } from '@/lib/types/forms'
import { useState } from 'react'

type DiscoveryEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  subscription: DiscoveredSubscription
  onSave: (data: CreateSubscriptionFormData) => void
}

export function DiscoveryEditDialog({
  open,
  onOpenChange,
  subscription,
  onSave,
}: DiscoveryEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fakeSubscription = {
    subscription_service: {
      name: subscription.service_name,
      url: subscription.service_url ?? null,
    },
    price: subscription.price,
    currency: subscription.currency ?? 'USD',
    start_date: subscription.start_date,
    end_date: subscription.end_date,
    auto_renew: subscription.auto_renew ?? false,
  } as unknown as UserSubscriptionWithDetails

  const handleSubmit = async (data: CreateSubscriptionFormData) => {
    setIsSubmitting(true)
    onSave(data)
    setIsSubmitting(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription</DialogTitle>
        </DialogHeader>
        <SubscriptionForm
          subscription={fakeSubscription}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
          submitError={null}
        />
      </DialogContent>
    </Dialog>
  )
}
