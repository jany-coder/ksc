import { Link } from '@tanstack/react-router'

import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { buttonVariants } from '../../ui/button.tsx'
import { cn } from '../../../lib/utils.ts'

export function Hero() {
  const t = useT()
  const localeParams = useLocaleParams()

  return (
    <section className="bg-brand-deep py-7 text-background md:py-24">
      <div className="mx-auto flex w-full max-w-[1180px] flex-wrap items-center gap-14 px-5 md:px-8">
        <div className="hero-rise min-w-0 flex-[999_1_460px]">
          <p className="mb-2.5 text-sm font-medium text-mint md:mb-[18px] md:text-lg">
            <span className="md:hidden">{t('site.locationShort')}</span>
            <span className="hidden md:inline">{t('hero.addressLong')}</span>
          </p>
          <h1 className="mb-3 text-[29px] leading-[1.25] font-bold text-balance md:mb-6 md:text-[60px] md:leading-[1.18]">
            {t('hero.title')}
          </h1>
          <p className="mb-[18px] max-w-[60ch] text-base leading-relaxed text-mint-soft md:mb-9 md:text-[21px] md:leading-[1.7]">
            <span className="md:hidden">{t('hero.leadShort')}</span>
            <span className="hidden md:inline">{t('hero.leadLong')}</span>
          </p>
          <div className="flex flex-wrap gap-3.5">
            <Link
              to="/{-$locale}"
              params={localeParams}
              hash="join"
              className={cn(
                buttonVariants({ size: 'lg' }),
                'min-h-12 w-full bg-background px-[26px] text-[17px] text-brand-deep hover:bg-background/90 md:w-auto',
              )}
            >
              {t('nav.join')}
            </Link>
            <Link
              to="/{-$locale}"
              params={localeParams}
              hash="what-we-do"
              className="hidden min-h-12 items-center justify-center rounded-lg border-[1.5px] border-[#4a6e5c] px-[26px] text-[17px] font-semibold text-background hover:border-mint md:inline-flex"
            >
              {t('hero.ctaWork')}
            </Link>
          </div>
        </div>

        {/* Only facts the club has given us. Member, donor and activity counts
            are left out on purpose (CLAUDE.md sections 3 and 8). */}
        <dl className="hero-fade hidden min-w-0 flex-[1_1_320px] grid-cols-[repeat(auto-fit,minmax(min(140px,100%),1fr))] gap-px border border-mint-line bg-mint-line md:grid">
          <div className="bg-brand-deep px-[22px] py-7">
            <dd className="font-heading text-[40px] leading-tight font-bold text-background">
              {t('hero.statYearValue')}
            </dd>
            <dt className="mt-1 text-[15px] text-mint-muted">
              {t('hero.statYearLabel')}
            </dt>
          </div>
        </dl>
      </div>
    </section>
  )
}
