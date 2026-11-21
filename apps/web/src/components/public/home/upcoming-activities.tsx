import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarClock, CalendarDays, MapPin } from 'lucide-react'

import { formatEventWhen } from '../../../lib/datetime.ts'
import { useLang, useLocaleParams, useT } from '../../../lib/i18n/index.tsx'
import { cn } from '../../../lib/utils.ts'
import { SectionHeading } from '../section-heading.tsx'
import { card, iconTile, liftCard, pill } from '../styles.ts'

// "Upcoming activities". The home page passes in the real, published, upcoming
// activities from the database. When there are none, a plain message is shown:
// no invented events and no leftover "[placeholder]" text on a live site.

export type UpcomingActivity = {
  id: string
  slug: string
  title: string
  description: string
  // Plain "YYYY-MM-DD" and "HH:MM:SS" text, formatted here in the reader's language.
  eventDate: string | null
  eventTime: string | null
  location: string
  imageUrl?: string
}

export function UpcomingActivities({ items }: { items: UpcomingActivity[] }) {
  const t = useT()
  const lang = useLang()
  const localeParams = useLocaleParams()
  return (
    <section
      id="upcoming"
      className="scroll-mt-4 md:scroll-mt-16 border-y border-line bg-panel py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <SectionHeading
          title={t('upcoming.title')}
          subtitle={t('upcoming.lead')}
        />

        {items.length === 0 ? (
          <p
            className={cn(
              card,
              'flex flex-col items-center gap-3 px-6 py-10 text-center text-[17px] text-copy',
            )}
          >
            <span className={iconTile}>
              <CalendarClock
                aria-hidden="true"
                className="size-6"
                strokeWidth={1.8}
              />
            </span>
            {t('upcoming.none')}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
            {items.map((item) => (
              <article
                key={item.id}
                // relative: the title link's ::after covers the whole card.
                className={cn(
                  liftCard,
                  'zoom relative flex flex-col overflow-hidden',
                )}
              >
                {item.imageUrl ? (
                  <div className="overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt=""
                      className="h-[180px] w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-[180px] items-center justify-center bg-accent p-3 text-center text-sm text-subtle">
                    {t('upcoming.imagePlaceholder')}
                  </div>
                )}
                <div className="flex grow flex-col gap-3 px-6 pt-5 pb-6">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className={pill}>
                      <CalendarDays aria-hidden="true" className="size-3.5" />
                      {formatEventWhen(
                        item.eventDate,
                        item.eventTime?.slice(0, 5) ?? null,
                        lang,
                      )}
                    </span>
                    {item.location && (
                      <span className="inline-flex items-center gap-1 text-[15px] text-subtle">
                        <MapPin
                          aria-hidden="true"
                          className="size-3.5 shrink-0"
                        />
                        {item.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[21px] leading-snug font-semibold text-ink md:text-[23px]">
                    <Link
                      to="/{-$locale}/activities/$slug"
                      params={{ ...localeParams, slug: item.slug }}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none after:focus-visible:rounded-2xl after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-primary"
                    >
                      {item.title}
                    </Link>
                  </h3>
                  {item.description && (
                    <p className="text-[17px] leading-[1.7] text-copy">
                      {item.description}
                    </p>
                  )}
                  <span
                    aria-hidden="true"
                    className="mt-auto inline-flex items-center gap-1.5 pt-1 text-[15px] font-semibold text-primary"
                  >
                    {t('activities.details')}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
