'use client'

import { AnimatePresence, motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M`
  if (n >= 1_000) return `${Math.floor(n / 1_000)}k`
  return n.toString()
}

export function DiscoveryRealCounter() {
  const [count, setCount] = useState<number | null>(null)
  const [users, setUsers] = useState<number | null>(null)
  const [isInViewport, setIsInViewport] = useState(false)
  const [isTabActive, setIsTabActive] = useState(true)
  const [isWindowFocused, setIsWindowFocused] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const fetchCount = useCallback(async () => {
    try {
      const res = await fetch('/api/discovery/stats')
      if (res.ok) {
        const data = await res.json()
        setCount(data.total)
        setUsers(data.users)
      }
    } catch {}
  }, [])

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(document.visibilityState === 'visible')
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [])

  useEffect(() => {
    const handleFocus = () => setIsWindowFocused(true)
    const handleBlur = () => setIsWindowFocused(false)

    setIsWindowFocused(document.hasFocus())

    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting)
      },
      { threshold: 0.1 },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isInViewport || !isTabActive || !isWindowFocused) return

    fetchCount()

    const interval = setInterval(fetchCount, 3000)
    return () => clearInterval(interval)
  }, [isInViewport, isTabActive, isWindowFocused, fetchCount])

  if (count === null || count === 0 || users === null || users < 100) {
    return <div ref={containerRef} className="h-5" />
  }

  return (
    <div ref={containerRef} className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <span>
        <AnimatePresence mode="wait">
          <motion.span
            key={count}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="inline-block font-semibold text-foreground text-2xl"
          >
            {formatCount(count)}
          </motion.span>
        </AnimatePresence>{' '}
        subscriptions discovered
        {users !== null && users > 0 && (
          <>
            {' '}
            by{' '}
            <AnimatePresence mode="wait">
              <motion.span
                key={users}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="inline-block font-semibold text-foreground text-2xl"
              >
                {formatCount(users)}
              </motion.span>
            </AnimatePresence>{' '}
            {users === 1 ? 'user' : 'users'}
          </>
        )}
      </span>
    </div>
  )
}
