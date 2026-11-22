import { Link } from '@tanstack/react-router'
import { CalendarClock, MapPin } from 'lucide-react'

import {
  daysBetween,
  formatEventWhen,
  todayInDhaka,
} from '../../../lib/datetime.ts'
import {
  useLang,
  useLocaleParams,
  useNumber,
  useT,
} from '../../../lib/i18n/index.tsx'
import { cn } from '../../../lib/utils.ts'
import { card } from '../styles.ts'
import type { UpcomingActivity } from './upcoming-activities.tsx'

// Straight under the hero, rising a little over its bottom edge: the next
// activity with a countdown, only when one is coming.

export function Highlights({ upcoming }: { upcoming: UpcomingActivity[] }) {
  // Nothing coming up: nothing to show here.
  // Soonest first (the list itself puts featured ones first).
  const next = upcoming
    .filter((item) => item.eventDate)
    .sort((a, b) =>
      `${a.eventDate} ${a.eventTime ?? ''}`.localeCompare(
        `${b.eventDate} ${b.eventTime ?? ''}`,
      ),
    )[0]
  if (!next) return null

  return (
    <section className="relative z-10 pt-6 md:-mt-12 md:pt-0">
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <NextActivity item={next} />
      </div>
    </section>
  )
}

function NextActivity({ item }: { item: UpcomingActivity }) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const localeParams = useLocaleParams()
  const days = daysBetween(todayInDhaka(), item.eventDate!)
  const countdown =
    days <= 0
      ? t('next.today')
      : days === 1
        ? t('next.tomorrow')
        : t('next.daysLeft', { n: number(days) })

  return (
    // relative: the title link's ::after covers the whole card.
    <article
      className={cn(
        card,
        'lift relative flex overflow-hidden shadow-lift md:max-w-[620px]',
      )}
    >
      {/* The countdown, on the brand's deep green. */}
      <div className="flex w-[104px] shrink-0 flex-col items-center justify-center gap-1 bg-brand-deep px-3 py-4 text-center text-white md:w-[120px]">
        <CalendarClock aria-hidden="true" className="size-5 text-mint" />
        <span className="font-heading text-[19px] leading-tight font-bold md:text-[21px]">
          {countdown}
        </span>
      </div>
      <div className="flex min-w-0 grow flex-col justify-center gap-1 px-4 py-3.5 md:px-5">
        <p className="m-0 text-[13px] font-semibold tracking-wide text-primary">
          {t('next.label')}
        </p>
        <h2 className="truncate text-[17px] leading-snug font-semibold text-ink md:text-lg">
          <Link
            to="/{-$locale}/activities/$slug"
            params={{ ...localeParams, slug: item.slug }}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none after:focus-visible:rounded-2xl after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-primary"
          >
            {item.title}
          </Link>
        </h2>
        <p className="m-0 truncate text-sm text-subtle">
          {formatEventWhen(item.eventDate, item.eventTime, lang)}
          {item.location && (
            <>
              {' · '}
              <MapPin
                aria-hidden="true"
                className="inline size-3.5 align-[-2px]"
              />{' '}
              {item.location}
            </>
          )}
        </p>
      </div>
    </article>
  )
}
