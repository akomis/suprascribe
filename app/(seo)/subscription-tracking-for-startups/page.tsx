import { AudiencePage, audienceMetadata } from '@/components/shared/AudiencePage'
import type { Metadata } from 'next'

export const metadata: Metadata = audienceMetadata('startups')

export default function SubscriptionTrackingForStartupsPage() {
  return <AudiencePage id="startups" />
}
