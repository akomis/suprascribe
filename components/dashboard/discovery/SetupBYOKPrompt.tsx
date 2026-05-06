'use client'

import { UpgradeButton } from '@/components/UpgradeButton'
import { Mail } from 'lucide-react'

export function SetupBYOKPrompt() {
  return (
    <div className="w-[300px] md:w-[450px] fade-on-mount">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Auto-discover your subscriptions</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Automatically find subscriptions from your email inbox. Available on Pro.
          </p>
        </div>

        <UpgradeButton size="sm" hideIfPro={false} location="byok_prompt" />
      </div>
    </div>
  )
}
