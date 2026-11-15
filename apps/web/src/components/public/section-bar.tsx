import { Link, useRouterState } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import { useLocaleParams, useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { cn } from '../../lib/utils.ts'

// Same sections as the header. Kept as a small separate list on purpose: this
// bar is the slim version, only the sections and nothing else.
const SECTIONS = [
  { key: 'nav.whatWeDo', hash: 'what-we-do' },
  { key: 'nav.about', hash: 'about' },
  { key: 'nav.activities', hash: 'activities' },
  { key: 'nav.future', hash: 'future' },
  { key: 'nav.gallery', hash: 'gallery' },
  { key: 'nav.notice', hash: 'notice' },
] as const satisfies readonly { key: MessageKey; hash: string }[]

// How far down the page before the bar slides in: past the header and into the
// hero, so it never shows next to the real header.
const SHOW_AFTER_PX = 320

// A section counts as the current one once its top is above this line (just
// below the 44px bar, with room for the heading).
const ACTIVE_LINE_PX = 120

const TRACKED: string[] = [...SECTIONS.map((s) => s.hash), 'upcoming', 'join']

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

  // The current section is MEASURED on every scroll: the last section whose top
  // has passed the line just under the bar. (An IntersectionObserver only fires
  // when something changes, so after a long jump from a link it could keep
  // showing the old section.) It also re-measures when the address changes,
  // because the sections may mount after this bar does.
  const href = useRouterState({ select: (s) => s.location.href })
  useEffect(() => {
    let frame = 0
    const measure = () => {
      frame = 0
      setVisible(window.scrollY > SHOW_AFTER_PX)
      // The section whose top is closest to the line, among those that have
      // passed it. Judged by position on the page, not by the order of the
      // links in the bar (the bar lists the gallery before the notices, the
      // page has them the other way round).
      let current: string | null = null
      let closest = -Infinity
      for (const id of TRACKED) {
        const top = document.getElementById(id)?.getBoundingClientRect().top
        if (top !== undefined && top <= ACTIVE_LINE_PX && top > closest) {
          closest = top
          current = id
        }
      }
      // The "join" section is tracked only so the section above stops being
      // highlighted once you have left it; it has no link in the bar.
      setActive(current === 'join' ? null : current)
    }
    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(measure)
    }
    measure()
    // The page may still be settling (images, fonts, a smooth scroll in progress).
    const late = window.setTimeout(measure, 400)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      window.clearTimeout(late)
      if (frame !== 0) cancelAnimationFrame(frame)
    }
  }, [href])

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
