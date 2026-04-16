'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'

type DemoSignUpPromptDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  featureName: string
  featureDescription: string
}

export function DemoSignUpPromptDialog({
  open,
  onOpenChange,
  featureName,
  featureDescription,
}: DemoSignUpPromptDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[300px] max-w-sm">
        <DialogHeader>
          <DialogTitle>{featureName}</DialogTitle>
          <DialogDescription>{featureDescription}</DialogDescription>
        </DialogHeader>
        <div className="flex justify-end mt-2">
          <Button asChild>
            <Link href="/login?tab=signup">Sign Up Free</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
