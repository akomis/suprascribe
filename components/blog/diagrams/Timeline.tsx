import type { TimelineData } from '@/lib/config/blog'
import { cn } from '@/lib/utils'

/** Dated events on a vertical rail. `emphasis` marks the moment that costs money. */
export function Timeline({ data }: { data: TimelineData }) {
  return (
    <ol className="relative space-y-5 border-l pl-6">
      {data.events.map((event) => (
        <li key={`${event.date}-${event.label}`} className="relative space-y-1">
          <span
            aria-hidden="true"
            className={cn(
              'absolute -left-[29px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-background',
              event.emphasis ? 'bg-destructive' : 'bg-foreground/50',
            )}
          />
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {event.date}
          </p>
          <p className={cn('text-sm font-semibold', event.emphasis && 'text-destructive')}>
            {event.label}
          </p>
          {event.detail && <p className="text-sm text-muted-foreground">{event.detail}</p>}
        </li>
      ))}
    </ol>
  )
}
