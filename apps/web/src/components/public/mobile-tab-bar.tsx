import { Link } from '@tanstack/react-router'
import { Bookmark, CalendarDays, House, Image } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// Phone-only navigation, as in the mobile design. Hidden from md upwards, where
// the header carries the links.
const TABS: { label: string; icon: LucideIcon; hash?: string }[] = [
  { label: 'হোম', icon: House },
  { label: 'কার্যক্রম', icon: CalendarDays, hash: 'upcoming' },
  { label: 'গ্যালারি', icon: Image, hash: 'gallery' },
  { label: 'নোটিশ', icon: Bookmark, hash: 'notice' },
]

export function MobileTabBar() {
  return (
    <nav
      aria-label="দ্রুত মেনু"
      className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-line bg-background md:hidden"
    >
      {TABS.map(({ label, icon: Icon, hash }) => (
        <Link
          key={label}
          to="/"
          {...(hash ? { hash } : {})}
          className="flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-xs font-medium text-subtle hover:text-brand-deep"
        >
          <Icon className="size-[21px]" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
