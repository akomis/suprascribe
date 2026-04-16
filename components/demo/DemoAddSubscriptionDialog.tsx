'use client'

import { AddSubscriptionOptions } from '@/components/dashboard/AddSubscriptionOptions'
import { SubscriptionForm } from '@/components/dashboard/SubscriptionForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useDemoCreateSubscription } from '@/lib/demo/useDemoSubscriptions'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { Plus } from 'lucide-react'
import * as React from 'react'

export type ViewType = 'options' | 'auto-discover' | 'manual'

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
  const [internalOpen, setInternalOpen] = React.useState(false)
  const [currentView, setCurrentView] = React.useState<ViewType>(initialView)

  const isControlled = externalOpen !== undefined
  const open = isControlled ? externalOpen : internalOpen
  const setOpen = isControlled ? onExternalOpenChange! : setInternalOpen

  React.useEffect(() => {
    if (open) {
      setCurrentView(initialView)
    }
  }, [open, initialView])

  const handleSubmit = async (data: CreateSubscriptionFormData) => {
    await createSubscriptionMutation.mutateAsync(data)
    setOpen(false)
    setCurrentView('options')
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setCurrentView('options')
    }
  }

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
              onSelectAutoDiscover={() => {}}
              onSelectManual={handleSelectManual}
              forceDisableAutoDiscovery
              disabledTooltipMessage="Email discovery requires sign-in"
            />
          </div>
        )}

        {currentView === 'manual' && (
          <div className="fade-on-mount space-y-4">
            <SubscriptionForm
              onSubmit={handleSubmit}
              onCancel={() => {
                setCurrentView('options')
              }}
              isSubmitting={createSubscriptionMutation.isPending}
              submitError={createSubscriptionMutation.error}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
