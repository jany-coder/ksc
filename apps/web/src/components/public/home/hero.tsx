import { Link } from '@tanstack/react-router'
import { ArrowRight, MapPin } from 'lucide-react'

import { imageUrl } from '../../../lib/image-limits.ts'
import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { buttonVariants } from '../../ui/button.tsx'
import { cn } from '../../../lib/utils.ts'

/** A photo for the background: the first photo picked for the homepage. */
export type HeroPhoto = { id: string; width: number; height: number }

// Frosted glass: a see-through white wash, a hairline white edge and a strong
// blur of whatever is behind it. It only reads as glass when there is a photo
// behind to blur, which is why the hero has one.
const glass =
  'border border-white/20 bg-white/10 backdrop-blur-xl backdrop-saturate-150'

export function Hero({ photo }: { photo: HeroPhoto | null }) {
  const t = useT()
  const localeParams = useLocaleParams()

  return (
    <section className="relative isolate overflow-hidden bg-brand-deep text-white">
      {photo && (
        // A phone gets the small copy (the photo sits under a dark layer, so
        // detail is lost anyway and the page stays light on slow connections);
        // wider screens get the large one.
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={imageUrl(photo.id, 'full')}
          />
          <img
            src={imageUrl(photo.id, 'thumb')}
            alt=""
            width={photo.width}
            height={photo.height}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 -z-20 size-full object-cover"
          />
        </picture>
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
          <p className="mb-8 max-w-[52ch] text-[17px] leading-relaxed text-mint-soft md:mb-10 md:text-[21px] md:leading-[1.65]">
            {t('hero.leadShort')}
          </p>
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

        {/* The glass card: the founding year (a fact the club gave us) and
            who the club is. Member, donor and activity counts are left out on
            purpose (CLAUDE.md sections 3 and 8). */}
        <div
          className={cn(
            glass,
            'hero-fade min-w-0 rounded-3xl p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8',
          )}
        >
          <dl className="mb-5 flex items-baseline gap-3 border-b border-white/15 pb-5">
            <dd className="font-heading text-[44px] leading-none font-bold md:text-[52px]">
              {t('hero.statYearValue')}
            </dd>
            <dt className="text-[15px] text-mint-soft">
              {t('hero.statYearLabel')}
            </dt>
          </dl>
          <div className="flex flex-col gap-4 text-base leading-[1.75] text-mint-soft md:text-[17px]">
            <p>{t('hero.body1')}</p>
            <p className="hidden md:block">{t('hero.body2')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
