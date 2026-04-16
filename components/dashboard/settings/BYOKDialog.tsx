'use client'

import { BYOKSettings } from '@/components/dashboard/settings/BYOKSettings'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Key } from 'lucide-react'

type BYOKDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BYOKDialog({ open, onOpenChange }: BYOKDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[300px] max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API Keys
          </DialogTitle>
          <DialogDescription>
            Bring your own AI API keys for unlimited email discovery. Your keys are encrypted and
            never logged. Discovery quality and speed vary by model.
          </DialogDescription>
        </DialogHeader>
        <BYOKSettings />
      </DialogContent>
    </Dialog>
  )
}
