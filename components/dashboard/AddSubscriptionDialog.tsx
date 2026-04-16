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
import { useCreateSubscription } from '@/lib/hooks/useSubscriptions'
import { CreateSubscriptionFormData } from '@/lib/types/forms'
import { Plus } from 'lucide-react'
import * as React from 'react'

export type ViewType = 'options' | 'auto-discover' | 'manual'

interface AddSubscriptionDialogProps {
  externalOpen?: boolean
  onExternalOpenChange?: (open: boolean) => void
  initialView?: ViewType
  hideTrigger?: boolean
}

export default function AddSubscriptionDialog({
  externalOpen,
  onExternalOpenChange,
  initialView = 'options',
  hideTrigger = false,
}: AddSubscriptionDialogProps = {}) {
  const createSubscriptionMutation = useCreateSubscription()
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

  const handleSelectAutoDiscover = React.useCallback(() => {
    setCurrentView('auto-discover')
  }, [])

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
            />
          </div>
        )}

        {currentView === 'auto-discover' && (
          <div className="fade-on-mount">
            <EmailProviderSelection />
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
