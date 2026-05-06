'use client'

import Insights from '@/components/dashboard/Insights'
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAutoDiscoveryAccess } from '@/lib/hooks/useAutoDiscoveryAccess'
import { useFeatureAccess } from '@/lib/hooks/useFeatureAccess'
import { useSubscriptionsSuspense } from '@/lib/hooks/useSubscriptions'
import type { CurrencyCode, UserSubscriptionWithDetails } from '@/lib/types/database'
import { usePersistedState } from '@/lib/hooks/usePersistedState'
import { useInsightsSettings } from '@/providers/InsightsSettingsProvider'
import type { InsightTab, MergedSubscriptionResponse } from '@/lib/types/subscriptions'

import * as React from 'react'
import AddSubscriptionDialog, { type ViewType } from './AddSubscriptionDialog'
import { EmailProviderSelection } from './EmailProviderSelection'
import { SetupBYOKPrompt } from './discovery/SetupBYOKPrompt'
import { SubscriptionDetailsDialog } from './SubscriptionDetailsDialog'
import { SubscriptionGroupBy, toInsightsGroupBy, type GroupByValue } from './SubscriptionGroupBy'
import { SubscriptionSearch } from './SubscriptionSearch'
import { SubscriptionSort } from './SubscriptionSort'
import { Button } from '@/components/ui/button'
import { Calculator, Check, PenLine } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const isActiveOrPast = (v: unknown): v is 'active' | 'past' => v === 'active' || v === 'past'
export const isSortByValue = (v: unknown): v is 'name' | 'endDate' | 'startDate' | 'price' =>
  v === 'name' || v === 'endDate' || v === 'startDate' || v === 'price'
export const isSortOrder = (v: unknown): v is 'asc' | 'desc' => v === 'asc' || v === 'desc'
export const isGroupByValue = (v: unknown): v is GroupByValue =>
  v === 'service' || v === 'sourceEmail' || v === 'category' || v === 'paymentMethod'

export type SubscriptionsSectionActions = {
  subscriptions: MergedSubscriptionResponse[]
  error?: Error | null
  hasSubscriptionHistory: boolean
  hasAutoDiscovery: boolean
  hasSearchSort: boolean
  storagePrefix: string
  externalEditingSubscriptionId?: string | null
  onExternalEditingChange?: (subscriptionId: string | null) => void
  InsightsComponent: React.ComponentType<{ tab: InsightTab; year?: number }>
  AddDialogComponent: React.ComponentType<{
    externalOpen: boolean
    onExternalOpenChange: (open: boolean) => void
    initialView: ViewType
    hideTrigger: boolean
  }>
  DetailsDialogComponent: React.ComponentType<{
    subscription: UserSubscriptionWithDetails
    allSubscriptions?: UserSubscriptionWithDetails[]
    open: boolean
    onOpenChange: (open: boolean) => void
  }>
  renderEmptyState: (openManualDialog: () => void) => React.ReactNode
  renderActiveTabEmpty: (openManualDialog: () => void) => React.ReactNode
}

export function SubscriptionsSectionBase({ actions }: { actions: SubscriptionsSectionActions }) {
  const {
    subscriptions: mergedSubscriptions,
    error,
    hasSubscriptionHistory,
    hasSearchSort,
    storagePrefix,
    externalEditingSubscriptionId,
    onExternalEditingChange,
    InsightsComponent,
    AddDialogComponent,
    DetailsDialogComponent,
    renderEmptyState,
    renderActiveTabEmpty,
  } = actions

  const { mode, setMode, setGroupBy: setInsightsGroupBy } = useInsightsSettings()
  const [internalEditingSubscription, setInternalEditingSubscription] =
    React.useState<UserSubscriptionWithDetails | null>(null)
  const [editingMergedSubscriptions, setEditingMergedSubscriptions] = React.useState<
    UserSubscriptionWithDetails[]
  >([])

  // Use external editing subscription if provided, otherwise use internal state
  const editingSubscription =
    externalEditingSubscriptionId !== undefined && externalEditingSubscriptionId !== null
      ? mergedSubscriptions
          .flatMap((m) => m.subscriptions)
          .find((s) => s.id === parseInt(externalEditingSubscriptionId, 10)) || null
      : internalEditingSubscription

  const setEditingSubscription = React.useCallback(
    (subscription: UserSubscriptionWithDetails | null) => {
      if (onExternalEditingChange) {
        onExternalEditingChange(subscription?.id?.toString() || null)
      }
      setInternalEditingSubscription(subscription)
    },
    [onExternalEditingChange],
  )

  const [activeTab, setActiveTab] = usePersistedState<'active' | 'past'>(
    `${storagePrefix}_activeTab`,
    'active',
    isActiveOrPast,
  )

  const [selectedYear, setSelectedYear] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isSearchExpanded, setIsSearchExpanded] = React.useState(false)
  const [isSortExpanded, setIsSortExpanded] = React.useState(false)

  const [sortBy, setSortBy] = usePersistedState<'name' | 'endDate' | 'startDate' | 'price'>(
    `${storagePrefix}_sortBy`,
    'name',
    isSortByValue,
  )

  const [sortOrder, setSortOrder] = usePersistedState<'asc' | 'desc'>(
    `${storagePrefix}_sortOrder`,
    'asc',
    isSortOrder,
  )

  const [groupBy, setGroupByState] = usePersistedState<GroupByValue>(
    `${storagePrefix}_groupBy`,
    'service',
    isGroupByValue,
  )

  const setGroupBy = React.useCallback(
    (value: GroupByValue) => {
      setGroupByState(value)
      setInsightsGroupBy(toInsightsGroupBy(value))
    },
    [setGroupByState, setInsightsGroupBy],
  )

  React.useEffect(() => {
    setInsightsGroupBy(toInsightsGroupBy(groupBy))
  }, [])

  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [addDialogView, setAddDialogView] = React.useState<ViewType>('options')

  const openManualDialog = () => {
    setAddDialogView('manual')
    setAddDialogOpen(true)
  }

  const handleAddDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open)
    if (!open) setAddDialogView('options')
  }

  const {
    active,
    past,
    filteredActive,
    filteredPast,
    pastYears,
    pastByYear,
    activeByEmail,
    activeEmails,
    activeByCategory,
    activeCategories,
    activeByPaymentMethod,
    activePaymentMethods,
    pastByEmail,
    pastEmails,
    pastByCategory,
    pastCategories,
    pastByPaymentMethod,
    pastPaymentMethods,
  } = React.useMemo(() => {
    const activeSubscriptions = mergedSubscriptions.filter((sub) => sub.active)
    const pastSubscriptions = mergedSubscriptions.filter((sub) => !sub.active)

    const filterAndSort = (subscriptions: typeof mergedSubscriptions) => {
      let result = subscriptions

      if (hasSearchSort && searchQuery.trim()) {
        result = result.filter((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
      }

      if (hasSearchSort) {
        result = [...result].sort((a, b) => {
          let comparison = 0

          if (sortBy === 'name') {
            comparison = a.name.localeCompare(b.name)
          } else if (sortBy === 'startDate') {
            comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          } else if (sortBy === 'endDate') {
            comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
          } else if (sortBy === 'price') {
            comparison = a.price - b.price
          }

          return sortOrder === 'asc' ? comparison : -comparison
        })
      }

      return result
    }

    const filteredPastSubs = filterAndSort(pastSubscriptions)
    const yearMap = new Map<string, typeof mergedSubscriptions>()

    filteredPastSubs.forEach((sub) => {
      const year = new Date(sub.endDate).getFullYear().toString()
      if (!yearMap.has(year)) yearMap.set(year, [])
      yearMap.get(year)!.push(sub)
    })

    const years = Array.from(yearMap.keys()).sort((a, b) => parseInt(b) - parseInt(a))
    const filteredActiveSubs = filterAndSort(activeSubscriptions)

    const activeEmailMap = new Map<string, typeof mergedSubscriptions>()
    const activeCategoryMap = new Map<string, typeof mergedSubscriptions>()
    const activePaymentMethodMap = new Map<string, typeof mergedSubscriptions>()

    if (groupBy === 'sourceEmail') {
      filteredActiveSubs.forEach((sub) => {
        const mostRecent = [...sub.subscriptions].sort(
          (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
        )[0]
        const email = mostRecent?.source_email || 'Manually Added'
        if (!activeEmailMap.has(email)) activeEmailMap.set(email, [])
        activeEmailMap.get(email)!.push(sub)
      })
    } else if (groupBy === 'category') {
      filteredActiveSubs.forEach((sub) => {
        const category = sub.category || 'Other'
        if (!activeCategoryMap.has(category)) activeCategoryMap.set(category, [])
        activeCategoryMap.get(category)!.push(sub)
      })
    } else if (groupBy === 'paymentMethod') {
      filteredActiveSubs.forEach((sub) => {
        const method = sub.paymentMethod || 'Unknown'
        if (!activePaymentMethodMap.has(method)) activePaymentMethodMap.set(method, [])
        activePaymentMethodMap.get(method)!.push(sub)
      })
    }

    const pastEmailMap = new Map<string, typeof mergedSubscriptions>()
    const pastCategoryMap = new Map<string, typeof mergedSubscriptions>()
    const pastPaymentMethodMap = new Map<string, typeof mergedSubscriptions>()

    if (groupBy === 'sourceEmail') {
      filteredPastSubs.forEach((sub) => {
        const mostRecent = [...sub.subscriptions].sort(
          (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
        )[0]
        const email = mostRecent?.source_email || 'Manually Added'
        if (!pastEmailMap.has(email)) pastEmailMap.set(email, [])
        pastEmailMap.get(email)!.push(sub)
      })
    } else if (groupBy === 'category') {
      filteredPastSubs.forEach((sub) => {
        const category = sub.category || 'Other'
        if (!pastCategoryMap.has(category)) pastCategoryMap.set(category, [])
        pastCategoryMap.get(category)!.push(sub)
      })
    } else if (groupBy === 'paymentMethod') {
      filteredPastSubs.forEach((sub) => {
        const method = sub.paymentMethod || 'Unknown'
        if (!pastPaymentMethodMap.has(method)) pastPaymentMethodMap.set(method, [])
        pastPaymentMethodMap.get(method)!.push(sub)
      })
    }

    return {
      active: activeSubscriptions,
      past: pastSubscriptions,
      filteredActive: filteredActiveSubs,
      filteredPast: filteredPastSubs,
      pastYears: years,
      pastByYear: yearMap,
      activeByEmail: activeEmailMap,
      activeEmails: Array.from(activeEmailMap.keys()),
      activeByCategory: activeCategoryMap,
      activeCategories: Array.from(activeCategoryMap.keys()),
      activeByPaymentMethod: activePaymentMethodMap,
      activePaymentMethods: Array.from(activePaymentMethodMap.keys()),
      pastByEmail: pastEmailMap,
      pastEmails: Array.from(pastEmailMap.keys()),
      pastByCategory: pastCategoryMap,
      pastCategories: Array.from(pastCategoryMap.keys()),
      pastByPaymentMethod: pastPaymentMethodMap,
      pastPaymentMethods: Array.from(pastPaymentMethodMap.keys()),
    }
  }, [mergedSubscriptions, searchQuery, sortBy, sortOrder, hasSearchSort, groupBy])

  React.useEffect(() => {
    if (pastYears.length > 0 && (!selectedYear || !pastYears.includes(selectedYear))) {
      setSelectedYear(pastYears[0])
    } else if (pastYears.length === 0) {
      setSelectedYear(null)
    }
  }, [pastYears, selectedYear])

  const renderSubscriptionCard = (
    merged: MergedSubscriptionResponse,
    index: number,
    showMode = true,
  ) => (
    <SubscriptionCard
      key={`${merged.name}-${index}`}
      name={merged.name}
      serviceUrl={merged.serviceUrl || ''}
      price={merged.price}
      currency={merged.currency as CurrencyCode}
      startDate={merged.startDate}
      endDate={merged.endDate}
      autoRenew={merged.autoRenew}
      mode={showMode ? mode : undefined}
      spentThisYear={merged.spentThisYear}
      forecastThisYear={merged.forecastThisYear}
      totalSpent={merged.totalSpent}
      onClick={() => {
        setEditingSubscription(merged.subscriptions[0])
        setEditingMergedSubscriptions(merged.subscriptions)
      }}
    />
  )

  const renderGroupedCards = (groups: Map<string, MergedSubscriptionResponse[]>, keys: string[]) =>
    keys.map((key) =>
      (groups.get(key) || []).length > 0 ? (
        <div key={key} className="space-y-2 sm:space-y-3">
          <p className="text-xs font-medium text-muted-foreground px-1 pt-2">{key}</p>
          {(groups.get(key) || []).map((merged, i) => renderSubscriptionCard(merged, i))}
        </div>
      ) : null,
    )

  const renderActiveList = () => {
    if (groupBy === 'sourceEmail') return renderGroupedCards(activeByEmail, activeEmails)
    if (groupBy === 'category') return renderGroupedCards(activeByCategory, activeCategories)
    if (groupBy === 'paymentMethod')
      return renderGroupedCards(activeByPaymentMethod, activePaymentMethods)
    return filteredActive.map((merged, i) => renderSubscriptionCard(merged, i))
  }

  const renderPastList = (subscriptions: typeof mergedSubscriptions) => {
    if (groupBy === 'sourceEmail') return renderGroupedCards(pastByEmail, pastEmails)
    if (groupBy === 'category') return renderGroupedCards(pastByCategory, pastCategories)
    if (groupBy === 'paymentMethod')
      return renderGroupedCards(pastByPaymentMethod, pastPaymentMethods)
    return subscriptions.map((merged, i) => renderSubscriptionCard(merged, i, false))
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {Boolean(mergedSubscriptions.length) &&
        (activeTab === 'active' ? active.length > 0 : past.length > 0) && (
          <InsightsComponent
            tab={activeTab}
            year={activeTab === 'past' && selectedYear ? parseInt(selectedYear, 10) : undefined}
          />
        )}

      <div className="space-y-4">
        <Card className="bg-neutral-50 dark:bg-neutral-950">
          <CardHeader className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              {mergedSubscriptions.length >= 1 && (
                <div className="flex flex-row items-center gap-2">
                  {!isSortExpanded && (
                    <SubscriptionSearch
                      value={searchQuery}
                      onChange={setSearchQuery}
                      disabled={!hasSearchSort}
                      isExpanded={isSearchExpanded}
                      onExpandedChange={(expanded) => {
                        setIsSearchExpanded(expanded)
                        if (expanded) setIsSortExpanded(false)
                      }}
                    />
                  )}
                  {!isSearchExpanded && (
                    <SubscriptionSort
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      onSortByChange={setSortBy}
                      onSortOrderChange={setSortOrder}
                      disabled={!hasSearchSort}
                      isExpanded={isSortExpanded}
                      onExpandedChange={(expanded) => {
                        setIsSortExpanded(expanded)
                        if (expanded) setIsSearchExpanded(false)
                      }}
                    />
                  )}
                  {!isSearchExpanded && !isSortExpanded && (
                    <SubscriptionGroupBy
                      groupBy={groupBy}
                      onGroupByChange={setGroupBy}
                      disabled={!hasSearchSort}
                    />
                  )}
                  {!isSearchExpanded && !isSortExpanded && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Calculation mode"
                        >
                          <Calculator className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" sideOffset={5}>
                        <DropdownMenuLabel>Calculate</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setMode('forecast')}>
                          Forecast
                          {mode === 'forecast' && <Check className="h-3 w-3 ml-auto" />}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setMode('spent')}>
                          Current
                          {mode === 'spent' && <Check className="h-3 w-3 ml-auto" />}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {Boolean(mergedSubscriptions.length) && (
                <Badge variant="outline" className="gap-1 text-xs sm:text-sm">
                  {hasSubscriptionHistory && activeTab === 'past'
                    ? filteredPast.length
                    : filteredActive.length}
                </Badge>
              )}
              <AddDialogComponent
                externalOpen={addDialogOpen}
                onExternalOpenChange={handleAddDialogOpenChange}
                initialView={addDialogView}
                hideTrigger={mergedSubscriptions.length === 0}
              />
            </div>
          </CardHeader>

          <CardContent className="flex flex-col flex-1 justify-start">
            {mergedSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-6 sm:py-8">
                {renderEmptyState(openManualDialog)}
              </div>
            ) : past.length > 0 ? (
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as 'active' | 'past')}
              >
                <TabsList className="flex w-full">
                  <TabsTrigger value="active" className="text-xs sm:text-sm hover:cursor-pointer">
                    Active
                  </TabsTrigger>
                  <TabsTrigger value="past" className="text-xs sm:text-sm hover:cursor-pointer">
                    Past
                  </TabsTrigger>
                </TabsList>

                <TabsContent
                  value="active"
                  className="space-y-2 sm:space-y-3 max-h-[80vh] overflow-y-auto pb-2"
                >
                  {active.length === 0 ? (
                    renderActiveTabEmpty(openManualDialog)
                  ) : filteredActive.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-muted-foreground text-sm">No matching subscriptions</p>
                    </div>
                  ) : (
                    renderActiveList()
                  )}
                </TabsContent>

                <TabsContent value="past" className="h-fit">
                  {past.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-muted-foreground text-sm">No past subscriptions</p>
                    </div>
                  ) : filteredPast.length === 0 ? (
                    <div className="flex items-center justify-center py-4">
                      <p className="text-muted-foreground text-sm">No matching subscriptions</p>
                    </div>
                  ) : (
                    <Tabs
                      value={selectedYear || pastYears[0]}
                      onValueChange={setSelectedYear}
                      className="w-full"
                    >
                      <TabsList className="flex w-full mb-3 flex-wrap h-auto gap-1">
                        {pastYears.map((year) => (
                          <TabsTrigger
                            key={year}
                            value={year}
                            className="text-xs sm:text-sm hover:cursor-pointer"
                          >
                            {year}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      {pastYears.map((year) => (
                        <TabsContent
                          key={year}
                          value={year}
                          className="space-y-2 sm:space-y-3 mt-0 max-h-[60vh] overflow-y-auto"
                        >
                          {renderPastList(pastByYear.get(year) || [])}
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-2 sm:space-y-3 h-fit max-h-[70vh] overflow-y-auto">
                {active.length === 0 ? (
                  renderActiveTabEmpty(openManualDialog)
                ) : filteredActive.length === 0 ? (
                  <div className="flex items-center justify-center py-4">
                    <p className="text-muted-foreground text-sm">No matching subscriptions</p>
                  </div>
                ) : (
                  renderActiveList()
                )}
              </div>
            )}

            {error && (
              <div className="text-center py-6 sm:py-8">
                <div className="text-destructive mb-4 text-sm sm:text-base">
                  {error?.message || 'An error occurred'}
                </div>
                <div className="text-muted-foreground text-sm sm:text-base">
                  There was an error. Please try again later.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {editingSubscription && (
        <DetailsDialogComponent
          subscription={editingSubscription}
          allSubscriptions={
            editingMergedSubscriptions.length > 0 ? editingMergedSubscriptions : undefined
          }
          open={Boolean(editingSubscription)}
          onOpenChange={(open) => {
            if (!open) {
              setEditingSubscription(null)
              setEditingMergedSubscriptions([])
            }
          }}
        />
      )}
    </div>
  )
}

export function SubscriptionsSectionFallback() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-4">
        <Card className="bg-neutral-50 dark:bg-neutral-950">
          <CardHeader className="flex items-center justify-between">
            <div className="flex flex-col items-start gap-2 sm:gap-3">
              <div className="h-10 w-32 bg-muted animate-pulse rounded" />
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="h-6 w-12 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col flex-1 justify-start">
            <div className="space-y-2 sm:space-y-3">
              <div className="h-24 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface SubscriptionsSectionContentProps {
  externalEditingSubscriptionId?: string | null
  onExternalEditingChange?: (subscriptionId: string | null) => void
}

function SubscriptionsSectionContent({
  externalEditingSubscriptionId,
  onExternalEditingChange,
}: SubscriptionsSectionContentProps = {}) {
  const { data: mergedSubscriptions = [], error } = useSubscriptionsSuspense()
  const { hasAccess: hasSubscriptionHistory } = useFeatureAccess('subscription_history')
  const { hasAccess: hasAutoDiscovery } = useAutoDiscoveryAccess()
  const { hasAccess: hasSearchSort } = useFeatureAccess('search_sort_group')

  const actions: SubscriptionsSectionActions = {
    subscriptions: mergedSubscriptions,
    error,
    hasSubscriptionHistory,
    hasAutoDiscovery: Boolean(hasAutoDiscovery),
    hasSearchSort,
    storagePrefix: 'suprascribe',
    externalEditingSubscriptionId,
    onExternalEditingChange,
    InsightsComponent: Insights,
    AddDialogComponent: AddSubscriptionDialog,
    DetailsDialogComponent: SubscriptionDetailsDialog,
    renderEmptyState: (openManualDialog) => (
      <>
        <div className="flex flex-col items-center gap-2 text-center px-2">
          <p className="text-muted-foreground text-sm sm:text-base">No subscriptions yet.</p>
          <Button variant="outline" size="sm" onClick={openManualDialog} className="gap-2">
            <PenLine className="h-4 w-4" />
            Add Manually
          </Button>
        </div>
        {hasAutoDiscovery ? <EmailProviderSelection /> : <SetupBYOKPrompt />}
      </>
    ),
    renderActiveTabEmpty: () => <EmailProviderSelection />,
  }

  return <SubscriptionsSectionBase actions={actions} />
}

interface SubscriptionsSectionProps {
  externalEditingSubscriptionId?: string | null
  onExternalEditingChange?: (subscriptionId: string | null) => void
}

export default function SubscriptionsSection({
  externalEditingSubscriptionId,
  onExternalEditingChange,
}: SubscriptionsSectionProps = {}) {
  return (
    <React.Suspense fallback={<SubscriptionsSectionFallback />}>
      <SubscriptionsSectionContent
        externalEditingSubscriptionId={externalEditingSubscriptionId}
        onExternalEditingChange={onExternalEditingChange}
      />
    </React.Suspense>
  )
}
