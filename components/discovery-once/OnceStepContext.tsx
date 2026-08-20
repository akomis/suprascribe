'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'

export type Step = 'intro' | 'verifying' | 'connect' | 'discovering' | 'results' | 'error'

interface OnceStepValue {
  step: Step
  setStep: (step: Step) => void
}

const OnceStepContext = createContext<OnceStepValue | null>(null)

/**
 * Holds the funnel step outside TryFunnel so the intro copy can live in the server
 * component. TryFunnel calls useSearchParams(), which bails its Suspense boundary out
 * to client-side rendering - anything inside that boundary is missing from the static
 * HTML. Keeping the step here (no searchParams, so no bailout) lets the hero prerender
 * while still hiding once the funnel moves past the intro.
 */
export function OnceStepProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<Step>('intro')
  return <OnceStepContext.Provider value={{ step, setStep }}>{children}</OnceStepContext.Provider>
}

export function useOnceStep() {
  const ctx = useContext(OnceStepContext)
  if (!ctx) throw new Error('useOnceStep must be used within OnceStepProvider')
  return ctx
}

/** Renders its children only while the funnel is on the intro step. */
export function IntroOnly({ children }: { children: ReactNode }) {
  const { step } = useOnceStep()
  return step === 'intro' ? <>{children}</> : null
}
