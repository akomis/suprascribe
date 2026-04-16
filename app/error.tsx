'use client'

import Link from 'next/link'
import Image from 'next/image'
import posthog from 'posthog-js'
import { useEffect } from 'react'
import { ReturnHomeButton } from '@/components/shared/return-home-button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
    posthog.captureException(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <Link href="/" className="hover:opacity-80 transition-opacity mb-2">
        <Image
          src="/logo.jpg"
          alt="Suprascribe"
          width={48}
          height={48}
          className="rounded-lg"
          priority
        />
      </Link>
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <button onClick={reset} className="underline">
        Try again
      </button>
      <ReturnHomeButton />
    </div>
  )
}
