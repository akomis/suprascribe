'use client'

import { Button } from '@/components/ui/button'
import { ConfigureApiKeyButton } from '@/components/ConfigureApiKeyButton'
import { UpgradeButton } from '@/components/UpgradeButton'
import { Mail } from 'lucide-react'
import Link from 'next/link'

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
            Automatically find subscriptions from your email inbox.
          </p>
        </div>

        <UpgradeButton size="sm" hideIfPro={false} />

        <div className="w-full border-t pt-4 mt-2">
          <p className="text-xs text-muted-foreground mb-3">
            or set up your own AI model API key for unlimited discoveries.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <ConfigureApiKeyButton variant="outline" />
            <Button variant="ghost" size="sm" asChild>
              <Link href="/limits#byok" target="_blank" rel="noopener noreferrer">
                Learn more
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
