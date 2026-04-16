'use client'

import React from 'react'

type RevealAnimation = 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'zoomIn'

interface RevealProps extends React.PropsWithChildren {
  className?: string
  delayMs?: number
  animation?: RevealAnimation
  preserveInteractivity?: boolean
}

export function Reveal({
  children,
  className = '',
  delayMs = 300,
  animation = 'fadeUp',
  preserveInteractivity = false,
}: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = React.useState(false)

  React.useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delayMs > 0) {
              const id = setTimeout(() => setIsVisible(true), delayMs)
              return () => clearTimeout(id)
            }
            setIsVisible(true)
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [delayMs])

  const base = 'transition-all duration-700 ease-out'

  const initialByAnimation: Record<RevealAnimation, string> = preserveInteractivity
    ? {
        fadeUp: 'opacity-0',
        fadeIn: 'opacity-0',
        fadeLeft: 'opacity-0',
        fadeRight: 'opacity-0',
        zoomIn: 'opacity-0',
      }
    : {
        fadeUp: 'opacity-0 translate-y-6',
        fadeIn: 'opacity-0',
        fadeLeft: 'opacity-0 -translate-x-6',
        fadeRight: 'opacity-0 translate-x-6',
        zoomIn: 'opacity-0 scale-[0.98]',
      }

  const visibleByAnimation: Record<RevealAnimation, string> = preserveInteractivity
    ? {
        fadeUp: 'opacity-100',
        fadeIn: 'opacity-100',
        fadeLeft: 'opacity-100',
        fadeRight: 'opacity-100',
        zoomIn: 'opacity-100',
      }
    : {
        fadeUp: 'opacity-100 translate-y-0',
        fadeIn: 'opacity-100',
        fadeLeft: 'opacity-100 translate-x-0',
        fadeRight: 'opacity-100 translate-x-0',
        zoomIn: 'opacity-100 scale-100',
      }

  return (
    <div
      ref={ref}
      className={[
        base,
        isVisible ? visibleByAnimation[animation] : initialByAnimation[animation],
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
