import { CancelPath } from '@/components/blog/diagrams/CancelPath'
import { CompareColumns } from '@/components/blog/diagrams/CompareColumns'
import { DiagramFigure } from '@/components/blog/diagrams/DiagramFigure'
import { Timeline } from '@/components/blog/diagrams/Timeline'
import type { BlogDiagram as BlogDiagramData } from '@/lib/config/blog'

/**
 * Dispatches a `diagram` section to its component.
 *
 * A switch rather than a lookup table on purpose: a `Record<kind, ComponentType>` loses the
 * correlation between `kind` and the shape of `data`, and the call site then needs a cast.
 * Every diagram renders on the server, so its labels are in the HTML crawlers receive.
 */
export function BlogDiagram({ diagram }: { diagram: BlogDiagramData }) {
  const body = (() => {
    switch (diagram.kind) {
      case 'cancel-path':
        return <CancelPath data={diagram.data} />
      case 'timeline':
        return <Timeline data={diagram.data} />
      case 'compare-columns':
        return <CompareColumns data={diagram.data} />
    }
  })()

  return (
    <DiagramFigure alt={diagram.alt} caption={diagram.caption}>
      {body}
    </DiagramFigure>
  )
}
