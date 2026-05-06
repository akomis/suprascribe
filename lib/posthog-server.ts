import { PostHog } from 'posthog-node'

export function getPostHogClient() {
  return new PostHog(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN!, {
    host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  })
}

export async function captureEvent(
  userId: string,
  event: string,
  properties?: Record<string, unknown>,
): Promise<void> {
  if (process.env.NODE_ENV === 'development') return
  const posthog = getPostHogClient()
  posthog.capture({ distinctId: userId, event, properties })
  await posthog.shutdown()
}
