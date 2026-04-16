'use client'

import React, { useEffect, useRef, useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { DivGrid } from '@/components/landing/DivGrid'
import { ServiceLogo } from '@/components/shared/ServiceLogo'
import { resolveLogoUrl } from '@/lib/hooks/useLogo'

type Service = {
  id: number
  name: string
  url: string
}

const LogoOverlay = React.memo(
  ({
    logoCells,
    resolvedLogos,
    dimensions,
    cellSize,
    onCellClick,
  }: {
    logoCells: Map<number, { name: string; url: string; delay: number }>
    resolvedLogos: Map<string, string | null>
    dimensions: { rows: number; cols: number }
    cellSize: number
    onCellClick: (row: number, col: number) => void
  }) => {
    return (
      <div
        className="pointer-events-none absolute inset-0 z-[4]"
        style={{
          maskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%)',
          maskComposite: 'intersect',
          WebkitMaskComposite: 'source-in',
        }}
      >
        {Array.from(logoCells.entries()).map(([idx, logoData]) => {
          const row = Math.floor(idx / dimensions.cols)
          const col = idx % dimensions.cols

          return (
            <div
              key={`logo-${idx}`}
              className="group pointer-events-auto absolute animate-in fade-in fill-mode-backwards duration-1000 cursor-pointer"
              style={{
                left: `${col * cellSize}px`,
                top: `${row * cellSize}px`,
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                animationDelay: `${logoData.delay}ms`,
              }}
              onClick={() => onCellClick(row, col)}
            >
              <div className="flex h-full w-full items-center justify-center opacity-20 grayscale transition-all duration-500 group-hover:grayscale-0">
                <ServiceLogo
                  name={logoData.name}
                  serviceUrl={logoData.url}
                  resolvedLogoUrl={resolvedLogos.get(logoData.url) ?? null}
                  size={cellSize}
                  className="drop-shadow-md"
                  fallbackClassName="opacity-0"
                />
              </div>
            </div>
          )
        })}
      </div>
    )
  },
)
LogoOverlay.displayName = 'LogoOverlay'

const POPULAR_SERVICES: Service[] = [
  { id: -1, name: 'Netflix', url: 'netflix.com' },
  { id: -2, name: 'Spotify', url: 'spotify.com' },
  { id: -3, name: 'Disney+', url: 'disneyplus.com' },
  { id: -4, name: 'Apple TV+', url: 'tv.apple.com' },
  { id: -5, name: 'YouTube Premium', url: 'youtube.com' },
  { id: -6, name: 'Amazon Prime', url: 'amazon.com' },
  { id: -7, name: 'Adobe Creative Cloud', url: 'adobe.com' },
  { id: -8, name: 'Microsoft 365', url: 'microsoft.com' },
  { id: -9, name: 'Dropbox', url: 'dropbox.com' },
  { id: -10, name: 'GitHub', url: 'github.com' },
]

export const BackgroundRippleEffect = ({
  cellSize = 56,
}: {
  rows?: number
  cols?: number
  cellSize?: number
}) => {
  const [clickedCell, setClickedCell] = useState<{
    row: number
    col: number
  } | null>(null)
  const [rippleKey, setRippleKey] = useState(0)
  const [dimensions, setDimensions] = useState({ rows: 8, cols: 27 })
  const [services, setServices] = useState<Service[]>([])
  const [resolvedLogos, setResolvedLogos] = useState<Map<string, string | null>>(new Map())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch('/api/services')
        const data = await response.json()
        if (data.services) {
          const servicesWithLogos = data.services.filter(
            (service: Service) => service.url && service.url.trim() !== '',
          )

          const getBaseDomain = (url: string) => {
            try {
              const normalized = url.toLowerCase().trim()
              const withProtocol = normalized.startsWith('http')
                ? normalized
                : `https://${normalized}`
              const hostname = new URL(withProtocol).hostname.replace(/^www\./, '')
              const parts = hostname.split('.')
              if (parts.length <= 2) return hostname
              const lastTwo = parts.slice(-2).join('.')
              if (['co.uk', 'com.au', 'co.jp', 'com.br', 'co.nz'].includes(lastTwo)) {
                return parts.slice(-3).join('.')
              }
              return parts.slice(-2).join('.')
            } catch {
              return url.toLowerCase().trim()
            }
          }

          const seenDomains = new Set<string>()
          const uniqueServices = servicesWithLogos.filter((service: Service) => {
            const domain = getBaseDomain(service.url)
            if (seenDomains.has(domain)) return false
            seenDomains.add(domain)
            return true
          })

          if (uniqueServices.length < 10) {
            const needed = 10 - uniqueServices.length
            const additionalServices = POPULAR_SERVICES.filter(
              (ps) => !seenDomains.has(getBaseDomain(ps.url)),
            ).slice(0, needed)
            setServices([...uniqueServices, ...additionalServices])
          } else {
            setServices(uniqueServices)
          }
        }
      } catch {
        setServices(POPULAR_SERVICES)
      }
    }

    fetchServices()
  }, [])

  const logoCells = useMemo(() => {
    if (services.length === 0) return new Map()

    const totalCells = dimensions.rows * dimensions.cols
    const logoCellCount = Math.min(Math.floor(totalCells * 0.1), services.length)
    const cells = new Map<number, { name: string; url: string; delay: number }>()

    const isValidCell = (idx: number) => {
      const row = Math.floor(idx / dimensions.cols)
      const col = idx % dimensions.cols

      const isMobile = dimensions.cols < 20

      const centerCol = Math.floor(dimensions.cols / 2)
      const centerRow = Math.floor(dimensions.rows / 2)
      const centerRadius = isMobile ? 1.5 : 5
      const isInCenterArea =
        Math.abs(col - centerCol) <= centerRadius && Math.abs(row - centerRow) <= centerRadius

      if (isMobile) {
        return !isInCenterArea
      }

      const isInLastTwoRows = row >= dimensions.rows - 2

      return !isInLastTwoRows && !isInCenterArea
    }

    const shuffledServices = [...services].sort(() => Math.random() - 0.5)
    const usedIndices = new Set<number>()

    for (let i = 0; i < logoCellCount; i++) {
      let randomIndex: number
      let attempts = 0
      const maxAttempts = totalCells * 2 // Prevent infinite loop

      do {
        randomIndex = Math.floor(Math.random() * totalCells)
        attempts++
      } while (
        (!isValidCell(randomIndex) || usedIndices.has(randomIndex)) &&
        attempts < maxAttempts
      )

      if (attempts >= maxAttempts) continue

      usedIndices.add(randomIndex)
      cells.set(randomIndex, {
        name: shuffledServices[i].name,
        url: shuffledServices[i].url,
        delay: Math.random() * 2000, // Random delay between 0-2 seconds
      })
    }

    return cells
  }, [dimensions.rows, dimensions.cols, services])

  useEffect(() => {
    if (logoCells.size === 0) return

    const uniqueServices = Array.from(
      new Map(Array.from(logoCells.values()).map((s) => [s.url, s])).values(),
    )

    Promise.all(uniqueServices.map((s) => resolveLogoUrl(s.name, s.url))).then((results) => {
      setResolvedLogos(new Map(uniqueServices.map((s, i) => [s.url, results[i]])))
    })
  }, [logoCells])

  useEffect(() => {
    const updateDimensions = () => {
      if (ref.current) {
        const { width, height } = ref.current.getBoundingClientRect()
        const cols = Math.ceil(width / cellSize)
        const rows = Math.ceil(height / cellSize)
        setDimensions({ rows, cols })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [cellSize])

  return (
    <div
      ref={ref}
      className={cn(
        'absolute inset-0 h-full w-full z-1',
        '[--cell-border-color:var(--color-neutral-300)] [--cell-fill-color:var(--color-neutral-200)] [--cell-shadow-color:var(--color-neutral-500)]',
        'dark:[--cell-border-color:var(--color-neutral-700)] dark:[--cell-fill-color:var(--color-neutral-800)] dark:[--cell-shadow-color:var(--color-neutral-800)]',
      )}
    >
      <div className="relative h-full w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-[2] h-full w-full overflow-hidden" />
        <DivGrid
          key={`base-${rippleKey}`}
          className="mask-radial-from-20% mask-radial-at-top opacity-600"
          style={{
            maskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%)',
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
          rows={dimensions.rows}
          cols={dimensions.cols}
          cellSize={cellSize}
          borderColor="var(--cell-border-color)"
          fillColor="var(--cell-fill-color)"
          clickedCell={clickedCell}
          onCellClick={(row, col) => {
            setClickedCell({ row, col })
            setRippleKey((k) => k + 1)
          }}
          interactive
        />
        <LogoOverlay
          logoCells={logoCells}
          resolvedLogos={resolvedLogos}
          dimensions={dimensions}
          cellSize={cellSize}
          onCellClick={(row, col) => {
            setClickedCell({ row, col })
            setRippleKey((k) => k + 1)
          }}
        />
      </div>
    </div>
  )
}
