import { TierBadge } from '@/components/dashboard/settings/TierBadge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function DemoBanner() {
  return (
    <div className="sticky top-0 z-50 bg-primary text-primary-foreground py-2 px-4">
      <div className="container mx-auto flex items-center justify-between max-w-[1000px]">
        <div className="flex items-center gap-2">
          <TierBadge forceTier="PRO" />
          <span className="text-xs sm:text-sm font-medium">Demo</span>
        </div>
        <Link href="/login?tab=signup">
          <Button variant="secondary" size="sm" className="text-xs sm:text-sm">
            Sign Up Free
          </Button>
        </Link>
      </div>
    </div>
  )
}
