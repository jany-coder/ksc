import { Link } from '@tanstack/react-router'
import { ArrowRight, Droplet, HeartHandshake } from 'lucide-react'

import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { cn } from '../../../lib/utils.ts'
import { buttonVariants } from '../../ui/button.tsx'
import { ActivityCard } from '../activity-card.tsx'
import type { ActivityCardData } from '../activity-card.tsx'
import { SectionHeading } from '../section-heading.tsx'
import { bloodTile, bodyText, card } from '../styles.ts'

// "Our activities": the newest few of the club's past activities, as cards,
// straight from the database (admins add them under Activities). The whole
// record is on the archive page. Upcoming ones have their own section below.
export function Activities({ items }: { items: ActivityCardData[] }) {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <section
      id="activities"
      className="scroll-mt-4 py-14 md:scroll-mt-16 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <SectionHeading
          title={t('activities.title')}
          subtitle={t('activities.subtitle')}
        >
          <p className={bodyText}>{t('activities.p1')}</p>
          <p className={bodyText}>{t('activities.p2')}</p>
        </SectionHeading>

        {items.length === 0 ? (
          <p
            className={cn(card, 'px-6 py-10 text-center text-[17px] text-copy')}
          >
            {t('activities.empty')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-5 md:gap-6">
              {items.map((item) => (
                <ActivityCard key={item.id} item={item} />
              ))}
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                to="/{-$locale}/activities"
                params={localeParams}
                className={buttonVariants({
                  size: 'lg',
                  variant: 'outline',
                  className:
                    'h-12 gap-2 rounded-full px-7 text-[17px] shadow-card',
                })}
              >
                {t('activities.seeAll')}
                <ArrowRight
                  aria-hidden="true"
                  className="size-[18px] rtl:rotate-180"
                />
              </Link>
            </div>
          </>
        )}

        {/* Humanitarian work and blood donation: the lead and the blood text
            on one side, the club's belief on the other. */}
        <div className={cn(card, 'mt-14 overflow-hidden md:mt-20')}>
          <div className="grid lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
            <div className="p-6 md:p-10">
              <div className="mb-4 flex items-center gap-3">
                <span className={bloodTile}>
                  <HeartHandshake
                    className="size-6"
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />
                </span>
                <h3 className="text-2xl leading-snug font-bold text-brand-deep md:text-[30px]">
                  {t('humanitarian.title')}
                </h3>
              </div>
              <p className="mb-7 max-w-[68ch] text-[17px] leading-[1.8] text-copy">
                {t('humanitarian.lead')}
              </p>
              <h4 className="mb-2 flex items-center gap-2 text-[21px] font-semibold text-ink md:text-[23px]">
                <Droplet
                  aria-hidden="true"
                  className="size-5 text-blood"
                  strokeWidth={2}
                />
                {t('humanitarian.bloodTitle')}
              </h4>
              <p className="max-w-[68ch] text-[17px] leading-[1.75] text-copy">
                {t('humanitarian.bloodText')}
              </p>
            </div>
            <div className="border-t border-line bg-accent p-6 md:p-10 lg:border-t-0 lg:border-s">
              <h4 className="mb-3 text-[21px] font-semibold text-brand-deep">
                {t('humanitarian.beliefTitle')}
              </h4>
              <p className="mb-4 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800">
                {t('humanitarian.belief1')}
              </p>
              <p className="max-w-[68ch] border-s-2 border-primary ps-4 text-[17px] leading-[1.8] font-semibold text-brand-deep">
                {t('humanitarian.belief2')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
