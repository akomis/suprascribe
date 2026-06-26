'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { loadRuns, removeRun, saveRun, type SavedRun } from '@/lib/discovery/saved-runs'
import type { DiscoveryResponse } from '@/lib/types/discovery'
import type { DiscoveredSubscription } from '@/lib/types/forms'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { ConnectInbox } from './ConnectInbox'
import { DiscoveryResultsReadOnly } from './DiscoveryResultsReadOnly'
import { PayCta } from './PayCta'
import { SavedRunsList } from './SavedRunsList'

type Step = 'intro' | 'verifying' | 'connect' | 'discovering' | 'results' | 'error'

// Survives a mid-funnel page refresh (the entitlement cookie is still valid) so
// the user resumes at "connect" instead of being sent back to pay again.
const STORAGE_KEY = 'suprascribe_once_step'

const OAUTH_ERRORS: Record<string, string> = {
  oauth_denied: 'Inbox access was denied. Please try connecting again.',
  invalid_state: 'Your session expired. Please connect your inbox again.',
  no_code: 'Inbox connection failed. Please try again.',
  token_exchange_failed: 'Inbox connection failed. Please try again.',
  no_access_token: 'Inbox connection failed. Please try again.',
  config_error: 'This provider is not available right now.',
  unsupported_provider: 'This provider is not supported.',
  server_error: 'Something went wrong. Please try again.',
}

export function TryFunnel() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<Step>('intro')
  const [results, setResults] = useState<DiscoveredSubscription[] | null>(null)
  const [emailScanned, setEmailScanned] = useState<string | null>(null)
  const [discoveredAt, setDiscoveredAt] = useState<string | null>(null)
  const [savedRuns, setSavedRuns] = useState<SavedRun[]>([])
  const [errorMsg, setErrorMsg] = useState('')
  const handled = useRef(false)

  useEffect(() => {
    setSavedRuns(loadRuns())
  }, [])

  const viewRun = (run: SavedRun) => {
    setResults(run.subscriptions)
    setEmailScanned(run.email)
    setDiscoveredAt(run.discoveredAt)
    setStep('results')
  }

  const handleRemoveRun = (id: string) => setSavedRuns(removeRun(id))

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const sessionId = searchParams.get('session_id')
    const wantsDiscover = searchParams.get('discover') === 'true'
    const provider = searchParams.get('provider')
    const urlError = searchParams.get('error')
    const stripUrl = () => router.replace('/one-time-scan')

    if (urlError) {
      setErrorMsg(OAUTH_ERRORS[urlError] ?? 'Something went wrong. Please try again.')
      setStep('error')
      sessionStorage.removeItem(STORAGE_KEY)
      stripUrl()
      return
    }

    if (sessionId) {
      setStep('verifying')
      fetch('/api/discovery/once/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      })
        .then(async (res) => {
          const data = (await res.json()) as { ok?: boolean; error?: string }
          if (res.ok && data.ok) {
            sessionStorage.setItem(STORAGE_KEY, 'connect')
            setStep('connect')
          } else {
            setErrorMsg(data.error ?? 'We could not verify your payment.')
            setStep('error')
          }
        })
        .catch(() => {
          setErrorMsg('We could not verify your payment.')
          setStep('error')
        })
        .finally(stripUrl)
      return
    }

    if (wantsDiscover && (provider === 'google' || provider === 'microsoft')) {
      setStep('discovering')
      sessionStorage.removeItem(STORAGE_KEY)
      fetch(`/api/discovery/once/${provider}`, { method: 'POST' })
        .then(async (res) => {
          const data = (await res.json()) as DiscoveryResponse
          if (data.success && 'subscriptions' in data) {
            const at = new Date().toISOString()
            setSavedRuns(
              saveRun({
                id: crypto.randomUUID(),
                email: data.email,
                discoveredAt: at,
                subscriptions: data.subscriptions,
              }),
            )
            setResults(data.subscriptions)
            setEmailScanned(data.email)
            setDiscoveredAt(at)
            setStep('results')
          } else {
            setErrorMsg('error' in data ? data.error : 'Discovery failed.')
            setStep('error')
          }
        })
        .catch(() => {
          setErrorMsg('Discovery failed. Please try again.')
          setStep('error')
        })
        .finally(stripUrl)
      return
    }

    // No params: resume at connect if a verified payment is still in progress.
    if (sessionStorage.getItem(STORAGE_KEY) === 'connect') {
      setStep('connect')
    }
  }, [searchParams, router])

  if (step === 'verifying') {
    return <Centered label="Confirming your payment…" />
  }

  if (step === 'discovering') {
    return <Centered label="Scanning your inbox… this may take a moment." />
  }

  if (step === 'connect') {
    return <ConnectInbox />
  }

  if (step === 'results' && results) {
    return (
      <div className="flex flex-col items-center gap-6">
        <DiscoveryResultsReadOnly
          subscriptions={results}
          emailScanned={emailScanned}
          discoveredAt={discoveredAt}
        />
        <Button variant="outline" onClick={() => setStep('intro')}>
          Done
        </Button>
      </div>
    )
  }

  if (step === 'error') {
    return (
      <div className="text-center space-y-4 max-w-md">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground">{errorMsg}</p>
        <Button
          variant="outline"
          onClick={() => {
            sessionStorage.removeItem(STORAGE_KEY)
            setStep('intro')
          }}
        >
          Start over
        </Button>
      </div>
    )
  }

  // intro
  return (
    <div className="flex flex-col items-center gap-6 text-center max-w-lg">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          Find your subscriptions for €1
        </h1>
        <p className="text-muted-foreground">
          A one-time scan of a single inbox. We reveal every subscription we find, each with an
          unsubscribe link. No account, no sign-up, nothing stored on our servers.
        </p>
      </div>
      <PayCta />
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>Connect one Gmail or Outlook inbox</li>
        <li>See your subscriptions with cancel links</li>
      </ul>
      <SavedRunsList runs={savedRuns} onView={viewRun} onRemove={handleRemoveRun} />
    </div>
  )
}

function Centered({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-12">
      <Spinner className="size-10 text-primary" />
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
