import { Link } from '@tanstack/react-router'
import { Bookmark, CalendarDays, House, Image } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { useLocaleParams, useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'

// Phone-only navigation, as in the mobile design. Hidden from md upwards, where
// the header carries the links.
const TABS: { label: MessageKey; icon: LucideIcon; hash?: string }[] = [
  { label: 'nav.home', icon: House },
  { label: 'nav.activities', icon: CalendarDays, hash: 'upcoming' },
  { label: 'nav.gallery', icon: Image, hash: 'gallery' },
  { label: 'nav.notice', icon: Bookmark, hash: 'notice' },
]

export function MobileTabBar() {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <nav
      aria-label={t('nav.quick')}
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-background md:hidden"
    >
      {TABS.map(({ label, icon: Icon, hash }) => (
        <Link
          key={label}
          to="/{-$locale}"
          params={localeParams}
          {...(hash ? { hash } : {})}
          className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-xs font-medium text-subtle hover:text-brand-deep"
        >
          <Icon className="size-[21px]" aria-hidden="true" />
          {t(label)}
        </Link>
      ))}
    </nav>
  )
}
