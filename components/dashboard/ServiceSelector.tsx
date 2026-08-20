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
      fallbackClassName="size-4 shrink-0"
    />
  )
}

export function ServiceSelector({ value, onChange, disabled = false }: ServiceSelectorProps) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [services, setServices] = React.useState<Service[]>([])
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        if (response.ok) {
          const data = await response.json()
          setServices(data.services || [])
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    onChange(inputValue, undefined)
    setShowDropdown(inputValue.length > 0)
  }

  const handleSelect = (service: Service) => {
    onChange(service.name, service.url || undefined)
    setShowDropdown(false)
  }

  const filteredServices = React.useMemo(() => {
    if (!value) return services
    const searchTerm = value.toLowerCase()
    return services.filter((service) => service.name.toLowerCase().includes(searchTerm))
  }, [services, value])

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
