import { AudiencePage, audienceMetadata } from '@/components/shared/AudiencePage'
import type { Metadata } from 'next'

export const metadata: Metadata = audienceMetadata('students')

export default function SubscriptionTrackingForStudentsPage() {
  return <AudiencePage id="students" />
}
