import { Link } from '@tanstack/react-router'

import { buttonVariants } from '../ui/button.tsx'
import { cn } from '../../lib/utils.ts'

// Section anchors on the home page. They are router links with a hash, so they
// also work from other public pages (/gallery -> /#kaj).
const NAV = [
  { label: 'আমাদের কাজ', hash: 'kaj' },
  { label: 'আসন্ন কার্যক্রম', hash: 'asonno' },
  { label: 'গ্যালারি', hash: 'gallery' },
  { label: 'নোটিশ', hash: 'notice' },
  { label: 'পরিচিতি', hash: 'porichiti' },
]

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-background">
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1180px] flex-wrap items-center gap-5 px-5 py-3 md:min-h-[84px] md:px-8 md:py-3.5">
        <Link to="/" className="mr-auto flex items-center gap-3">
          <img
            src="/logo.png"
            alt="কলমা সোশ্যাল ক্লাবের লোগো"
            width={46}
            height={37}
            className="h-[29px] w-9 object-contain md:h-[37px] md:w-[46px]"
          />
          <span className="flex flex-col">
            <span className="font-heading text-[17px] leading-tight font-bold text-brand-deep md:text-xl">
              কলমা সোশ্যাল ক্লাব
            </span>
            <span className="hidden text-[13px] leading-snug text-subtle md:block">
              সাভার, ঢাকা · প্রতিষ্ঠা ২০২৪
            </span>
          </span>
        </Link>

        {/* On a phone the bottom tab bar is the navigation. */}
        <nav
          aria-label="প্রধান মেনু"
          className="hidden flex-wrap items-center gap-[26px] md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.hash}
              to="/"
              hash={item.hash}
              className="text-base font-medium text-zinc-800 hover:text-brand-deep"
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/"
            hash="jogdin"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'min-h-11 px-5 text-base',
            )}
          >
            সদস্য হোন
          </Link>
        </nav>
      </div>
    </header>
  )
}
