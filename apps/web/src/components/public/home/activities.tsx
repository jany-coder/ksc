import { Link } from '@tanstack/react-router'
import { HeartHandshake } from 'lucide-react'

import { useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { buttonVariants } from '../../ui/button.tsx'
import { ActivityCard } from '../activity-card.tsx'
import type { ActivityCardData } from '../activity-card.tsx'

// "Our activities": the newest few of the club's past activities, as cards,
// straight from the database (admins add them under Activities). The whole
// record is on the archive page. Upcoming ones have their own section below.
export function Activities({ items }: { items: ActivityCardData[] }) {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <section
      id="activities"
      className="scroll-mt-4 md:scroll-mt-16 py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <h2 className="mb-2 text-[28px] font-bold text-brand-deep md:text-[40px]">
          {t('activities.title')}
        </h2>
        <p className="mb-6 font-heading text-lg font-semibold text-primary md:text-xl">
          {t('activities.subtitle')}
        </p>
        <p className="mb-4 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:text-[19px]">
          {t('activities.p1')}
        </p>
        <p className="mb-10 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800 md:mb-12 md:text-[19px]">
          {t('activities.p2')}
        </p>

        {items.length === 0 ? (
          <p className="rounded-[10px] border border-line bg-card px-6 py-10 text-center text-[17px] text-copy">
            {t('activities.empty')}
          </p>
        ) : (
          <>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] items-start gap-6">
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
                  className: 'h-12 px-7 text-[17px]',
                })}
              >
                {t('activities.seeAll')}
              </Link>
            </div>
          </>
        )}

        <div className="mt-14 rounded-[10px] border border-line bg-card px-6 py-8 md:mt-20 md:px-10 md:py-10">
          <div className="mb-3 flex items-center gap-3">
            <HeartHandshake
              className="size-8 shrink-0 text-blood"
              strokeWidth={1.7}
              aria-hidden="true"
            />
            <h3 className="text-2xl font-bold text-brand-deep md:text-[30px]">
              {t('humanitarian.title')}
            </h3>
          </div>
          <p className="mb-7 max-w-[68ch] text-[17px] leading-[1.8] text-copy">
            {t('humanitarian.lead')}
          </p>
          <h4 className="mb-2 text-[21px] font-semibold text-ink md:text-[23px]">
            {t('humanitarian.bloodTitle')}
          </h4>
          <p className="max-w-[68ch] text-[17px] leading-[1.75] text-copy">
            {t('humanitarian.bloodText')}
          </p>

          <div className="mt-8 border-t border-line pt-7">
            <h4 className="mb-2 text-[21px] font-semibold text-brand-deep">
              {t('humanitarian.beliefTitle')}
            </h4>
            <p className="mb-3 max-w-[68ch] text-[17px] leading-[1.8] text-zinc-800">
              {t('humanitarian.belief1')}
            </p>
            <p className="max-w-[68ch] text-[17px] leading-[1.8] font-semibold text-brand-deep">
              {t('humanitarian.belief2')}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
