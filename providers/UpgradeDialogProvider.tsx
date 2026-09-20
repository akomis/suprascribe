'use client'

import dynamic from 'next/dynamic'
import * as React from 'react'

// Loaded on open, not on mount: the dialog pulls in the pricing card and the dialog
// primitive, and most visits (marketing, blog, the SEO pages) never open it.
const UpgradeDialog = dynamic(
  () => import('@/components/UpgradeDialog').then((m) => m.UpgradeDialog),
  { ssr: false },
)

interface UpgradeDialogContextValue {
  /** @param location what prompted the upgrade, for PostHog attribution. */
  openUpgradeDialog: (location: string) => void
}

const UpgradeDialogContext = React.createContext<UpgradeDialogContextValue | undefined>(undefined)

/**
 * Hosts the single upgrade dialog for the whole app, so any upsell can open it
 * without routing away from what the user was doing.
 *
 * Mounted at the root layout rather than the dashboard one: `UpgradeButton` calls
 * `useUpgradeDialog` unconditionally, and it also renders inside the landing pricing
 * card, which lives outside the dashboard tree.
 */
export function UpgradeDialogProvider({ children }: { children: React.ReactNode }) {
  // Null until the first open, so nothing is downloaded or rendered before then.
  // After that the dialog stays mounted and only `open` flips: unmounting on close
  // would cut off the close animation, and would blank the price mid-fade.
  const [state, setState] = React.useState<{ location: string; open: boolean } | null>(null)

  const value = React.useMemo(
    () => ({ openUpgradeDialog: (from: string) => setState({ location: from, open: true }) }),
    [],
  )

  return (
    <UpgradeDialogContext.Provider value={value}>
      {children}
      {state !== null && (
        <UpgradeDialog
          open={state.open}
          onOpenChange={(isOpen) => setState((current) => current && { ...current, open: isOpen })}
          location={state.location}
        />
      )}
    </UpgradeDialogContext.Provider>
  )
}

export function useUpgradeDialog() {
  const context = React.useContext(UpgradeDialogContext)
  if (context === undefined) {
    throw new Error('useUpgradeDialog must be used within an UpgradeDialogProvider')
  }
  return context
}
