'use client'

import {
  AddSubscriptionDialogBase,
  type AddSubscriptionActions,
  type ViewType,
} from '@/components/dashboard/AddSubscriptionDialog'
import { DemoEmailProviderSelection } from '@/components/demo/DemoEmailProviderSelection'
import { useDemoCreateSubscription } from '@/lib/demo/useDemoSubscriptions'

export type { ViewType }

interface DemoAddSubscriptionDialogProps {
  externalOpen?: boolean
  onExternalOpenChange?: (open: boolean) => void
  initialView?: ViewType
  hideTrigger?: boolean
}

export default function DemoAddSubscriptionDialog({
  externalOpen,
  onExternalOpenChange,
  initialView = 'options',
  hideTrigger = false,
}: DemoAddSubscriptionDialogProps = {}) {
  const createSubscriptionMutation = useDemoCreateSubscription()

  const actions: AddSubscriptionActions = {
    create: createSubscriptionMutation,
    autoDiscoverEnabled: true,
    AutoDiscoverComponent: DemoEmailProviderSelection,
  }

  return (
    <AddSubscriptionDialogBase
      externalOpen={externalOpen}
      onExternalOpenChange={onExternalOpenChange}
      initialView={initialView}
      hideTrigger={hideTrigger}
      actions={actions}
    />
  )
}
