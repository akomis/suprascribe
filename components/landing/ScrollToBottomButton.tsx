'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ScrollToBottomButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  const scrollToContent = () => {
    const heroSection = document.querySelector('section')
    if (heroSection) {
      const targetY = heroSection.offsetHeight
      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div
      className={cn(
        'hover:cursor-pointer absolute bottom-10 left-1/2 -translate-x-1/2 z-20 transition-opacity duration-500',
        isVisible ? 'opacity-100' : 'opacity-0',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={scrollToContent}
        className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-black/80 dark:border-white/80 bg-background/90 backdrop-blur-sm hover:bg-background/80 hover:border-foreground/20 hover:scale-110 transition-all duration-300 animate-pulse"
        aria-label="Scroll to content"
      >
        <ChevronDown className="h-6 w-6" />
      </Button>
    </div>
  )
}
