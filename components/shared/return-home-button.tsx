import Link from 'next/link'

export function ReturnHomeButton() {
  return (
    <Link
      href="/"
      className="border border-current px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:opacity-80 transition-opacity rounded-lg"
    >
      Return Home
    </Link>
  )
}
