import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarClock, Droplet, Image, MapPin } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { cn } from '../../../lib/utils.ts'
import { scrollToSameSection } from '../same-section.ts'
import { bloodTile, card, iconTile } from '../styles.ts'
import type { UpcomingActivity } from './upcoming-activities.tsx'

// Straight under the hero, a row of cards that rise a little over its bottom
// edge: the next activity with a countdown (only when one is coming), and two
// shortcuts, to the club's contact details for someone who needs blood (the
// club connects them with a donor, CLAUDE.md section 3) and to the photos.

export function Highlights({ upcoming }: { upcoming: UpcomingActivity[] }) {
  // Soonest first (the list itself puts featured ones first).
  const next = upcoming
    .filter((item) => item.eventDate)
    .sort((a, b) =>
      `${a.eventDate} ${a.eventTime ?? ''}`.localeCompare(
        `${b.eventDate} ${b.eventTime ?? ''}`,
      ),
    )[0]

  return (
    <section className="relative z-10 pt-6 md:-mt-12 md:pt-0">
      <div
        className={cn(
          'mx-auto grid w-full max-w-[1180px] grid-cols-2 gap-3 px-5 md:gap-5 md:px-8',
          next && 'lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]',
        )}
      >
        {next && <NextActivity item={next} />}
        <Shortcut
          hash="contact"
          icon={Droplet}
          blood
          title="quick.bloodTitle"
          text="quick.bloodText"
        />
        <Shortcut
          hash="gallery"
          icon={Image}
          title="quick.photosTitle"
          text="quick.photosText"
        />
      </div>
    </section>
  )
}

/** A card that jumps to a section of the home page. */
function Shortcut({
  hash,
  icon: Icon,
  blood = false,
  title,
  text,
}: {
  hash: string
  icon: LucideIcon
  blood?: boolean
  title: MessageKey
  text: MessageKey
}) {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <Link
      to="/{-$locale}"
      params={localeParams}
      hash={hash}
      onClick={scrollToSameSection}
      className={cn(
        card,
        'lift group flex min-h-11 flex-col gap-3 p-4 shadow-lift sm:flex-row sm:items-center sm:gap-4 md:p-5',
      )}
    >
      {/* Red for the blood shortcut only (CLAUDE.md section 8). */}
      <span className={cn(blood ? bloodTile : iconTile, 'size-11 md:size-12')}>
        <Icon aria-hidden="true" className="size-[22px]" strokeWidth={1.8} />
      </span>
      <span className="flex min-w-0 grow flex-col gap-0.5">
        <span className="font-heading text-[17px] leading-snug font-semibold text-ink md:text-lg">
          {t(title)}
        </span>
        <span className="text-sm leading-snug text-subtle md:text-[15px]">
          {t(text)}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="hidden size-5 shrink-0 text-primary transition-transform group-hover:translate-x-1 sm:block rtl:rotate-180"
      />
    </Link>
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
    // Full width above the two shortcuts until the screen is wide enough
    // for all three in a row. relative: the title link's ::after covers it.
    <article
      className={cn(
        card,
        'lift relative col-span-2 flex overflow-hidden shadow-lift lg:col-span-1',
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
