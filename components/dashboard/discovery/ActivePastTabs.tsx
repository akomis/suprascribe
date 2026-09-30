'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

// Mirrors the dashboard: Active/Past tabs only when both sides have entries,
// otherwise the one non-empty list renders on its own.
export function ActivePastTabs({
  active,
  past,
  className,
  contentClassName,
}: {
  active: ReactNode
  past: ReactNode
  className?: string
  contentClassName?: string
}) {
  if (!active || !past) return <>{active || past}</>

  return (
    <Tabs defaultValue="active" className={cn('w-full', className)}>
      <TabsList className="flex w-full">
        <TabsTrigger value="active" className="text-xs sm:text-sm hover:cursor-pointer">
          <span className="size-2 rounded-full bg-green-500" aria-hidden />
          Active
        </TabsTrigger>
        <TabsTrigger value="past" className="text-xs sm:text-sm hover:cursor-pointer">
          <span className="size-2 rounded-full bg-muted-foreground/50" aria-hidden />
          Past
        </TabsTrigger>
      </TabsList>
      <TabsContent value="active" className={contentClassName}>
        {active}
      </TabsContent>
      <TabsContent value="past" className={contentClassName}>
        {past}
      </TabsContent>
    </Tabs>
  )
}
