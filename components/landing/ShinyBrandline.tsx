import { ShinyText } from '@/components/landing/ShinyText'
import { Space_Grotesk } from 'next/font/google'

// Display face for the wordmark only - loaded here so no other page pays for it.
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: '700',
  display: 'swap',
  preload: false,
})

/**
 * Full-bleed wordmark that closes the landing page. The sheen is a CSS
 * background-position sweep clipped to the glyphs, so it renders on the server and
 * animates on the compositor with no per-frame JavaScript and no WebGL context.
 *
 * The palette is driven by CSS vars rather than a resolved theme value, so there is
 * no mount gate and no hydration mismatch to work around. The base colour is a mid
 * grey in both themes - the sweep is only legible if it has somewhere to travel to.
 *
 * Space Grotesk puts ~0.156em of dead space below the baseline inside a 1em line box
 * (ascent 0.984, descent 0.296), so the negative bottom margin pulls the caps down onto
 * the footer's top border. It deliberately overshoots the baseline by ~0.08em so the
 * section's overflow crops the bottom of the caps and the word sinks into the footer.
 */
export function ShinyBrandline() {
  return (
    <section aria-label="Suprascribe" className="w-full overflow-hidden leading-0 mt-20">
      <ShinyText
        text="SUPRASCRIBE"
        speed={6}
        spread={100}
        shineColor="var(--brandline-shine)"
        // Plain concatenation, not cn(): tailwind-merge reads text-[clamp(...)] as a font
        // size and strips leading-none, which collapses the span to the section's leading-0.
        className={`${spaceGrotesk.className} mb-[-0.24em] w-full whitespace-nowrap text-center font-bold leading-none tracking-tighter text-[clamp(2.5rem,13vw,11rem)] [--brandline-shine:#8f8f8f] [--shiny-text-color:#252525] dark:[--brandline-shine:#ffffff] dark:[--shiny-text-color:#b6b6b6]`}
      />
    </section>
  )
}
