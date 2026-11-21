import { Link } from '@tanstack/react-router'
import { ArrowRight, MapPin } from 'lucide-react'

import { imageUrl } from '../../../lib/image-limits.ts'
import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { buttonVariants } from '../../ui/button.tsx'
import { cn } from '../../../lib/utils.ts'

import { HeroFrame } from './hero-frame.tsx'
import type { HeroSlide } from './hero-frame.tsx'

/** The hero's photos, picked in the admin gallery (see heroPhotos()). */
export type HeroPhotos = {
  background: HeroSlide | null
  slides: HeroSlide[]
}

const glass =
  'border border-white/20 bg-white/10 backdrop-blur-xl backdrop-saturate-150'

export function Hero({ photos }: { photos: HeroPhotos }) {
  const t = useT()
  const localeParams = useLocaleParams()
  const { background, slides } = photos

  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-white">
      {background && (
        // Softly blurred, so it sets the mood without competing with the sharp
        // photos in the frame. Blurred, the small copy looks the same as the
        // large one on any screen, so the large one is never downloaded.
        <img
          src={imageUrl(background.id, 'thumb')}
          alt=""
          width={background.width}
          height={background.height}
          fetchPriority="high"
          decoding="async"
          className="absolute inset-0 -z-20 size-full scale-110 object-cover blur-[3px]"
        />
      )}
      {/* A deep green layer over the photo: darkest behind the text, so it
          always reads at full contrast, lighter to the right where the
          photo shows through. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(105deg,rgba(9,38,27,0.95)_0%,rgba(9,38,27,0.86)_45%,rgba(9,38,27,0.62)_100%)]"
      />

      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pt-10 pb-12 md:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] md:gap-12 md:px-8 md:pt-24 md:pb-28">
        <div className="hero-rise min-w-0">
          <p
            className={cn(
              glass,
              'mb-5 inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium text-mint-soft md:mb-7 md:text-[15px]',
            )}
          >
            <MapPin aria-hidden="true" className="size-4 shrink-0 text-mint" />
            <span className="truncate md:hidden">
              {t('site.locationShort')}
            </span>
            <span className="hidden truncate md:inline">
              {t('hero.addressLong')}
            </span>
          </p>
          <h1 className="mb-3 text-[36px] leading-[1.3] font-bold text-balance md:text-[64px] md:leading-[1.2]">
            {t('hero.title')}
          </h1>
          <p className="mb-4 font-heading text-xl font-semibold text-mint md:mb-6 md:text-[28px]">
            {t('hero.tagline')}
          </p>
          <p className="mb-5 max-w-[52ch] text-[17px] leading-relaxed text-mint-soft md:text-[21px] md:leading-[1.65]">
            {t('hero.leadShort')}
          </p>
          {/* Who the club is: moved here from the old glass card, whose place
              the photo frame took. */}
          <div className="mb-8 flex max-w-[60ch] flex-col gap-3 border-s-2 border-mint/40 ps-4 text-base leading-[1.75] text-mint-soft/90 md:mb-10 md:text-[17px]">
            <p>{t('hero.body1')}</p>
            <p className="hidden md:block">{t('hero.body2')}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/{-$locale}"
              params={localeParams}
              hash="join"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'group min-h-12 gap-2 rounded-full bg-white px-7 text-[17px] text-brand-deep shadow-[0_8px_24px_rgba(0,0,0,0.25)] hover:bg-white/90',
              )}
            >
              {t('nav.join')}
              <ArrowRight
                aria-hidden="true"
                className="size-[18px] transition-transform group-hover:translate-x-0.5 rtl:rotate-180"
              />
            </Link>
            <Link
              to="/{-$locale}"
              params={localeParams}
              hash="activities"
              className={cn(
                glass,
                'inline-flex min-h-12 items-center justify-center rounded-full px-7 text-[17px] font-semibold text-white hover:bg-white/15',
              )}
            >
              {t('hero.ctaWork')}
            </Link>
          </div>
        </div>

        {/* The photo frame, in a glass mount, with the founding year (a fact
            the club gave us) on it. Member, donor and activity counts are
            left out on purpose (CLAUDE.md sections 3 and 8). */}
        <div
          className={cn(
            glass,
            'hero-fade min-w-0 rounded-[28px] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-2.5',
          )}
        >
          {slides.length > 0 ? (
            <HeroFrame slides={slides}>
              <FoundedBadge />
            </HeroFrame>
          ) : (
            <div className="p-5">
              <FoundedBadge />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function FoundedBadge() {
  const t = useT()
  return (
    <dl className="m-0 flex min-w-0 items-baseline gap-2.5 rounded-2xl border border-white/20 bg-black/30 px-4 py-2.5 backdrop-blur-md">
      <dd className="m-0 font-heading text-[32px] leading-none font-bold md:text-[38px]">
        {t('hero.statYearValue')}
      </dd>
      <dt className="text-sm text-mint-soft">{t('hero.statYearLabel')}</dt>
    </dl>
  )
}
