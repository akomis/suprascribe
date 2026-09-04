import { competitors } from '@/lib/config/comparisons'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Check, X } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { cn } from '@/lib/utils'

const FEATURES = [
  ['Auto', 'Discovery'],
  ['One-Time', 'Pro Upgrade'],
  ['Unlimited', 'Free Tier'],
  ['Open', 'Source'],
  ['No Bank', 'Linking'],
] as const

function Cell({ value, bad = false }: { value: boolean; bad?: boolean }) {
  return value ? (
    <Check className="h-4 w-4 mx-auto text-primary" />
  ) : bad ? (
    <X className="h-4 w-4 mx-auto text-destructive" />
  ) : (
    <X className="h-4 w-4 mx-auto text-muted-foreground/30" />
  )
}

const NAME_CELL = 'py-3 pr-4 px-0'
const ICON_CELL = 'text-center py-3 px-2'

export function CompetitorTable() {
  return (
    <div className="space-y-4">
      <div
        tabIndex={0}
        role="region"
        aria-label="Suprascribe compared with other subscription trackers"
        className="overflow-x-auto focus-visible:ring-ring/50 focus-visible:ring-[3px] focus-visible:outline-none"
      >
        <Table>
          <TableCaption className="sr-only">
            Suprascribe compared with other subscription trackers
          </TableCaption>
          <TableHeader className="bg-transparent">
            <TableRow className="border-t-0 border-b">
              <TableHead className={NAME_CELL} />
              {FEATURES.map(([first, second]) => (
                <TableHead
                  key={first}
                  scope="col"
                  className={cn(ICON_CELL, 'font-medium text-xs leading-tight')}
                >
                  {first}
                  <br />
                  {second}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-foreground">
            <TableRow className="border-t-0 border-b font-medium">
              <TableHead scope="row" className={cn(NAME_CELL, 'font-medium')}>
                Suprascribe
              </TableHead>
              {FEATURES.map(([first]) => (
                <TableCell key={first} className={ICON_CELL}>
                  <Check className="h-4 w-4 mx-auto text-primary" />
                </TableCell>
              ))}
            </TableRow>
            {competitors.map((c) => (
              <TableRow key={c.slug} className="border-t-0 border-b last:border-0">
                <TableHead
                  scope="row"
                  className={cn(NAME_CELL, 'font-normal text-muted-foreground')}
                >
                  {c.name}
                </TableHead>
                <TableCell className={ICON_CELL}>
                  <Cell value={c.hasAutoDiscovery} bad={!c.hasAutoDiscovery} />
                </TableCell>
                <TableCell className={ICON_CELL}>
                  <Cell value={!c.isSubscription} bad={c.isSubscription} />
                </TableCell>
                <TableCell className={ICON_CELL}>
                  <Cell value={c.hasUnlimitedFree} bad={!c.hasUnlimitedFree} />
                </TableCell>
                <TableCell className={ICON_CELL}>
                  <Cell value={c.isOpenSource} bad={!c.isOpenSource} />
                </TableCell>
                <TableCell className={ICON_CELL}>
                  {c.hasAutoDiscovery ? (
                    <Cell value={!c.requiresBankLinking} bad={c.requiresBankLinking} />
                  ) : (
                    <span className="text-xs text-muted-foreground/50">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground text-center">
        <Link href="/compare" className={cn(buttonVariants({ variant: 'default' }))}>
          See full comparisons
        </Link>
      </p>
    </div>
  )
}
