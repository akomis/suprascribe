import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Live Demo - See Suprascribe in Action',
  description:
    'Try Suprascribe without signing up. Explore the subscription dashboard, test spending insights, and see how the subscription manager works - no account needed.',
  alternates: {
    canonical: 'https://www.suprascribe.com/demo',
  },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
