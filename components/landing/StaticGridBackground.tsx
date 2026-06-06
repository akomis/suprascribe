import { ServiceLogo } from '@/components/shared/ServiceLogo'

type LogoPosition = {
  name: string
  url: string
  logoPath: string
  x: number
  y: number
  showOnMobile?: boolean
}

// Reduced from 13 to 8 logos for better performance
const LOGO_POSITIONS: LogoPosition[] = [
  {
    name: 'Netflix',
    url: 'netflix.com',
    logoPath: '/logos/netflix.svg',
    x: 25,
    y: 10,
    showOnMobile: true,
  },
  {
    name: 'Spotify',
    url: 'spotify.com',
    logoPath: '/logos/spotify.svg',
    x: 16,
    y: 50,
    showOnMobile: true,
  },
  {
    name: 'Disney+',
    url: 'disneyplus.com',
    logoPath: '/logos/disneyplus.svg',
    x: 84,
    y: 16,
    showOnMobile: true,
  },
  {
    name: 'Dropbox',
    url: 'dropbox.com',
    logoPath: '/logos/dropbox.svg',
    x: 80,
    y: 65,
    showOnMobile: true,
  },
  {
    name: 'Adobe Creative Cloud',
    url: 'adobe.com',
    logoPath: '/logos/adobe.svg',
    x: 65,
    y: 2,
  },
  // Desktop-only logos
  { name: 'YouTube Premium', url: 'youtube.com', logoPath: '/logos/youtube.svg', x: 5, y: 32 },
  { name: 'Amazon Prime', url: 'amazon.com', logoPath: '/logos/amazon.svg', x: 96, y: 45 },
]

const MASK =
  'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%), radial-gradient(ellipse 100% 80% at 50% 0%, black 20%, transparent 100%)'

export function StaticGridBackground({ cellSize = 80 }: { cellSize?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-1"
      style={{
        maskImage: MASK,
        WebkitMaskImage: MASK,
        maskComposite: 'intersect',
        WebkitMaskComposite: 'source-in',
        // Promote to composite layer for smoother scrolling
        transform: 'translateZ(0)',
      }}
    >
      {LOGO_POSITIONS.map((logo, i) => (
        <div
          key={logo.url}
          className={`absolute group pointer-events-auto ${logo.showOnMobile ? '' : 'hidden sm:block'}`}
          style={{
            left: `${logo.x}%`,
            top: `${logo.y}%`,
            width: `${cellSize}px`,
            height: `${cellSize}px`,
            transform: 'translate(-50%, -50%)',
            // Static fade-in animation with reduced motion
            animation: `fadeIn 0.6s ease-out ${i * 80}ms both`,
          }}
        >
          <div className="flex h-full w-full items-center justify-center opacity-20 grayscale rounded-2xl overflow-hidden transition-all duration-500 md:group-hover:grayscale-0 md:group-hover:opacity-70">
            <ServiceLogo
              name={logo.name}
              serviceUrl={logo.url}
              resolvedLogoUrl={logo.logoPath}
              size={cellSize}
              naturalSize
              className="drop-shadow-md"
              fallbackClassName="opacity-0"
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
