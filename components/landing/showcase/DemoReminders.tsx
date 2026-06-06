'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Bell } from 'lucide-react'
import * as React from 'react'

export default function DemoReminders() {
  const [daysBefore, setDaysBefore] = React.useState(5)

  return (
    <div className="p-3 sm:p-4 rounded-2xl border bg-background space-y-4">
      {/* Mock email card */}
      <div className="rounded-xl border bg-muted/30 overflow-hidden">
        {/* Email header bar */}
        <div className="flex items-center gap-2 px-3 py-2 border-b bg-background/60 text-xs text-muted-foreground">
          <Bell className="size-3.5" />
          <span className="truncate">
            <span className="font-medium text-foreground">Suprascribe</span>
            {' - Renewal reminder'}
          </span>
        </div>

        {/* Email body */}
        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg overflow-hidden shrink-0">
              <ServiceLogo
                name="Spotify"
                serviceUrl="https://spotify.com"
                size={40}
                className="size-full rounded-lg"
                fallbackClassName="size-5"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold">Spotify renews soon</p>
              <p className="text-xs text-muted-foreground">
                Your subscription renews on Jun 9, 2026
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Days slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-muted-foreground">Days before renewal</Label>
          <span className="text-xs font-semibold tabular-nums">
            {daysBefore} {daysBefore === 1 ? 'day' : 'days'}
          </span>
        </div>
        <Slider
          value={[daysBefore]}
          onValueChange={(v) => setDaysBefore(v[0])}
          min={1}
          max={30}
          step={1}
          className="w-full"
        />
        <p className="text-[11px] text-muted-foreground">
          Get notified {daysBefore} {daysBefore === 1 ? 'day' : 'days'} before each renewal.
        </p>
      </div>
    </div>
  )
}
