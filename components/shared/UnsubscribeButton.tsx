'use client'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  buildJustDeleteMeUrl,
  buildMissingLinkContactHref,
  openExternalUrl,
  type UnsubscribeSurface,
} from '@/lib/utils/unsubscribe'
import { UserX } from 'lucide-react'
import * as React from 'react'

function MissingUnsubscribeLinkDialog({
  open,
  onOpenChange,
  onOpenJustDeleteMe,
  serviceName,
  surface,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onOpenJustDeleteMe: () => void
  serviceName: string
  surface: UnsubscribeSurface
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>No unsubscribe link found</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We don&apos;t have a direct unsubscribe link for {serviceName}. You can let us know the
            correct one so we can add it, or look up the cancellation steps on JustDeleteMe.
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  buildMissingLinkContactHref(serviceName, surface),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              Contact us
            </Button>
            <Button onClick={onOpenJustDeleteMe}>Open JustDeleteMe</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export type UnsubscribeButtonProps = {
  serviceName: string
  unsubscribeUrl?: string | null
  surface: UnsubscribeSurface
  /** Called once the user has actually been sent to an unsubscribe destination. */
  onUnsubscribeOpened?: () => void
  className?: string
}

export function UnsubscribeButton({
  serviceName,
  unsubscribeUrl,
  surface,
  onUnsubscribeOpened,
  className,
}: UnsubscribeButtonProps) {
  const [showMissingLink, setShowMissingLink] = React.useState(false)

  const handleClick = () => {
    if (!unsubscribeUrl) {
      setShowMissingLink(true)
      return
    }
    openExternalUrl(unsubscribeUrl)
    onUnsubscribeOpened?.()
  }

  const handleOpenJustDeleteMe = () => {
    openExternalUrl(buildJustDeleteMeUrl(serviceName))
    setShowMissingLink(false)
    onUnsubscribeOpened?.()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleClick} className={className}>
        <UserX className="size-4" />
        Unsubscribe
      </Button>

      <MissingUnsubscribeLinkDialog
        open={showMissingLink}
        onOpenChange={setShowMissingLink}
        onOpenJustDeleteMe={handleOpenJustDeleteMe}
        serviceName={serviceName}
        surface={surface}
      />
    </>
  )
}
