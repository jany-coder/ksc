import { Link } from '@tanstack/react-router'
import { ArrowRight, MapPin } from 'lucide-react'

import { imageUrl } from '../../../lib/image-limits.ts'
import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { buttonVariants } from '../../ui/button.tsx'
import { cn } from '../../../lib/utils.ts'

import { HeroFrame } from './hero-frame.tsx'
import { WORK_AREAS } from './what-we-do.tsx'
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
        // Shown clearly: the frame is small enough not to compete with it.
        // A phone gets the small copy, wider screens the large one.
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={imageUrl(background.id, 'full')}
          />
          <img
            src={imageUrl(background.id, 'thumb')}
            alt=""
            width={background.width}
            height={background.height}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 size-full object-cover"
          />
        </picture>
      )}
      {/* With a photo only: a deep green layer over it, light enough for the photo to
          show. On a wide screen it is darkest behind the text (still above
          4.5:1 contrast there) and fades to the right; on a phone the text
          runs the full width, so the layer is even. */}
      {background && (
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 max-md:bg-[rgba(9,38,27,0.78)] md:bg-[linear-gradient(100deg,rgba(9,38,27,0.88)_0%,rgba(9,38,27,0.74)_55%,rgba(9,38,27,0.35)_75%,rgba(9,38,27,0.15)_100%)]"
        />
      )}

      <div className="mx-auto grid w-full max-w-[1180px] items-center gap-8 px-5 pt-10 pb-12 md:grid-cols-[minmax(0,1fr)_minmax(0,360px)] md:gap-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14 md:px-8 md:pt-24 md:pb-28">
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

        {/* The photo frame in a glass mount, or, with no photos picked, the
            club's areas of work; under either, the founding year (a fact the
            club gave us). Member, donor and activity counts are left out on
            purpose (CLAUDE.md sections 3 and 8). */}
        <div
          className={cn(
            glass,
            'hero-fade min-w-0 rounded-[26px] bg-[rgba(9,38,27,0.5)] p-2 shadow-[0_24px_60px_rgba(0,0,0,0.35)]',
          )}
        >
          {slides.length > 0 ? <HeroFrame slides={slides} /> : <WorkAreas />}
          <dl
            className={cn(
              'm-0 flex items-baseline gap-3 px-3 pt-3 pb-1.5',
              slides.length === 0 && 'mx-2 border-t border-white/15',
            )}
          >
            <dd className="m-0 font-heading text-[30px] leading-none font-bold md:text-[34px]">
              {t('hero.statYearValue')}
            </dd>
            <dt className="text-[15px] text-mint-soft">
              {t('hero.statYearLabel')}
            </dt>
          </dl>
        </div>
      </div>
    </section>
  )
}

/** In place of the photo frame: the six kinds of work the club names. */
function WorkAreas() {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <div className="px-3 pt-3 pb-4 md:px-4">
      <h2 className="mb-3 font-heading text-lg font-semibold text-mint md:text-xl">
        {t('whatWeDo.title')}
      </h2>
      <ul className="m-0 grid list-none grid-cols-1 gap-2 p-0 min-[460px]:grid-cols-2 md:grid-cols-1">
        {WORK_AREAS.map(({ title, icon: Icon, blood }) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-[15px] leading-snug text-white md:text-base"
          >
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10',
                // Red only for blood, lightened to read on dark green.
                blood ? 'text-[#ff9f98]' : 'text-mint',
              )}
            >
              <Icon aria-hidden="true" className="size-[18px]" />
            </span>
            {t(title)}
          </li>
        ))}
      </ul>
      <Link
        to="/{-$locale}"
        params={localeParams}
        hash="what-we-do"
        className="mt-3 inline-flex min-h-10 items-center gap-1.5 text-[15px] font-semibold text-mint hover:text-white"
      >
        {t('hero.workMore')}
        <ArrowRight aria-hidden="true" className="size-4 rtl:rotate-180" />
      </Link>
    </div>
  )
}
