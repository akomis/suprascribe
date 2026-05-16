import { competitors } from '@/lib/config/comparisons'
import { Check, X } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { cn } from '@/lib/utils'

function Cell({ value, bad = false }: { value: boolean; bad?: boolean }) {
  return value ? (
    <Check className="h-4 w-4 mx-auto text-primary" />
  ) : bad ? (
    <X className="h-4 w-4 mx-auto text-destructive" />
  ) : (
    <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
  )
}

export function CompetitorTable() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 pr-4 font-medium" />
              <th className="text-center py-3 px-2 font-medium text-xs leading-tight">
                Auto
                <br />
                Discovery
              </th>
              <th className="text-center py-3 px-2 font-medium text-xs leading-tight">
                One-Time
                <br />
                Pro Upgrade
              </th>
              <th className="text-center py-3 px-2 font-medium text-xs leading-tight">
                Unlimited
                <br />
                Free Tier
              </th>
              <th className="text-center py-3 px-2 font-medium text-xs leading-tight">
                Open
                <br />
                Source
              </th>
              <th className="text-center py-3 px-2 font-medium text-xs leading-tight">
                No Bank
                <br />
                Linking
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b font-medium">
              <td className="py-3 pr-4">Suprascribe</td>
              <td className="text-center py-3 px-2">
                <Check className="h-4 w-4 mx-auto text-primary" />
              </td>
              <td className="text-center py-3 px-2">
                <Check className="h-4 w-4 mx-auto text-primary" />
              </td>
              <td className="text-center py-3 px-2">
                <Check className="h-4 w-4 mx-auto text-primary" />
              </td>
              <td className="text-center py-3 px-2">
                <Check className="h-4 w-4 mx-auto text-primary" />
              </td>
              <td className="text-center py-3 px-2">
                <Check className="h-4 w-4 mx-auto text-primary" />
              </td>
            </tr>
            {competitors.map((c) => (
              <tr key={c.slug} className="border-b last:border-0">
                <td className="py-3 pr-4 text-muted-foreground">{c.name}</td>
                <td className="text-center py-3 px-2">
                  <Cell value={c.hasAutoDiscovery} bad={!c.hasAutoDiscovery} />
                </td>
                <td className="text-center py-3 px-2">
                  <Cell value={!c.isSubscription} bad={c.isSubscription} />
                </td>
                <td className="text-center py-3 px-2">
                  <Cell value={c.hasUnlimitedFree} bad={!c.hasUnlimitedFree} />
                </td>
                <td className="text-center py-3 px-2">
                  <Cell value={c.isOpenSource} bad={!c.isOpenSource} />
                </td>
                <td className="text-center py-3 px-2">
                  {c.hasAutoDiscovery ? (
                    <Cell value={!c.requiresBankLinking} bad={c.requiresBankLinking} />
                  ) : (
                    <span className="text-xs text-muted-foreground/50">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        <Link href="/compare" className={cn(buttonVariants({ variant: 'default' }))}>
          See full comparisons
        </Link>
      </p>
    </div>
  )
}
