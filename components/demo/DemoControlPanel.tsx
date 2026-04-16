'use client'

import { DemoSignUpPromptDialog } from '@/components/demo/DemoSignUpPromptDialog'
import { CurrencySelector } from '@/components/dashboard/settings/CurrencySelector'
import { ThemePicker } from '@/components/dashboard/settings/ThemePicker'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Bell, Key, Settings } from 'lucide-react'
import * as React from 'react'

export function DemoControlPanel() {
  const [byokPromptOpen, setByokPromptOpen] = React.useState(false)
  const [remindersPromptOpen, setRemindersPromptOpen] = React.useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            aria-label="Open control panel"
            className="h-8 w-8 shrink-0"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="min-w-[200px] w-fit px-2 py-4 flex flex-col gap-2"
        >
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex-1">
              <CurrencySelector triggerClassName="w-full text-xs sm:text-sm" />
            </div>
            <div className="flex-1">
              <ThemePicker triggerClassName="w-full" />
            </div>
          </div>
          <Button
            variant="outline"
            type="button"
            aria-label="API key settings"
            onClick={() => setByokPromptOpen(true)}
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <Key className="h-4 w-4" />
            API Keys
          </Button>
          <Button
            variant="outline"
            type="button"
            aria-label="Reminder settings"
            onClick={() => setRemindersPromptOpen(true)}
            className="w-full justify-start gap-2 text-muted-foreground"
          >
            <Bell className="h-4 w-4" />
            Renewal Reminders
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
      <DemoSignUpPromptDialog
        open={byokPromptOpen}
        onOpenChange={setByokPromptOpen}
        featureName="API Keys"
        featureDescription="Bring your own AI API key for unlimited email discovery. Sign up to access this feature."
      />
      <DemoSignUpPromptDialog
        open={remindersPromptOpen}
        onOpenChange={setRemindersPromptOpen}
        featureName="Renewal Reminders"
        featureDescription="Get email reminders before your subscriptions renew. Sign up to access this feature."
      />
    </>
  )
}
