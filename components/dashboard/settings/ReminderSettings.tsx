'use client'

import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useReminderSettings } from '@/lib/hooks/useReminderSettings'
import { Loader2 } from 'lucide-react'
import * as React from 'react'

export function ReminderSettings() {
  const { settings, isLoading, isUpdating, updateSettings } = useReminderSettings()

  const [enabled, setEnabled] = React.useState(false)
  const [daysBefore, setDaysBefore] = React.useState(3)

  React.useEffect(() => {
    if (settings) {
      setEnabled(settings.email_reminders_enabled)
      setDaysBefore(settings.reminder_days_before)
    }
  }, [settings])

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked)
    updateSettings({
      email_reminders_enabled: checked,
      reminder_days_before: daysBefore,
    })
  }

  const handleDaysChange = (value: number[]) => {
    setDaysBefore(value[0])
  }

  const handleDaysCommit = (value: number[]) => {
    updateSettings({
      email_reminders_enabled: enabled,
      reminder_days_before: value[0],
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label htmlFor="reminder-toggle" className="flex flex-col gap-1 items-start">
          <span>Email reminders</span>
          <span className="text-xs text-muted-foreground font-normal">
            Receive reminder emails before renewals
          </span>
        </Label>
        <Switch
          id="reminder-toggle"
          checked={enabled}
          onCheckedChange={handleEnabledChange}
          disabled={isUpdating}
        />
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Days before renewal</Label>
            <span className="text-sm font-medium tabular-nums">
              {daysBefore} {daysBefore === 1 ? 'day' : 'days'}
            </span>
          </div>
          <Slider
            value={[daysBefore]}
            onValueChange={handleDaysChange}
            onValueCommit={handleDaysCommit}
            min={1}
            max={30}
            step={1}
            disabled={isUpdating}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            You&apos;ll receive a reminder {daysBefore} {daysBefore === 1 ? 'day' : 'days'} before
            each renewal.
          </p>
        </div>
      )}
    </div>
  )
}
