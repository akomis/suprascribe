import type { CompareColumn, CompareColumnsData } from '@/lib/config/blog'
import { cn } from '@/lib/utils'
import { Check, X } from 'lucide-react'

function Column({ column }: { column: CompareColumn }) {
  return (
    <div className="space-y-3 rounded-md border bg-background p-4">
      <p className="font-semibold">{column.title}</p>
      <ul className="space-y-2">
        {column.points.map((point) => (
          <li key={point.text} className="flex gap-2 text-sm">
            {point.good ? (
              <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
            ) : (
              <X aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            )}
            <span className={cn(point.good ? 'text-foreground' : 'text-muted-foreground')}>
              {point.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** Exactly two sides, side by side. Three or more columns of facts belong in a table. */
export function CompareColumns({ data }: { data: CompareColumnsData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Column column={data.left} />
      <Column column={data.right} />
    </div>
  )
}
