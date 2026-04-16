'use client'

import { DiscoveredSubscriptionGroupCard } from '@/components/dashboard/discovery/DiscoveredSubscriptionGroupCard'
import { DiscoveryEditDialog } from '@/components/dashboard/discovery/DiscoveryEditDialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { useSubscriptions } from '@/lib/hooks/useSubscriptions'
import type { CreateSubscriptionFormData, DiscoveredSubscription } from '@/lib/types/forms'
import {
  cn,
  convertDiscoveredToFormData,
  isDuplicateSubscription,
  isSubscriptionActive,
} from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface DiscoveryDialogProps {
  isDiscovering: boolean
  discoveredSubscriptions: DiscoveredSubscription[]
  error: string | null
  warning: string | null
  clearDiscovery: () => void
  retry: () => void
  providerName: string
  aiProvider?: string
  aiModel?: string
  isLoadingAI?: boolean
  isByok?: boolean
}

export function DiscoveryDialog({
  isDiscovering,
  discoveredSubscriptions,
  error,
  warning,
  clearDiscovery,
  retry,
  providerName,
  aiProvider,
  aiModel,
  isLoadingAI,
  isByok,
}: DiscoveryDialogProps) {
  const queryClient = useQueryClient()
  const { data: existingSubscriptions = [] } = useSubscriptions({ skipStale: true })
  const [showDialog, setShowDialog] = useState(false)
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<Set<number>>(new Set())
  const [subscriptionOverrides, setSubscriptionOverrides] = useState<
    Map<number, CreateSubscriptionFormData>
  >(new Map())
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [showExitWarning, setShowExitWarning] = useState(false)
  const hasStartedDiscovery = useRef(false)
  const finalElapsedTime = useRef<number | null>(null)
  const startTimeRef = useRef<number | null>(null)

  const checkIfDuplicate = (discoveredIndex: number): boolean => {
    const discovered = discoveredSubscriptions[discoveredIndex]
    if (!discovered) return false

    return existingSubscriptions.some((merged) => {
      return merged.subscriptions.some((existing) => {
        return isDuplicateSubscription(
          {
            service_name: discovered.service_name,
            start_date: discovered.start_date,
            end_date: discovered.end_date,
          },
          {
            subscription_service: existing.subscription_service
              ? { name: existing.subscription_service.name }
              : null,
            start_date: existing.start_date,
            end_date: existing.end_date,
          },
        )
      })
    })
  }

  useEffect(() => {
    if (isDiscovering) {
      setElapsedSeconds(0)
      finalElapsedTime.current = null
      startTimeRef.current = Date.now()

      const interval = setInterval(() => {
        if (startTimeRef.current) {
          setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000))
        }
      }, 1000)

      return () => {
        clearInterval(interval)
        if (startTimeRef.current && finalElapsedTime.current === null) {
          finalElapsedTime.current = Math.floor((Date.now() - startTimeRef.current) / 1000)
        }
      }
    }
  }, [isDiscovering])

  useEffect(() => {
    if (isDiscovering) {
      hasStartedDiscovery.current = true
    }

    if (
      isDiscovering ||
      discoveredSubscriptions.length > 0 ||
      error !== null ||
      warning !== null ||
      hasStartedDiscovery.current
    ) {
      setShowDialog(true)
    }
  }, [isDiscovering, discoveredSubscriptions, error, warning])

  useEffect(() => {
    if (discoveredSubscriptions.length > 0) {
      const nonDuplicateIndices = discoveredSubscriptions
        .map((_, index) => index)
        .filter((index) => !checkIfDuplicate(index))
      setSelectedSubscriptions(new Set(nonDuplicateIndices))
    }
  }, [discoveredSubscriptions, existingSubscriptions])

  const handleClose = () => {
    setShowDialog(false)
    setSelectedSubscriptions(new Set())
    setSubscriptionOverrides(new Map())
    setEditingIndex(null)
    hasStartedDiscovery.current = false
    finalElapsedTime.current = null
    startTimeRef.current = null
    setElapsedSeconds(0)
    clearDiscovery()
  }

  const handleEditSave = (index: number, data: CreateSubscriptionFormData) => {
    setSubscriptionOverrides((prev) => {
      const newMap = new Map(prev)
      newMap.set(index, data)
      return newMap
    })
  }

  const handleToggleSubscription = (index: number, checked: boolean) => {
    setSelectedSubscriptions((prev) => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(index)
      } else {
        newSet.delete(index)
      }
      return newSet
    })
  }

  const getGroupedItems = (items: Array<{ sub: DiscoveredSubscription; index: number }>) => {
    const groups = new Map<string, Array<{ sub: DiscoveredSubscription; index: number }>>()

    items.forEach((item) => {
      const serviceName = item.sub.service_name
      if (!groups.has(serviceName)) {
        groups.set(serviceName, [])
      }
      groups.get(serviceName)!.push(item)
    })

    groups.forEach((groupItems) => {
      groupItems.sort((a, b) => {
        const dateA = new Date(a.sub.end_date).getTime()
        const dateB = new Date(b.sub.end_date).getTime()
        if (dateB !== dateA) return dateB - dateA
        return new Date(b.sub.start_date).getTime() - new Date(a.sub.start_date).getTime()
      })
    })

    return Array.from(groups.entries())
      .sort((a, b) => {
        const mostRecentA = new Date(a[1][0].sub.end_date).getTime()
        const mostRecentB = new Date(b[1][0].sub.end_date).getTime()
        return mostRecentB - mostRecentA
      })
      .map(([serviceName, items]) => ({
        serviceName,
        serviceUrl: items[0]?.sub.service_url,
        items,
      }))
  }

  const handleSaveSelected = async () => {
    setIsSaving(true)

    const subscriptionsToAdd = discoveredSubscriptions
      .map((sub, index) => ({ sub, index }))
      .filter(({ index }) => selectedSubscriptions.has(index))

    const results = await Promise.allSettled(
      subscriptionsToAdd.map(async ({ sub, index }) => {
        const formData = subscriptionOverrides.has(index)
          ? subscriptionOverrides.get(index)!
          : convertDiscoveredToFormData(sub)

        const response = await fetch('/api/subscriptions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to add subscription')
        }

        return response
      }),
    )

    const successCount = results.filter((result) => result.status === 'fulfilled').length
    const failCount = results.filter((result) => result.status === 'rejected').length

    setIsSaving(false)

    if (successCount > 0) {
      toast.success('Subscriptions Added', {
        description: `Successfully added ${successCount} subscription${successCount !== 1 ? 's' : ''}.`,
      })
    }

    if (failCount > 0) {
      toast.error('Some subscriptions failed', {
        description: `${failCount} subscription${failCount !== 1 ? 's' : ''} could not be added.`,
      })
    }

    if (successCount >= 0) {
      handleClose()
      await queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
    }
  }

  if (!showDialog) {
    return null
  }

  return (
    <>
      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          if (!open && editingIndex === null) setShowExitWarning(true)
        }}
      >
        <DialogContent
          className="sm:max-w-[600px] flex flex-col overflow-hidden"
          showCloseButton={true}
          onInteractOutside={(e) => {
            if (editingIndex !== null) return
            e.preventDefault()
            setShowExitWarning(true)
          }}
          onEscapeKeyDown={(e) => {
            if (editingIndex !== null) return
            e.preventDefault()
            setShowExitWarning(true)
          }}
        >
          {isDiscovering ? (
            <>
              <DialogHeader>
                <DialogTitle>Discovering Your Subscriptions</DialogTitle>
                <DialogDescription>
                  Using {providerName} inbox to find subscriptions
                  {isByok &&
                    (isLoadingAI ? (
                      <span className="inline-flex items-center gap-1 ml-1">
                        <Spinner className="size-3" />
                      </span>
                    ) : (
                      aiProvider &&
                      aiModel && (
                        <>
                          {' '}
                          with {aiProvider}&apos;s {aiModel}
                        </>
                      )
                    ))}
                </DialogDescription>
              </DialogHeader>

              <div className="flex items-center justify-between py-8 px-4">
                <div className="flex items-center gap-2">
                  <Spinner className="size-10 text-primary shrink-0" />

                  <div className="space-y-1">
                    <p className="text-sm font-medium">Analyzing...</p>
                    <p className="text-xs text-muted-foreground">This may take a few moments</p>
                  </div>
                </div>

                <div className="text-2xl font-mono text-muted-foreground tabular-nums">
                  {elapsedSeconds}
                  <span className="text-sm">s</span>
                </div>
              </div>
            </>
          ) : error ? (
            <>
              <DialogHeader>
                <DialogTitle>Discovery Failed</DialogTitle>
                <DialogDescription>
                  There was a technical error discovering your subscriptions.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                  {error}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose}>
                  Close
                </Button>
                <Button onClick={retry} disabled={isDiscovering}>
                  {isDiscovering ? (
                    <>
                      <Spinner />
                      Retrying...
                    </>
                  ) : (
                    'Retry'
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : discoveredSubscriptions.length > 0 ? (
            <div className="animate-in fade-in duration-300 flex flex-col flex-1 overflow-hidden">
              <DialogHeader>
                <DialogTitle>Review Subscriptions</DialogTitle>
                <DialogDescription asChild>
                  <div className="space-y-2 my-4">
                    <p className="text-sm text-muted-foreground">
                      These subscriptions were identified by AI and may contain mistakes. Use the
                      edit button to correct any details before importing and the X to mark false
                      positives to not be imported to Suprascribe.
                    </p>
                  </div>
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2 py-2 overflow-y-auto flex-1 pr-2">
                {(() => {
                  const allSubs = discoveredSubscriptions.map((sub, index) => ({ sub, index }))

                  const nonDuplicateSubs = allSubs.filter(({ index }) => !checkIfDuplicate(index))
                  const duplicateSubs = allSubs.filter(({ index }) => checkIfDuplicate(index))

                  const activeGroups = getGroupedItems(
                    nonDuplicateSubs.filter(({ sub }) =>
                      isSubscriptionActive(sub.start_date, sub.end_date),
                    ),
                  )

                  const pastGroups = getGroupedItems(
                    nonDuplicateSubs.filter(
                      ({ sub }) => !isSubscriptionActive(sub.start_date, sub.end_date),
                    ),
                  )

                  const duplicateGroups = getGroupedItems(duplicateSubs)

                  return (
                    <>
                      <div className="flex flex-col gap-2 mb-4">
                        {activeGroups.length > 0 && (
                          <Badge variant="outline" className="text-xs font-medium">
                            Active
                          </Badge>
                        )}
                        {activeGroups.map((group) => (
                          <DiscoveredSubscriptionGroupCard
                            key={`active-${group.serviceName}`}
                            serviceName={group.serviceName}
                            serviceUrl={group.serviceUrl}
                            items={group.items.map(({ sub, index }) => ({
                              subscription: sub,
                              index,
                              isSelected: selectedSubscriptions.has(index),
                              isDuplicate: false,
                            }))}
                            onToggle={handleToggleSubscription}
                            onEdit={setEditingIndex}
                            disabled={isSaving}
                          />
                        ))}
                      </div>
                      {pastGroups.length > 0 && (
                        <Badge variant="outline" className="text-xs font-medium">
                          Past
                        </Badge>
                      )}
                      {pastGroups.map((group) => (
                        <DiscoveredSubscriptionGroupCard
                          key={`past-${group.serviceName}`}
                          serviceName={group.serviceName}
                          serviceUrl={group.serviceUrl}
                          items={group.items.map(({ sub, index }) => ({
                            subscription: sub,
                            index,
                            isSelected: selectedSubscriptions.has(index),
                            isDuplicate: false,
                          }))}
                          onToggle={handleToggleSubscription}
                          onEdit={setEditingIndex}
                          disabled={isSaving}
                        />
                      ))}

                      {duplicateGroups.length > 0 && (
                        <>
                          <Separator orientation="horizontal" />
                          <button
                            type="button"
                            onClick={() => setShowDuplicates((prev) => !prev)}
                            className="flex items-center justify-between w-full py-2 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <span>Duplicate subscriptions ({duplicateSubs.length})</span>
                            <ChevronDown
                              className={cn(
                                'size-4 transition-transform',
                                showDuplicates && 'rotate-180',
                              )}
                            />
                          </button>
                          {showDuplicates &&
                            duplicateGroups.map((group) => (
                              <DiscoveredSubscriptionGroupCard
                                key={`dup-${group.serviceName}`}
                                serviceName={group.serviceName}
                                serviceUrl={group.serviceUrl}
                                items={group.items.map(({ sub, index }) => ({
                                  subscription: sub,
                                  index,
                                  isSelected: false,
                                  isDuplicate: true,
                                }))}
                                onToggle={handleToggleSubscription}
                                onEdit={setEditingIndex}
                                disabled={isSaving}
                              />
                            ))}
                        </>
                      )}
                    </>
                  )
                })()}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSelected} disabled={isSaving}>
                  {isSaving ? <Spinner /> : 'Done'}
                </Button>
              </DialogFooter>
            </div>
          ) : warning ? (
            <>
              <DialogHeader>
                <DialogTitle>Discovery Limit Reached</DialogTitle>
                <DialogDescription>This email address was recently discovered.</DialogDescription>
              </DialogHeader>

              <div className="rounded-md bg-amber-500/10 p-4 text-sm text-amber-600 dark:text-amber-400">
                {warning}
                <p className="text-sm text-muted-foreground ">
                  <a
                    href="/limits"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    Learn more about discovery limits
                  </a>
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleClose}>Close</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>No Subscriptions Found</DialogTitle>
                <DialogDescription>
                  We couldn&apos;t find any subscription emails in your {providerName} inbox
                  {finalElapsedTime.current !== null &&
                    ` (searched for ${finalElapsedTime.current}s)`}
                  .
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                <p className="text-sm text-muted-foreground text-center">
                  You can continue adding subscriptions manually or try again later.
                </p>
              </div>

              <DialogFooter>
                <Button onClick={handleClose}>Continue</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Discovery?</AlertDialogTitle>
            <AlertDialogDescription>
              Closing now will discard your progress. You&apos;ll need to reinitialize the discovery
              process to try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitWarning(false)}>
              Keep Going
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowExitWarning(false)
                handleClose()
              }}
            >
              Close Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingIndex !== null && (
        <DiscoveryEditDialog
          open={editingIndex !== null}
          onOpenChange={(open) => {
            if (!open) setEditingIndex(null)
          }}
          subscription={discoveredSubscriptions[editingIndex]}
          onSave={(data) => handleEditSave(editingIndex, data)}
        />
      )}
    </>
  )
}
