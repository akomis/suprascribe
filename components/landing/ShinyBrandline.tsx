import { ShinyText } from '@/components/landing/ShinyText'

/**
 * Full-bleed wordmark that closes the landing page. The sheen is a CSS
 * background-position sweep clipped to the glyphs, so it renders on the server and
 * animates on the compositor with no per-frame JavaScript and no WebGL context.
 *
 * The palette is driven by CSS vars rather than a resolved theme value, so there is
 * no mount gate and no hydration mismatch to work around. The base colour is a mid
 * grey in both themes - the sweep is only legible if it has somewhere to travel to.
 *
 * Geist puts 0.145em of dead space below the baseline inside a 1em line box, so the
 * negative bottom margin pulls the caps down onto the footer's top border. It stops
 * ~0.015em short of the baseline so the overshoot on round caps (S, C) is not clipped
 * by the section's overflow.
 */
export function ShinyBrandline() {
  return (
    <section aria-label="Suprascribe" className="w-full overflow-hidden leading-0 mt-20">
      <ShinyText
        text="SUPRASCRIBE"
        speed={6}
        spread={100}
        shineColor="var(--brandline-shine)"
        className="mb-[-0.13em] w-full whitespace-nowrap text-center font-extrabold leading-none tracking-tighter text-[clamp(2.5rem,13vw,11rem)] [--brandline-shine:#8f8f8f] [--shiny-text-color:#252525] dark:[--brandline-shine:#ffffff] dark:[--shiny-text-color:#b6b6b6]"
      />
    </section>
  )
}
