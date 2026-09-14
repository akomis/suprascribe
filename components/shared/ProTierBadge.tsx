import { Badge } from '@/components/ui/badge'
import { Sparkles } from 'lucide-react'

/**
 * The PRO badge as pure markup, for the places that are naming the tier rather than
 * reporting the visitor's own - upsell copy, the demo banner, the upgrade page.
 *
 * Deliberately hook-free, unlike TierBadge: that one reads the account through
 * react-query and so only works under a QueryProvider, which is mounted per-section
 * rather than at the root. Anything that just needs to say "PRO" belongs here.
 */
export function ProTierBadge() {
  return (
    <Badge variant="default" className="bg-black text-white border-0 shadow-sm gap-1">
      <Sparkles className="size-3" />
      PRO
    </Badge>
  )
}
