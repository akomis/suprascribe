'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { usePWAInstall } from '@/providers/PWAInstallProvider'
import { Check, Download } from 'lucide-react'
import * as React from 'react'

const ROW_CLASSNAME = 'w-full justify-start gap-2 text-muted-foreground font-normal'

export function PWAInstallRow() {
  const { isInstalled, isIOS, canInstall, promptInstall } = usePWAInstall()
  const [showIOSHelp, setShowIOSHelp] = React.useState(false)

  if (isInstalled) {
    return (
      <Button
        variant="outline"
        type="button"
        disabled
        aria-label="App installed"
        className={ROW_CLASSNAME}
      >
        <Check className="h-4 w-4" />
        App Installed
      </Button>
    )
  }

  if (canInstall) {
    return (
      <Button
        variant="outline"
        type="button"
        aria-label="Install app"
        onClick={() => void promptInstall()}
        className={ROW_CLASSNAME}
      >
        <Download className="h-4 w-4" />
        Install App
      </Button>
    )
  }

  if (isIOS) {
    return (
      <div className="flex flex-col gap-1">
        <Button
          variant="outline"
          type="button"
          aria-label="Install app"
          aria-expanded={showIOSHelp}
          onClick={() => setShowIOSHelp((open) => !open)}
          className={ROW_CLASSNAME}
        >
          <Download className="h-4 w-4" />
          Install App
        </Button>
        {showIOSHelp && (
          <p className="px-1 text-xs text-muted-foreground">
            Tap <span className="font-medium">Share</span> then{' '}
            <span className="font-medium">Add to Home Screen</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Wrapper needed: a disabled button doesn't fire the pointer events the tooltip listens for. */}
        <span className="w-full">
          <Button
            variant="outline"
            type="button"
            disabled
            aria-label="Install app"
            className={ROW_CLASSNAME}
          >
            <Download className="h-4 w-4" />
            Install App
          </Button>
        </span>
      </TooltipTrigger>
      <TooltipContent>Not available in this browser, or already installed</TooltipContent>
    </Tooltip>
  )
}
