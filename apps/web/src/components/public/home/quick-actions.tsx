import { Link } from '@tanstack/react-router'
import { Droplet, Image } from 'lucide-react'

// Phone-only shortcuts straight under the hero, as in the mobile design.
// Someone who needs blood is sent to the notice board, where the club's phone
// number will be shown: the club connects them with a donor (CLAUDE.md
// section 3), the site never lists donors.
export function QuickActions() {
  return (
    <section className="grid grid-cols-2 gap-3 px-5 pt-[18px] pb-1.5 md:hidden">
      <Link
        to="/"
        hash="notice"
        className="flex min-h-11 flex-col gap-1.5 rounded-[9px] border border-line bg-card p-3.5"
      >
        <Droplet
          className="size-[22px] text-blood"
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <span className="font-heading text-base font-semibold text-ink">
          রক্ত লাগবে?
        </span>
        <span className="text-sm leading-normal text-subtle">
          ক্লাবের সাথে যোগাযোগ
        </span>
      </Link>
      <Link
        to="/"
        hash="gallery"
        className="flex min-h-11 flex-col gap-1.5 rounded-[9px] border border-line bg-card p-3.5"
      >
        <Image
          className="size-[22px] text-primary"
          strokeWidth={1.7}
          aria-hidden="true"
        />
        <span className="font-heading text-base font-semibold text-ink">
          কাজের ছবি
        </span>
        <span className="text-sm leading-normal text-subtle">
          পুরো গ্যালারি দেখুন
        </span>
      </Link>
    </section>
  )
}
