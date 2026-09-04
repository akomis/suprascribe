import type { ReactNode } from 'react'

interface DiagramFigureProps {
  /**
   * A prose summary of what the diagram shows. Rendered as visually-hidden text rather than
   * an aria-label so it is real DOM content - screen readers and AI fetchers both read it.
   */
  alt: string
  caption?: string
  children: ReactNode
}

/** Shared chrome for every blog diagram: the frame, the hidden summary, the caption. */
export function DiagramFigure({ alt, caption, children }: DiagramFigureProps) {
  return (
    <figure className="space-y-3">
      <p className="sr-only">{alt}</p>
      <div className="rounded-lg border bg-muted/30 p-5 sm:p-6">{children}</div>
      {caption && (
        <figcaption className="text-xs text-muted-foreground text-center">{caption}</figcaption>
      )}
    </figure>
  )
}
