import type { CancelPathData } from '@/lib/config/blog'
import Link from 'next/link'

/**
 * "Where did you sign up?" branching to one action per answer. Strictly one level deep -
 * anything that needs a second branch is a table.
 *
 * The connector is the one piece of real geometry here, so it is the one inline SVG.
 */
export function CancelPath({ data }: { data: CancelPathData }) {
  return (
    <div className="space-y-4">
      <p className="text-center font-semibold">{data.question}</p>
      <div className="space-y-3">
        {data.branches.map((branch) => (
          <div
            key={branch.condition}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="rounded-md border bg-background px-3 py-2 text-sm sm:w-2/5">
              {branch.condition}
            </div>
            <svg
              aria-hidden="true"
              viewBox="0 0 24 8"
              className="h-4 w-6 shrink-0 rotate-90 self-center text-muted-foreground sm:rotate-0"
            >
              <path
                d="M0 4h20M16 1l4 3-4 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex-1 rounded-md border border-foreground/20 bg-foreground/5 px-3 py-2 text-sm font-medium">
              {branch.href ? (
                <Link
                  href={branch.href}
                  className="underline underline-offset-4 hover:no-underline"
                >
                  {branch.action}
                </Link>
              ) : (
                branch.action
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
