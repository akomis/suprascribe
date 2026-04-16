import Image from 'next/image'
import Link from 'next/link'
import { ReturnHomeButton } from '@/components/shared/return-home-button'

export default function NotFound() {
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
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <ReturnHomeButton />
    </div>
  )
}
