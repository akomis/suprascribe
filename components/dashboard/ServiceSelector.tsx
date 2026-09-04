'use client'

import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { Input } from '@/components/ui/input'
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import * as React from 'react'

type Service = {
  id: number
  name: string
  url: string | null
}

/**
 * Every rendered row mounts a ServiceLogo, and each of those fires its own
 * /api/logo request. An uncapped list turns one keystroke into hundreds of
 * queued requests, so only render as many rows as a user would ever scan.
 */
const MAX_SUGGESTIONS = 8

/** Long enough that a fast typist sends one request per word, not per letter. */
const SEARCH_DEBOUNCE_MS = 200

type ServiceSelectorProps = {
  value: string
  onChange: (value: string, serviceUrl?: string) => void
  disabled?: boolean
}

function SelectorLogo({ name, url }: { name: string; url?: string | null }) {
  return (
    <ServiceLogo
      name={name}
      serviceUrl={url || undefined}
      size={20}
      className="size-5 shrink-0 rounded"
    />
  )
}

/** Exact prefix hits are what the typist is aiming at; the rest are consolation. */
function rankMatches(services: Service[], value: string): Service[] {
  const searchTerm = value.trim().toLowerCase()
  if (!searchTerm) return services.slice(0, MAX_SUGGESTIONS)

  const prefixMatches: Service[] = []
  const substringMatches: Service[] = []

  for (const service of services) {
    if (service.name.toLowerCase().startsWith(searchTerm)) {
      prefixMatches.push(service)
    } else {
      substringMatches.push(service)
    }
  }

  return [...prefixMatches, ...substringMatches].slice(0, MAX_SUGGESTIONS)
}

export function ServiceSelector({ value, onChange, disabled = false }: ServiceSelectorProps) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [services, setServices] = React.useState<Service[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  // The catalogue is far too large to hold client-side, so each query round-trips.
  React.useEffect(() => {
    let isCurrent = true
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/services?q=${encodeURIComponent(value.trim())}`, {
          signal: controller.signal,
        })
        if (!response.ok) return
        const data = await response.json()
        if (isCurrent) setServices(data.services || [])
      } catch {
        // Aborted or offline: keep the previous results rather than blanking the list.
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      isCurrent = false
      controller.abort()
      clearTimeout(timer)
    }
  }, [value])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue, undefined)
    setShowDropdown(inputValue.length > 0)
  }

  const handleSelect = (service: Service) => {
    onChange(service.name, service.url || undefined)
    setShowDropdown(false)
  }

  const filteredServices = React.useMemo(() => rankMatches(services, value), [services, value])

  const selectedService = services.find((s) => s.name.toLowerCase() === value.toLowerCase())
  const isOpen = showDropdown && !isLoading && filteredServices.length > 0

  return (
    // The list renders in a popover portal so it never grows the dialog's scroll area.
    <Popover open={isOpen} onOpenChange={setShowDropdown}>
      <PopoverAnchor asChild>
        <div className="relative">
          {value && selectedService && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
              <SelectorLogo name={value} url={selectedService?.url} />
            </div>
          )}
          <Input
            value={value}
            onChange={handleInputChange}
            onFocus={() => value.length > 0 && setShowDropdown(true)}
            placeholder="e.g., Netflix, Spotify"
            disabled={disabled}
            className={cn(value && selectedService && 'pl-11')}
          />
        </div>
      </PopoverAnchor>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) max-h-60 overflow-y-auto p-0"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {filteredServices.map((service) => (
          <div
            key={service.id}
            onClick={() => handleSelect(service)}
            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <SelectorLogo name={service.name} url={service.url} />
            <span className="flex-1 truncate">{service.name}</span>
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}
