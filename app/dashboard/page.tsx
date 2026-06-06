import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { subscriptionKeys } from '@/lib/hooks/query-keys'
import { fetchSubscriptionsServer } from '@/lib/services/subscriptions-server'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: subscriptionKeys.lists(),
    queryFn: fetchSubscriptionsServer,
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DashboardClient />
    </HydrationBoundary>
  )
}
