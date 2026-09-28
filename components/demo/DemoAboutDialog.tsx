'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function DemoAboutDialog() {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => setIsOpen(true)}
            aria-label="About this demo"
            className="rounded-md outline-none ring-offset-primary focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 hover:cursor-pointer p-1 hover:bg-primary-foreground/15"
          >
            <Info className="h-4 w-4 text-primary-foreground/80" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <span>About this demo</span>
        </TooltipContent>
      </Tooltip>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="min-w-[300px] max-w-sm">
          <DialogHeader>
            <DialogTitle>Suprascribe Live Demo</DialogTitle>
            <DialogDescription>
              This is the real dashboard, loaded with a sample household&apos;s subscriptions
              instead of yours. Nothing here is connected to an inbox and nothing you change is
              saved, so edit, cancel and re-sort freely.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  )
}
