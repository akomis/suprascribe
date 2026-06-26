'use client'

import { UpgradeButton } from '@/components/UpgradeButton'
import { useTeaserStatus } from '@/lib/hooks/discovery/useTeaserStatus'
import { Mail } from 'lucide-react'

export function SetupBYOKPrompt() {
  const { status } = useTeaserStatus()
  const pendingTeaser =
    !!status?.hasPendingTeaser && !status?.isPro && status.subscriptionsFound > 0
  const teaserCount = status?.subscriptionsFound ?? 0

  return (
    <div className="w-[300px] md:w-[450px] fade-on-mount">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <Mail className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Auto-discover your subscriptions</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Automatically find subscriptions from your email inbox, with quick unsubscribe and
            renewal reminders.
          </p>
          <p className="text-sm text-muted-foreground">Available on Pro.</p>
        </div>

        {pendingTeaser && (
          <UpgradeButton
            size="sm"
            variant="default"
            hideIfPro={false}
            location="byok_prompt_teaser"
            text={`Import ${teaserCount} discovered subscription${teaserCount !== 1 ? 's' : ''}`}
          />
        )}

        <UpgradeButton size="sm" hideIfPro={false} location="byok_prompt" />
      </div>
    </div>
  )
}
