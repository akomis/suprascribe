'use client'

import AccountSettings from '@/components/dashboard/settings/AccountSettings'
import { BYOKDialog } from '@/components/dashboard/settings/BYOKDialog'
import { CurrencySelector } from '@/components/dashboard/settings/CurrencySelector'
import LogoutButton from '@/components/dashboard/settings/LogoutButton'
import { RemindersDialog } from '@/components/dashboard/settings/RemindersDialog'
import { ThemePicker } from '@/components/dashboard/settings/ThemePicker'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { createClient } from '@/lib/supabase/client'
import { SupportButton } from '@/components/shared/SupportButton'
import { Bell, Key, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

export function ControlPanel() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [email, setEmail] = React.useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = React.useState(false)
  const [byokOpen, setByokOpen] = React.useState(false)
  const [remindersOpen, setRemindersOpen] = React.useState(false)
  const [passwordChangeMode, setPasswordChangeMode] = React.useState(false)
  const { hasAccess: hasEmailSupport } = useFeatureAccess('email_support')
  const { hasAccess: hasByokAccess } = useFeatureAccess('byok')
  const { hasAccess: hasReminderAccess } = useFeatureAccess('renewal_reminders')

  React.useEffect(() => {
    if (searchParams.get('settings') === 'byok') {
      setByokOpen(true)
      router.replace('/dashboard', { scroll: false })
    } else if (searchParams.get('settings') === 'reminders') {
      setRemindersOpen(true)
      router.replace('/dashboard', { scroll: false })
    } else if (searchParams.get('settings') === 'password') {
      setPasswordChangeMode(true)
      setSettingsOpen(true)
      router.replace('/dashboard', { scroll: false })
    } else if (searchParams.get('settings') === 'account') {
      setSettingsOpen(true)
      router.replace('/dashboard', { scroll: false })
    }
  }, [searchParams, router])

  React.useEffect(() => {
    let isMounted = true
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!isMounted) return
      const u = data.user
      setEmail(u?.email ?? null)
    }
    loadUser()
    return () => {
      isMounted = false
    }
  }, [supabase])

  return (
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
        alignOffset={-5}
        sideOffset={5}
        className="min-w-[150px] max-w-[calc(100vw-2rem)] w-fit px-2 py-4 flex flex-col gap-2"
      >
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="">
            <CurrencySelector triggerClassName="w-24 text-xs sm:text-sm" />
          </div>
          <div className="flex-1">
            <ThemePicker triggerClassName="w-full" />
          </div>
        </div>
        {hasByokAccess && (
          <Button
            variant="outline"
            type="button"
            aria-label="Open API key settings"
            onClick={() => setByokOpen(true)}
            className="w-full justify-start gap-2 text-muted-foreground font-normal"
          >
            <Key className="h-4 w-4" />
            AI API Keys (BYOK)
          </Button>
        )}
        {hasReminderAccess && (
          <Button
            variant="outline"
            type="button"
            aria-label="Open reminder settings"
            onClick={() => setRemindersOpen(true)}
            className="w-full justify-start gap-2 text-muted-foreground font-normal"
          >
            <Bell className="h-4 w-4" />
            Renewal Reminders
          </Button>
        )}
        <Button
          variant="outline"
          type="button"
          aria-label="Open account settings"
          onClick={() => setSettingsOpen(true)}
          className="w-full justify-start gap-2 text-muted-foreground font-normal"
        >
          <User className="h-4 w-4" />
          Account Settings
        </Button>

        {hasEmailSupport && (
          <>
            <DropdownMenuSeparator />
            <SupportButton className="w-full justify-start gap-2 text-muted-foreground font-normal" />
          </>
        )}

        <DropdownMenuSeparator />

        <LogoutButton
          variant="secondary"
          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive text-xs sm:text-sm"
        >
          Sign Out
        </LogoutButton>

        <DropdownMenuSeparator />

        <div className="text-xs text-muted-foreground text-center">
          <Link
            href="/safety"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Privacy & Safety
          </Link>
          {' · '}
          <Link
            href="/limits"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Discovery Limits
          </Link>
          {' · '}
          <Link
            href="/terms-and-privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Terms
          </Link>
        </div>
      </DropdownMenuContent>
      <AccountSettings
        open={settingsOpen}
        onOpenChange={(isOpen) => {
          setSettingsOpen(isOpen)
          if (!isOpen) setPasswordChangeMode(false)
        }}
        email={email ?? null}
        showPasswordChange={passwordChangeMode}
      />
      <BYOKDialog open={byokOpen} onOpenChange={setByokOpen} />
      <RemindersDialog open={remindersOpen} onOpenChange={setRemindersOpen} />
    </DropdownMenu>
  )
}

export default ControlPanel
