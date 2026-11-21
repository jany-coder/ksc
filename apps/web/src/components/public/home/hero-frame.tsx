import { Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { imageUrl } from '../../../lib/image-limits.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { cn } from '../../../lib/utils.ts'

export type HeroSlide = {
  id: string
  width: number
  height: number
  caption: string | null
}

// How long each photo stays before the next fades in.
const SLIDE_MS = 6000

/**
 * The hero's photo frame: the club's photos fade into one another, each
 * zooming in very slowly. Decoration, not a slider: nothing is hidden in it
 * (every photo is in the gallery too), so it has no arrows or dots to click.
 *
 * Light on the network: only the first photo loads with the page. Each next
 * one is asked for while the one before is on screen (the 800px copy on a
 * phone, the 1600px one on a wide screen), so a visitor who leaves early
 * downloads nothing more. It stands still, on its
 * first photo, for anyone whose device asks for reduced motion or data saving,
 * and stops on hover, on keyboard focus, or with its pause button (WCAG 2.2.2).
 */
export function HeroFrame({
  slides,
  children,
}: {
  slides: HeroSlide[]
  /** Laid over the photos, at the bottom (the founding year). */
  children?: ReactNode
}) {
  const t = useT()
  const count = slides.length
  const [index, setIndex] = useState(0)
  // The photo fading out, which keeps its zoom while it goes.
  const [previous, setPrevious] = useState<number | null>(null)
  // Photos given a file to load, and photos whose file has arrived.
  const [wanted, setWanted] = useState<ReadonlySet<number>>(() => new Set([0]))
  const [ready, setReady] = useState<ReadonlySet<number>>(() => new Set([0]))
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false)
  // Still until the browser has said motion is fine (and always on the server).
  const [still, setStill] = useState(true)

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as { connection?: { saveData?: boolean } })
      .connection
    const update = () =>
      setStill(motion.matches || connection?.saveData === true)
    update()
    motion.addEventListener('change', update)
    return () => motion.removeEventListener('change', update)
  }, [])

  const next = (index + 1) % count
  const moving = count > 1 && !still
  const running = moving && !paused && !held

  // Ask for the next photo, but only once the page itself has finished.
  useEffect(() => {
    if (!moving || wanted.has(next)) return
    const want = () => setWanted((w) => new Set(w).add(next))
    if (document.readyState === 'complete') {
      want()
      return
    }
    window.addEventListener('load', want, { once: true })
    return () => window.removeEventListener('load', want)
  }, [moving, next, wanted])

  // Move on only to a photo that has arrived, so it never fades to nothing.
  useEffect(() => {
    if (!running || !ready.has(next)) return
    const timer = window.setTimeout(() => {
      setPrevious(index)
      setIndex(next)
    }, SLIDE_MS)
    return () => window.clearTimeout(timer)
  }, [running, ready, next, index])

  return (
    <figure
      aria-label={t('hero.frameLabel')}
      data-paused={running ? undefined : ''}
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={() => setHeld(false)}
      className="hero-frame relative m-0 aspect-[4/3] overflow-hidden rounded-[22px] bg-brand-deep md:aspect-[5/6]"
    >
      {slides.map((slide, i) =>
        wanted.has(i) ? (
          // A wide screen gets the large copy: the frame is ~760 CSS pixels
          // across a landscape photo, so the 800px copy would be stretched
          // to twice its size on a sharp screen and look soft. A phone shows
          // it at half that, so the small copy stays sharp and light there.
          <picture key={slide.id}>
            <source
              media="(min-width: 768px)"
              srcSet={imageUrl(slide.id, 'full')}
            />
            <img
              src={imageUrl(slide.id, 'thumb')}
              alt={i === index ? (slide.caption ?? t('hero.photoAlt')) : ''}
              aria-hidden={i === index ? undefined : true}
              width={slide.width}
              height={slide.height}
              decoding="async"
              onLoad={() => setReady((r) => (r.has(i) ? r : new Set(r).add(i)))}
              className={cn(
                'absolute inset-0 size-full object-cover transition-opacity duration-[1400ms] ease-in-out',
                i === index ? 'opacity-100' : 'opacity-0',
                (i === index || i === previous) && 'hero-slide',
              )}
            />
          </picture>
        ) : null,
      )}

      {/* A soft dark edge at the bottom, so the badge and button always read. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-[linear-gradient(to_top,rgba(9,38,27,0.75),transparent)]"
      />

      <figcaption className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 md:inset-x-4 md:bottom-4">
        {children}
        {moving && (
          <div className="flex shrink-0 items-center gap-2.5">
            <span aria-hidden="true" className="flex gap-1">
              {slides.map((slide, i) => (
                <span
                  key={slide.id}
                  className={cn(
                    'h-1.5 rounded-full bg-white transition-all duration-500',
                    i === index ? 'w-4' : 'w-1.5 opacity-50',
                  )}
                />
              ))}
            </span>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? t('hero.play') : t('hero.pause')}
              className="flex size-10 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white backdrop-blur-md hover:bg-black/45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {paused ? (
                <Play aria-hidden="true" className="size-4" />
              ) : (
                <Pause aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        )}
      </figcaption>
    </figure>
  )
}
