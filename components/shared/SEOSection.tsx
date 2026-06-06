import { Separator } from '@/components/ui/separator'
import { ReactNode } from 'react'

interface SEOSectionProps {
  title: string
  children: ReactNode
}

export function SEOSection({ title, children }: SEOSectionProps) {
  return (
    <>
      <Separator className="data-[orientation=horizontal]:w-[40vw] mx-auto" />

      <section className="container mx-auto px-4 py-12 sm:py-20 max-w-3xl">
        <div className="space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{title}</h2>
          </div>
          {children}
        </div>
      </section>
    </>
  )
}
