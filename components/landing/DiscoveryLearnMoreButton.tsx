import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function DiscoveryLearnMoreButton() {
  return (
    <Button variant="outline" size="sm" asChild>
      <Link href="/safety" target="_blank" rel="noopener noreferrer">
        Learn More
      </Link>
    </Button>
  )
}
