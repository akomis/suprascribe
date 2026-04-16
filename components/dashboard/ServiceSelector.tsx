'use client'

import { Input } from '@/components/ui/input'
import { useLogo } from '@/lib/hooks/useLogo'
import { cn } from '@/lib/utils'
import { Box } from 'lucide-react'
import Image from 'next/image'
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

function ServiceLogo({ name, url }: { name: string; url?: string | null }) {
  const logoUrl = useLogo(name, url || undefined)
  const [logoError, setLogoError] = React.useState(false)

  if (logoUrl && !logoError) {
    return (
      <Image
        src={logoUrl}
        alt={`${name} logo`}
        className="size-5 object-contain rounded flex-shrink-0"
        onError={() => setLogoError(true)}
        width={20}
        height={20}
        unoptimized
      />
    )
  }

  return <Box className="size-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
}

export function ServiceSelector({ value, onChange, disabled = false }: ServiceSelectorProps) {
  const [showDropdown, setShowDropdown] = React.useState(false)
  const [services, setServices] = React.useState<Service[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const containerRef = React.useRef<HTMLDivElement>(null)

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

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {value && selectedService && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <ServiceLogo name={value} url={selectedService?.url} />
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

      {showDropdown && !isLoading && filteredServices.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md overflow-hidden">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              onClick={() => handleSelect(service)}
              className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <ServiceLogo name={service.name} url={service.url} />
              <span className="flex-1 truncate">{service.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
