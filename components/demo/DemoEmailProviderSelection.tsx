'use client'

import ProviderDiscoverButton from '@/components/dashboard/discovery/ProviderDiscoverButton'
import { DiscoveryDialog } from '@/components/dashboard/discovery/DiscoveryDialog'
import { useDemoCreateSubscription } from '@/lib/demo/useDemoSubscriptions'
import { useDemoDiscovery } from '@/lib/demo/useDemoDiscovery'
import type { CreateSubscriptionFormData } from '@/lib/types/forms'
import { Lock } from 'lucide-react'
import * as React from 'react'

export function DemoEmailProviderSelection({
  onComplete,
  randomize = false,
}: { onComplete?: () => void; randomize?: boolean } = {}) {
  const [providerName, setProviderName] = React.useState('Gmail')
  const { isDiscovering, discoveredSubscriptions, startDiscovery, clearDiscovery, retry } =
    useDemoDiscovery({ randomize })
  const createSubscription = useDemoCreateSubscription()

  const handleProviderClick = (name: string) => {
    setProviderName(name)
    startDiscovery()
  }

  const handleImport = async (entries: CreateSubscriptionFormData[]) => {
    for (const entry of entries) {
      await createSubscription.mutateAsync(entry)
    }
    onComplete?.()
  }

  return (
    <div className="flex flex-col gap-4 w-[300px] sm:w-[350px] md:w-[450px] mx-auto">
      <div className="fade-on-mount flex flex-col gap-4 rounded-lg border border-dashed p-4 w-[300px] sm:w-[350px] md:w-[450px]">
        <div className="flex flex-col gap-4 items-center">
          <div className="flex gap-4 justify-center">
            <ProviderDiscoverButton
              displayName="Gmail"
              logoQuery="google"
              logoSrc="/logos/google.svg"
              onClick={() => handleProviderClick('Gmail')}
            />
            <ProviderDiscoverButton
              displayName="Outlook"
              logoQuery="microsoft"
              logoSrc="/logos/microsoft.svg"
              onClick={() => handleProviderClick('Outlook')}
            />
            <ProviderDiscoverButton
              displayName="iCloud"
              logoQuery="apple"
              logoSrc="/logos/apple.svg"
              onClick={() => handleProviderClick('iCloud')}
            />
          </div>
        </div>
      </div>

      <div className="flex rounded-xl gap-4 items-start bg-muted p-4">
        <Lock className="size-12 h-fit mt-1" />
        <p className="text-xs text-muted-foreground text-start">
          We will only read your email subject lines and parse strictly subscription-related data.
          None of your credentials or data is saved at any point.
        </p>
      </div>

      <DiscoveryDialog
        isDiscovering={isDiscovering}
        discoveredSubscriptions={discoveredSubscriptions}
        error={null}
        warning={null}
        clearDiscovery={clearDiscovery}
        retry={retry}
        providerName={providerName}
        onImport={handleImport}
      />
    </div>
  )
}
