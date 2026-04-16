'use client'

import { ConfigureApiKeyButton } from '@/components/ConfigureApiKeyButton'
import { Button } from '@/components/ui/button'
import type { RateLimitInfo } from '@/lib/utils/discovery-rate-limit'
import { SearchX } from 'lucide-react'
import Link from 'next/link'

interface ExhaustedDiscoveriesMessageProps {
  rateLimitInfo: RateLimitInfo
}

export function ExhaustedDiscoveriesMessage({ rateLimitInfo }: ExhaustedDiscoveriesMessageProps) {
  return (
    <div className="w-[300px] md:w-[450px] fade-on-mount">
      <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-6 text-center w-full">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <SearchX className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">You&apos;ve used all your discoveries</h3>
          <p className="text-sm text-muted-foreground max-w-lg">
            You&apos;ve reached your limit of {rateLimitInfo.maxDiscoveries} total email
            discoveries.
          </p>
        </div>

        <div className="w-full border-t pt-4 mt-2">
          <p className="text-sm text-muted-foreground mb-3">
            Want unlimited discoveries? Use your own AI model API key.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <ConfigureApiKeyButton />
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
