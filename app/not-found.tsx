import Image from 'next/image'
import Link from 'next/link'
import { ReturnHomeButton } from '@/components/shared/return-home-button'
import { StaticGridBackground } from '@/components/landing/StaticGridBackground'

export default function NotFound() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen gap-4 overflow-hidden px-4">
      <StaticGridBackground />
      <Link href="/" className="z-10 hover:opacity-80 transition-opacity mb-2">
        <Image
          src="/logo.jpg"
          alt="Suprascribe"
          width={48}
          height={48}
          className="rounded-lg"
          priority
        />
      </Link>
      <h1 className="z-10 max-w-xl text-center text-2xl font-semibold">
        It seems like you got lost
      </h1>
      <div className="z-10 pt-4">
        <ReturnHomeButton />
      </div>
    </div>
  )
}
