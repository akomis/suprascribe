'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Search } from 'lucide-react'
import * as React from 'react'

interface SubscriptionSearchProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  isExpanded?: boolean
  onExpandedChange?: (expanded: boolean) => void
}

export function SubscriptionSearch({
  value,
  onChange,
  disabled = false,
  isExpanded: controlledIsExpanded,
  onExpandedChange,
}: SubscriptionSearchProps) {
  const [internalIsExpanded, setInternalIsExpanded] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const isExpanded = controlledIsExpanded !== undefined ? controlledIsExpanded : internalIsExpanded
  const setIsExpanded = onExpandedChange || setInternalIsExpanded

  const handleToggle = () => {
    if (disabled) return

    if (isExpanded) {
      onChange('')
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div className="relative flex items-center">
      <Button
        variant={isExpanded ? 'default' : 'outline'}
        size="icon"
        onClick={handleToggle}
        disabled={disabled}
        className="h-8 w-8 shrink-0"
        aria-label={isExpanded ? 'Close search' : 'Open search'}
      >
        <Search className="h-4 w-4" />
      </Button>
      <div
        className={cn(
          'transition-all duration-300 ease-in-out',
          isExpanded ? 'w-[150px] sm:w-[200px] opacity-100 ml-1' : 'w-0 opacity-0 ml-0',
        )}
      >
        {isExpanded && (
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-8 w-full text-xs sm:text-sm"
            disabled={disabled}
          />
        )}
      </div>
    </div>
  )
}
