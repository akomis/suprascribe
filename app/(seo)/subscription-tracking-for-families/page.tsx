import { AudiencePage, audienceMetadata } from '@/components/shared/AudiencePage'
import type { Metadata } from 'next'

export const metadata: Metadata = audienceMetadata('families')

export default function SubscriptionTrackingForFamiliesPage() {
  return <AudiencePage id="families" />
}
