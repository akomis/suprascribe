import { AudiencePage, audienceMetadata } from '@/components/shared/AudiencePage'
import type { Metadata } from 'next'

export const metadata: Metadata = audienceMetadata('freelancers')

export default function SubscriptionTrackingForFreelancersPage() {
  return <AudiencePage id="freelancers" />
}
