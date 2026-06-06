import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { GITHUB_URL } from '@/lib/config/urls'
import Link from 'next/link'

const links = [
  { href: '/terms-and-privacy', label: 'Terms & Privacy' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/safety', label: 'Safety' },
  { href: '/limits', label: 'Limits' },
  { href: GITHUB_URL, label: 'GitHub', external: true },
]

export function SiteFooter() {
  return (
    <footer className="border-t py-4 sm:py-6">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col items-center justify-between gap-2 sm:gap-3 md:flex-row">
          <SuprascribeLogo />
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
