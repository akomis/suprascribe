'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import * as React from 'react'

interface SubscriptionSortProps {
  sortBy: 'name' | 'startDate' | 'endDate' | 'price'
  sortOrder: 'asc' | 'desc'
  onSortByChange: (value: 'name' | 'startDate' | 'endDate' | 'price') => void
  onSortOrderChange: (value: 'asc' | 'desc') => void
  disabled?: boolean
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

const sortOptions = [
  { value: 'name', label: 'Alphabetically' },
  { value: 'startDate', label: 'Start Date' },
  { value: 'endDate', label: 'End Date' },
  { value: 'price', label: 'Price' },
] as const

export function SubscriptionSort({
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  disabled = false,
  isExpanded: controlledIsExpanded,
  onExpandedChange,
}: SubscriptionSortProps) {
  const [internalIsExpanded, setInternalIsExpanded] = React.useState(false)

  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded
  const setIsExpanded = onExpandedChange || setInternalIsExpanded

  const handleToggle = () => {
    if (disabled) return
    setIsExpanded(!isExpanded)
  }

  const handleOrderToggle = () => {
    if (disabled) return
    onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')
  }

  return (
    <div className="relative flex items-center min-h-fit">
      <Button
        variant={isExpanded ? 'default' : 'outline'}
        size="icon"
        onClick={handleToggle}
        disabled={disabled}
        className="h-8 w-8 shrink-0"
        aria-label={isExpanded ? 'Close sort' : 'Open sort'}
      >
        <ArrowUpDown className="h-4 w-4" />
      </Button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'w-[120px] sm:w-[150px] opacity-100 ml-1' : 'w-0 opacity-0 ml-0',
        )}
      >
        {isExpanded && (
          <div className="flex items-center gap-1 h-8">
            <Select value={sortBy} onValueChange={onSortByChange} disabled={disabled}>
              <SelectTrigger className="h-8 text-xs sm:text-sm" disabled={disabled}>
                <span className="text-xs sm:text-sm">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label}
                </span>
              </SelectTrigger>
              <SelectContent>
                {sortOptions
                  .filter((option) => option.value !== sortBy)
                  .map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="text-xs sm:text-sm"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={handleOrderToggle}
              disabled={disabled}
              className="h-8 w-8 shrink-0"
              aria-label={sortOrder === 'asc' ? 'Sort descending' : 'Sort ascending'}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
