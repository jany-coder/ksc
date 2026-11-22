import { Pause, Play } from 'lucide-react'
import { useState } from 'react'

import { useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// A slow ribbon of the club's own key words under the hero: its slogan, its
// six areas of work and its five principles, taking turns. Every line is the
// club's text from elsewhere on the page, so nothing new is claimed here.
//
// Pure CSS (see .marquee in styles.css): the list is drawn twice side by side
// and the pair slides left by exactly one copy, so the loop has no seam. It
// stops on hover and with its pause button (WCAG 2.2.2), and stands still for
// anyone whose device asks for reduced motion.
const LINES: MessageKey[] = [
  'hero.tagline',
  'whatWeDo.harmonyTitle',
  'about.pr1Title',
  'whatWeDo.youthTitle',
  'about.pr2Title',
  'whatWeDo.skillsTitle',
  'about.pr3Title',
  'whatWeDo.educationTitle',
  'about.pr4Title',
  'whatWeDo.environmentTitle',
  'about.pr5Title',
  'whatWeDo.bloodTitle',
]

export function Marquee() {
  const t = useT()
  const [paused, setPaused] = useState(false)

  return (
    <section
      aria-label={t('marquee.label')}
      data-paused={paused ? '' : undefined}
      className="marquee relative overflow-hidden border-b border-line bg-accent"
    >
      {/* The edges fade out, so the words glide in and out of view. */}
      <div className="[mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
        <div className="marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              // The second copy is only there to close the loop.
              aria-hidden={copy === 1 ? true : undefined}
              className="m-0 flex shrink-0 list-none items-center p-0"
            >
              {LINES.map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-8 py-3.5 ps-8 font-heading text-[17px] font-semibold whitespace-nowrap text-brand-deep md:py-4 md:text-xl"
                >
                  {/* A small, quiet dot keeps one phrase from running into
                      the next. */}
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 rounded-full bg-primary/40"
                  />
                  {t(key)}
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? t('marquee.play') : t('marquee.pause')}
        className="absolute end-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-background/90 text-brand-deep shadow-sm backdrop-blur hover:bg-background focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:hidden md:end-4"
      >
        {paused ? (
          <Play aria-hidden="true" className="size-4" />
        ) : (
          <Pause aria-hidden="true" className="size-4" />
        )}
      </button>
    </section>
  )
}
