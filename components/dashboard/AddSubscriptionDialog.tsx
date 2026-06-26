'use client'

import { AddSubscriptionOptions } from '@/components/dashboard/AddSubscriptionOptions'
import { EmailProviderSelection } from '@/components/dashboard/EmailProviderSelection'
import { SubscriptionForm } from '@/components/dashboard/SubscriptionForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useAutoDiscoveryAccess } from '@/lib/hooks/useAutoDiscoveryAccess'
import { useCreateSubscription } from '@/lib/hooks/useSubscriptions'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { Plus } from 'lucide-react'
import * as React from 'react'

export type ViewType = 'options' | 'auto-discover' | 'manual'

export type AddSubscriptionActions = {
  create: {
    mutateAsync: (data: CreateSubscriptionFormData) => Promise<unknown>
    isPending: boolean
    error: Error | null
  }
  autoDiscoverEnabled: boolean
  AutoDiscoverComponent?: React.ComponentType<{ onComplete?: () => void }>
}

type AddSubscriptionDialogBaseProps = {
  externalOpen?: boolean
  onExternalOpenChange?: (open: boolean) => void
  initialView?: ViewType
  hideTrigger?: boolean
  actions: AddSubscriptionActions
}

export function AddSubscriptionDialogBase({
  externalOpen,
  onExternalOpenChange,
  initialView = 'options',
  hideTrigger = false,
  actions,
}: AddSubscriptionDialogBaseProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [currentView, setCurrentView] = React.useState<ViewType>(initialView)

  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = isControlled ? onExternalOpenChange! : setInternalOpen

  React.useEffect(() => {
    if (open) {
      // Use setTimeout to avoid synchronous setState during effect
      const timer = setTimeout(() => {
        setCurrentView(initialView)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [open, initialView])

  const handleSubmit = async (entries: CreateSubscriptionFormData[]) => {
    for (const entry of entries) {
      await actions.create.mutateAsync(entry)
    }
    setOpen(false)
    setCurrentView('options')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setCurrentView('options')
    }
  }

  const handleSelectAutoDiscover = React.useCallback(() => {
    if (actions.autoDiscoverEnabled) setCurrentView('auto-discover')
  }, [actions.autoDiscoverEnabled])

  const handleSelectManual = React.useCallback(() => {
    setCurrentView('manual')
  }, [])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {!hideTrigger && (
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1 sm:gap-2 text-xs sm:text-sm">
            <Plus className="size-3 sm:size-4" /> Add
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg">
        <DialogHeader className="hidden">
          <DialogTitle>Add Subscription</DialogTitle>
        </DialogHeader>

        {currentView === 'options' && (
          <div className="fade-on-mount">
            <AddSubscriptionOptions
              onSelectAutoDiscover={handleSelectAutoDiscover}
              onSelectManual={handleSelectManual}
              forceDisableAutoDiscovery={!actions.autoDiscoverEnabled}
              disabledTooltipMessage="Email discovery requires sign-in"
            />
          </div>
        )}

        {actions.autoDiscoverEnabled && currentView === 'auto-discover' && (
          <div className="fade-on-mount">
            {actions.AutoDiscoverComponent ? (
              <actions.AutoDiscoverComponent onComplete={() => handleOpenChange(false)} />
            ) : (
              <EmailProviderSelection />
            )}
          </div>
        )}

        {currentView === 'manual' && (
          <div className="fade-on-mount space-y-4">
            <SubscriptionForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setCurrentView('options')
              }}
              isSubmitting={actions.create.isPending}
              submitError={actions.create.error}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default function AddSubscriptionDialog({
  externalOpen,
  onExternalOpenChange,
  initialView = 'options',
  hideTrigger = false,
}: Omit<AddSubscriptionDialogBaseProps, 'actions'> = {}) {
  const createSubscriptionMutation = useCreateSubscription()
  const { hasAccess: autoDiscoverEnabled } = useAutoDiscoveryAccess()

  return (
    <AddSubscriptionDialogBase
      externalOpen={externalOpen}
      onExternalOpenChange={onExternalOpenChange}
      initialView={initialView}
      hideTrigger={hideTrigger}
      actions={{ create: createSubscriptionMutation, autoDiscoverEnabled }}
    />
  )
}
