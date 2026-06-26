import { SuprascribeLogo } from '@/components/landing/SuprascribeLogo'
import { GITHUB_URL } from '@/lib/config/urls'
import Link from 'next/link'

const links = [
  { href: '/terms-and-privacy', label: 'Terms & Privacy' },
  { href: '/blog', label: 'Blog' },
  { href: '/faq', label: 'FAQ' },
  { href: '/safety', label: 'Safety' },
  { href: '/limits', label: 'Limits' },
]

const socials = [
  {
    href: GITHUB_URL,
    label: 'GitHub',
    icon: (
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    ),
  },
  {
    href: 'https://www.youtube.com/@Suprascribe',
    label: 'YouTube',
    icon: (
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    ),
  },
  {
    href: 'https://www.instagram.com/supra_scribe/',
    label: 'Instagram',
    icon: (
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    ),
  },
  {
    href: 'https://www.tiktok.com/@suprascribemanager',
    label: 'TikTok',
    icon: (
      <path d="M12.525.02c1.31-.02 2.611-.01 3.91-.02.078 1.532.63 3.092 1.755 4.175 1.123 1.11 2.71 1.62 4.255 1.78v4.04c-1.45-.05-2.91-.35-4.225-.97-.575-.26-1.11-.6-1.65-.95-.01 2.92.01 5.84-.02 8.75-.07 1.39-.53 2.79-1.36 3.93-1.36 2.04-3.79 3.36-6.27 3.45-1.52.08-3.04-.33-4.34-1.13-2.15-1.27-3.66-3.6-3.88-6.05-.025-.51-.035-1.02-.015-1.52.19-2.02 1.18-3.95 2.71-5.27 1.74-1.53 4.18-2.26 6.46-1.85.02 1.49-.04 2.97-.04 4.46-1.04-.34-2.27-.24-3.18.32-.65.39-1.13 1.01-1.4 1.71-.22.51-.16 1.07-.15 1.61.17 1.18 1.31 2.18 2.51 2.07.79-.01 1.55-.46 1.97-1.13.13-.24.27-.49.28-.77.07-1.27.04-2.53.05-3.8.01-2.86-.01-5.71.02-8.56z" />
    ),
  },
  {
    href: 'https://x.com/supra_scribe',
    label: 'X',
    icon: (
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    ),
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t py-4 sm:py-6">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex flex-col items-center justify-between gap-2 sm:gap-3 md:flex-row">
          <div className="flex flex-col items-center gap-3 sm:gap-4 md:flex-row">
            <SuprascribeLogo />
            <div className="flex items-center gap-3 sm:gap-4 text-muted-foreground">
              {socials.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="hover:text-foreground transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-4 w-4 sm:h-5 sm:w-5"
                    aria-hidden="true"
                  >
                    {social.icon}
                  </svg>
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground transition-colors"
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
