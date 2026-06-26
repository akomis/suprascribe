'use client'

import { ClientOnly } from '@/components/shared/ClientOnly'
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
import type { InsightMode, InsightTab, MergedSubscriptionResponse } from '@/lib/types/subscriptions'

import * as React from 'react'
import AddSubscriptionDialog, { type ViewType } from './AddSubscriptionDialog'
import { EmailProviderSelection } from './EmailProviderSelection'
import { SetupBYOKPrompt } from './discovery/SetupBYOKPrompt'
import { SubscriptionDetailsDialog } from './SubscriptionDetailsDialog'
import { SubscriptionGroupBy, toInsightsGroupBy, type GroupByValue } from './SubscriptionGroupBy'
import { SubscriptionSearch } from './SubscriptionSearch'
import { SubscriptionSort } from './SubscriptionSort'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Calculator, Check, PenLine } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ── Pure helpers (outside component to avoid re-creation) ────────────────────

function filterAndSort(
  subscriptions: MergedSubscriptionResponse[],
  searchQuery: string,
  sortBy: 'name' | 'endDate' | 'startDate' | 'price',
  sortOrder: 'asc' | 'desc',
  hasSearchSort: boolean,
): MergedSubscriptionResponse[] {
  let result = subscriptions

  if (hasSearchSort && searchQuery.trim()) {
    result = result.filter((sub) => sub.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }

  if (hasSearchSort) {
    result = [...result].sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name)
      else if (sortBy === 'startDate')
        comparison = new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      else if (sortBy === 'endDate')
        comparison = new Date(a.endDate).getTime() - new Date(b.endDate).getTime()
      else if (sortBy === 'price') comparison = a.price - b.price
      return sortOrder === 'asc' ? comparison : -comparison
    })
  }

  return result
}

function buildGroupByMaps(
  subscriptions: MergedSubscriptionResponse[],
  groupBy: GroupByValue,
): Map<string, MergedSubscriptionResponse[]> {
  const map = new Map<string, MergedSubscriptionResponse[]>()
  if (groupBy === 'sourceEmail') {
    subscriptions.forEach((sub) => {
      const mostRecent = [...sub.subscriptions].sort(
        (a, b) => new Date(b.end_date || '').getTime() - new Date(a.end_date || '').getTime(),
      )[0]
      const key = mostRecent?.source_email || 'Manually Added'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(sub)
    })
  } else if (groupBy === 'category') {
    subscriptions.forEach((sub) => {
      const key = sub.category || 'Other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(sub)
    })
  } else if (groupBy === 'paymentMethod') {
    subscriptions.forEach((sub) => {
      const key = sub.paymentMethod || 'Unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(sub)
    })
  }
  return map
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SubscriptionList({
  items,
  groupBy,
  groupMap,
  groupKeys,
  mode,
  onCardClick,
  showMode = true,
}: {
  items: MergedSubscriptionResponse[]
  groupBy: GroupByValue
  groupMap: Map<string, MergedSubscriptionResponse[]>
  groupKeys: string[]
  mode: InsightMode
  onCardClick: (merged: MergedSubscriptionResponse) => void
  showMode?: boolean
}) {
  const renderCard = (merged: MergedSubscriptionResponse, i: number, cardShowMode = true) => (
    <SubscriptionCard
      key={`${merged.name}-${i}`}
      name={merged.name}
      serviceUrl={merged.serviceUrl || ''}
      price={merged.price}
      period={merged.period}
      currency={merged.currency as CurrencyCode}
      startDate={merged.startDate}
      endDate={merged.endDate}
      autoRenew={merged.autoRenew}
      mode={cardShowMode ? mode : undefined}
      spentThisYear={merged.spentThisYear}
      forecastThisYear={merged.forecastThisYear}
      totalSpent={merged.totalSpent}
      onClick={() => onCardClick(merged)}
    />
  )

  if (groupBy !== 'service' && groupKeys.length > 0) {
    return (
      <>
        {groupKeys.map((key) => {
          const group = groupMap.get(key) || []
          if (group.length === 0) return null
          return (
            <div key={key} className="space-y-2 sm:space-y-3">
              <p className="text-xs font-medium text-muted-foreground px-1 pt-2">{key}</p>
              {group.map((merged, i) => renderCard(merged, i, showMode))}
            </div>
          )
        })}
      </>
    )
  }

  return <>{items.map((merged, i) => renderCard(merged, i, showMode))}</>
}

function SubscriptionControls({
  hasSubscriptions,
  searchQuery,
  onSearchChange,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  groupBy,
  onGroupByChange,
  mode,
  onModeChange,
  hasSearchSort,
  isSearchExpanded,
  onSearchExpandedChange,
  isSortExpanded,
  onSortExpandedChange,
}: {
  hasSubscriptions: boolean
  searchQuery: string
  onSearchChange: (v: string) => void
  sortBy: 'name' | 'endDate' | 'startDate' | 'price'
  sortOrder: 'asc' | 'desc'
  onSortByChange: (v: 'name' | 'endDate' | 'startDate' | 'price') => void
  onSortOrderChange: (v: 'asc' | 'desc') => void
  groupBy: GroupByValue
  onGroupByChange: (v: GroupByValue) => void
  mode: InsightMode
  onModeChange: (v: InsightMode) => void
  hasSearchSort: boolean
  isSearchExpanded: boolean
  onSearchExpandedChange: (v: boolean) => void
  isSortExpanded: boolean
  onSortExpandedChange: (v: boolean) => void
}) {
  if (!hasSubscriptions) return null
  return (
    <div className="flex flex-row items-center gap-2">
      {!isSortExpanded && (
        <SubscriptionSearch
          value={searchQuery}
          onChange={onSearchChange}
          disabled={!hasSearchSort}
          isExpanded={isSearchExpanded}
          onExpandedChange={(expanded) => {
            onSearchExpandedChange(expanded)
            if (expanded) onSortExpandedChange(false)
          }}
        />
      )}
      {!isSearchExpanded && (
        <SubscriptionSort
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortByChange={onSortByChange}
          onSortOrderChange={onSortOrderChange}
          disabled={!hasSearchSort}
          isExpanded={isSortExpanded}
          onExpandedChange={(expanded) => {
            onSortExpandedChange(expanded)
            if (expanded) onSearchExpandedChange(false)
          }}
        />
      )}
      {!isSearchExpanded && !isSortExpanded && (
        <SubscriptionGroupBy
          groupBy={groupBy}
          onGroupByChange={onGroupByChange}
          disabled={!hasSearchSort}
        />
      )}
      {!isSearchExpanded && !isSortExpanded && (
        <ClientOnly>
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
              <DropdownMenuItem onClick={() => onModeChange('forecast')}>
                Forecast
                {mode === 'forecast' && <Check className="h-3 w-3 ml-auto" />}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onModeChange('spent')}>
                Current
                {mode === 'spent' && <Check className="h-3 w-3 ml-auto" />}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ClientOnly>
      )}
    </div>
  )
}

function ActiveContent({
  active,
  filteredActive,
  groupBy,
  groupMap,
  groupKeys,
  mode,
  onCardClick,
  openManualDialog,
  renderActiveTabEmpty,
}: {
  active: MergedSubscriptionResponse[]
  filteredActive: MergedSubscriptionResponse[]
  groupBy: GroupByValue
  groupMap: Map<string, MergedSubscriptionResponse[]>
  groupKeys: string[]
  mode: InsightMode
  onCardClick: (merged: MergedSubscriptionResponse) => void
  openManualDialog: () => void
  renderActiveTabEmpty: (openManualDialog: () => void) => React.ReactNode
}) {
  if (active.length === 0) return <>{renderActiveTabEmpty(openManualDialog)}</>
  if (filteredActive.length === 0)
    return (
      <div className="flex items-center justify-center py-4">
        <p className="text-muted-foreground text-sm">No matching subscriptions</p>
      </div>
    )
  return (
    <SubscriptionList
      items={filteredActive}
      groupBy={groupBy}
      groupMap={groupMap}
      groupKeys={groupKeys}
      mode={mode}
      onCardClick={onCardClick}
    />
  )
}

function PastContent({
  past,
  filteredPast,
  pastYears,
  selectedYear,
  onYearChange,
  pastByYear,
  groupBy,
  groupMap,
  groupKeys,
  mode,
  onCardClick,
}: {
  past: MergedSubscriptionResponse[]
  filteredPast: MergedSubscriptionResponse[]
  pastYears: string[]
  selectedYear: string | null
  onYearChange: (year: string) => void
  pastByYear: Map<string, MergedSubscriptionResponse[]>
  groupBy: GroupByValue
  groupMap: Map<string, MergedSubscriptionResponse[]>
  groupKeys: string[]
  mode: InsightMode
  onCardClick: (merged: MergedSubscriptionResponse) => void
}) {
  const emptyMsg = (msg: string) => (
    <div className="flex items-center justify-center py-4">
      <p className="text-muted-foreground text-sm">{msg}</p>
    </div>
  )
  if (past.length === 0) return emptyMsg('No past subscriptions')
  if (filteredPast.length === 0) return emptyMsg('No matching subscriptions')
  return (
    <Tabs value={selectedYear || pastYears[0]} onValueChange={onYearChange} className="w-full">
      <TabsList className="flex w-full mb-3 flex-wrap h-auto gap-1">
        {pastYears.map((year) => (
          <TabsTrigger key={year} value={year} className="text-xs sm:text-sm hover:cursor-pointer">
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
          <SubscriptionList
            items={pastByYear.get(year) || []}
            groupBy={groupBy}
            groupMap={groupMap}
            groupKeys={groupKeys}
            mode={mode}
            onCardClick={onCardClick}
            showMode={false}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}

// ── Guards ────────────────────────────────────────────────────────────────────

const isActiveOrPast = (v: unknown): v is 'active' | 'past' => v === 'active' || v === 'past'
const isSortByValue = (v: unknown): v is 'name' | 'endDate' | 'startDate' | 'price' =>
  v === 'name' || v === 'endDate' || v === 'startDate' || v === 'price'
const isSortOrder = (v: unknown): v is 'asc' | 'desc' => v === 'asc' || v === 'desc'
const isGroupByValue = (v: unknown): v is GroupByValue =>
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
    activeGroupMap,
    activeGroupKeys,
    pastGroupMap,
    pastGroupKeys,
  } = React.useMemo(() => {
    const activeSubscriptions = mergedSubscriptions.filter((sub) => sub.active)
    const pastSubscriptions = mergedSubscriptions.filter((sub) => !sub.active)
    const filteredActiveSubs = filterAndSort(
      activeSubscriptions,
      searchQuery,
      sortBy,
      sortOrder,
      hasSearchSort,
    )
    const filteredPastSubs = filterAndSort(
      pastSubscriptions,
      searchQuery,
      sortBy,
      sortOrder,
      hasSearchSort,
    )

    const yearMap = new Map<string, MergedSubscriptionResponse[]>()
    filteredPastSubs.forEach((sub) => {
      const year = new Date(sub.endDate).getFullYear().toString()
      if (!yearMap.has(year)) yearMap.set(year, [])
      yearMap.get(year)!.push(sub)
    })
    const years = Array.from(yearMap.keys()).sort((a, b) => parseInt(b) - parseInt(a))

    const aGroupMap = buildGroupByMaps(filteredActiveSubs, groupBy)
    const pGroupMap = buildGroupByMaps(filteredPastSubs, groupBy)

    return {
      active: activeSubscriptions,
      past: pastSubscriptions,
      filteredActive: filteredActiveSubs,
      filteredPast: filteredPastSubs,
      pastYears: years,
      pastByYear: yearMap,
      activeGroupMap: aGroupMap,
      activeGroupKeys: Array.from(aGroupMap.keys()),
      pastGroupMap: pGroupMap,
      pastGroupKeys: Array.from(pGroupMap.keys()),
    }
  }, [mergedSubscriptions, searchQuery, sortBy, sortOrder, hasSearchSort, groupBy])

  React.useEffect(() => {
    if (pastYears.length > 0 && (!selectedYear || !pastYears.includes(selectedYear))) {
      // Use setTimeout to avoid synchronous setState during effect
      const timer = setTimeout(() => {
        setSelectedYear(pastYears[0])
      }, 0)
      return () => clearTimeout(timer)
    } else if (pastYears.length === 0) {
      const timer = setTimeout(() => {
        setSelectedYear(null)
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [pastYears, selectedYear])

  const handleCardClick = React.useCallback(
    (merged: MergedSubscriptionResponse) => {
      setEditingSubscription(merged.subscriptions[0])
      setEditingMergedSubscriptions(merged.subscriptions)
    },
    [setEditingSubscription],
  )

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
              <SubscriptionControls
                hasSubscriptions={mergedSubscriptions.length >= 1}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortByChange={setSortBy}
                onSortOrderChange={setSortOrder}
                groupBy={groupBy}
                onGroupByChange={setGroupBy}
                mode={mode}
                onModeChange={setMode}
                hasSearchSort={hasSearchSort}
                isSearchExpanded={isSearchExpanded}
                onSearchExpandedChange={setIsSearchExpanded}
                isSortExpanded={isSortExpanded}
                onSortExpandedChange={setIsSortExpanded}
              />
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
                  <ActiveContent
                    active={active}
                    filteredActive={filteredActive}
                    groupBy={groupBy}
                    groupMap={activeGroupMap}
                    groupKeys={activeGroupKeys}
                    mode={mode}
                    onCardClick={handleCardClick}
                    openManualDialog={openManualDialog}
                    renderActiveTabEmpty={renderActiveTabEmpty}
                  />
                </TabsContent>
                <TabsContent value="past" className="h-fit">
                  <PastContent
                    past={past}
                    filteredPast={filteredPast}
                    pastYears={pastYears}
                    selectedYear={selectedYear}
                    onYearChange={setSelectedYear}
                    pastByYear={pastByYear}
                    groupBy={groupBy}
                    groupMap={pastGroupMap}
                    groupKeys={pastGroupKeys}
                    mode={mode}
                    onCardClick={handleCardClick}
                  />
                </TabsContent>
              </Tabs>
            ) : (
              <div className="space-y-2 sm:space-y-3 h-fit max-h-[70vh] overflow-y-auto">
                <ActiveContent
                  active={active}
                  filteredActive={filteredActive}
                  groupBy={groupBy}
                  groupMap={activeGroupMap}
                  groupKeys={activeGroupKeys}
                  mode={mode}
                  onCardClick={handleCardClick}
                  openManualDialog={openManualDialog}
                  renderActiveTabEmpty={renderActiveTabEmpty}
                />
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
  const { hasAccess: hasAutoDiscovery, isLoading: isAutoDiscoveryLoading } =
    useAutoDiscoveryAccess()
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
        {isAutoDiscoveryLoading ? (
          <div className="flex items-center justify-center w-[300px] md:w-[450px] min-h-[200px]">
            <Spinner className="size-8" />
          </div>
        ) : hasAutoDiscovery ? (
          <EmailProviderSelection />
        ) : (
          <SetupBYOKPrompt />
        )}
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
