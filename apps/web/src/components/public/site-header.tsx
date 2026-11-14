import { Link } from '@tanstack/react-router'

import { useLocaleParams, useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import { buttonVariants } from '../ui/button.tsx'
import { cn } from '../../lib/utils.ts'
import { LangSwitch } from './lang-switch.tsx'

// Section anchors on the home page. They are router links with a hash, so they
// also work from other public pages (/gallery -> /#what-we-do).
const NAV = [
  { key: 'nav.whatWeDo', hash: 'what-we-do' },
  { key: 'nav.upcoming', hash: 'upcoming' },
  { key: 'nav.gallery', hash: 'gallery' },
  { key: 'nav.notice', hash: 'notice' },
  { key: 'nav.about', hash: 'about' },
] as const satisfies readonly { key: MessageKey; hash: string }[]

export function SiteHeader() {
  const t = useT()
  const localeParams = useLocaleParams()

  return (
    <header className="border-b border-line bg-background">
      <div className="mx-auto flex min-h-[60px] w-full max-w-[1180px] flex-wrap items-center gap-5 px-5 py-3 md:min-h-[84px] md:px-8 md:py-3.5">
        <Link
          to="/{-$locale}"
          params={localeParams}
          className="mr-auto flex items-center gap-3"
        >
          <img
            src="/logo.png"
            alt={t('site.logoAlt')}
            width={46}
            height={37}
            className="h-[29px] w-9 object-contain md:h-[37px] md:w-[46px]"
          />
          <span className="flex flex-col">
            <span className="font-heading text-[17px] leading-snug font-bold text-brand-deep md:text-xl">
              {t('site.name')}
            </span>
            <span className="hidden text-[13px] leading-snug text-subtle md:block">
              {t('site.locationShort')}
            </span>
          </span>
        </Link>

        {/* On a phone the bottom tab bar is the navigation. */}
        <nav
          aria-label={t('nav.main')}
          className="hidden flex-wrap items-center gap-[26px] md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.hash}
              to="/{-$locale}"
              params={localeParams}
              hash={item.hash}
              className="text-base font-medium text-zinc-800 hover:text-brand-deep"
            >
              {t(item.key)}
            </Link>
          ))}
          <Link
            to="/{-$locale}"
            params={localeParams}
            hash="join"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'min-h-11 px-5 text-base',
            )}
          >
            {t('nav.join')}
          </Link>
        </nav>

        <LangSwitch />
      </div>
    </header>
  )
}
