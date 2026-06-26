import { TryFunnel } from '@/components/discovery-once/TryFunnel'
import { StaticGridBackground } from '@/components/landing/StaticGridBackground'
import { Spinner } from '@/components/ui/spinner'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'One-Time Subscription Scan for €1 - Suprascribe',
  description:
    'Scan one inbox once for €1 and reveal your subscriptions with unsubscribe links. No account, no sign-up, nothing saved.',
}

export default function TryPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 overflow-hidden px-4 py-16">
      <StaticGridBackground />
      <Link href="/" className="z-10 hover:opacity-80 transition-opacity">
        <Image
          src="/logo.jpg"
          alt="Suprascribe Logo"
          width={42}
          height={42}
          className="rounded-lg"
          priority
        />
      </Link>
      <div className="z-10 w-full flex justify-center">
        <Suspense fallback={<Spinner className="size-10 text-primary" />}>
          <TryFunnel />
        </Suspense>
      </div>
      <Link
        href="/"
        className="z-10 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Back to Suprascribe
      </Link>
    </div>
  )
}
