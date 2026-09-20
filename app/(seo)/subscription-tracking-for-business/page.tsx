import { AudiencePage, audienceMetadata } from '@/components/shared/AudiencePage'
import type { Metadata } from 'next'

export const metadata: Metadata = audienceMetadata('business')

export default function SubscriptionTrackingForBusinessPage() {
  return <AudiencePage id="business" />
}
