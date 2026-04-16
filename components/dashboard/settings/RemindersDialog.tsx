'use client'

import { ReminderSettings } from '@/components/dashboard/settings/ReminderSettings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Bell } from 'lucide-react'

type RemindersDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function RemindersDialog({ open, onOpenChange }: RemindersDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[300px] max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Renewal Reminders
          </DialogTitle>
          <DialogDescription>
            Get email reminders before your subscriptions renew. Only applies to subscriptions with
            auto-renewal enabled.
          </DialogDescription>
        </DialogHeader>
        <ReminderSettings />
      </DialogContent>
    </Dialog>
  )
}
