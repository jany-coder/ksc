import { Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useLocaleParams, useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { cn } from '../../lib/utils.ts'

// Same sections as the header. Kept as a small separate list on purpose: this
// bar is the slim version, only the sections and nothing else.
const SECTIONS = [
  { key: 'nav.whatWeDo', hash: 'what-we-do' },
  { key: 'nav.upcoming', hash: 'upcoming' },
  { key: 'nav.gallery', hash: 'gallery' },
  { key: 'nav.notice', hash: 'notice' },
  { key: 'nav.about', hash: 'about' },
] as const satisfies readonly { key: MessageKey; hash: string }[]

// How far down the page before the bar slides in: past the header and into the
// hero, so it never shows next to the real header.
const SHOW_AFTER_PX = 320

/**
 * A thin bar of section links that slides down from the top once you have
 * scrolled a little, and slides away again at the top of the page. The full
 * header stays where it is; this only takes 44px while you read. Desktop only:
 * on a phone the bottom tab bar already does this job.
 */
export function SectionBar() {
  const t = useT()
  const localeParams = useLocaleParams()
  const [visible, setVisible] = useState(false)
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setVisible(window.scrollY > SHOW_AFTER_PX)
    }
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [])

  // Which section is on screen. Pages without these sections (the gallery
  // page) simply highlight nothing.
  useEffect(() => {
    const targets = SECTIONS.map((s) => document.getElementById(s.hash)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (targets.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id)
      },
      // A band across the upper-middle of the screen.
      { rootMargin: '-20% 0px -70% 0px' },
    )
    for (const el of targets) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      // inert: while hidden, the links cannot be focused with Tab either.
      inert={!visible}
      className={cn(
        'fixed inset-x-0 top-0 z-30 hidden border-b border-line bg-background md:block',
        'motion-safe:transition-transform motion-safe:duration-300',
        visible ? 'translate-y-0' : '-translate-y-full',
      )}
    >
      <nav
        aria-label={t('nav.sections')}
        className="mx-auto flex h-11 w-full max-w-[1180px] items-center justify-center gap-8 px-8"
      >
        {SECTIONS.map((item) => (
          <Link
            key={item.hash}
            to="/{-$locale}"
            params={localeParams}
            hash={item.hash}
            aria-current={active === item.hash ? 'location' : undefined}
            className={cn(
              'border-b-2 py-2 text-[15px] font-medium transition-colors',
              active === item.hash
                ? 'border-primary text-brand-deep'
                : 'border-transparent text-subtle hover:text-brand-deep',
            )}
          >
            {t(item.key)}
          </Link>
        ))}
      </nav>
    </div>
  )
}
