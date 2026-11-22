import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarDays, MapPin } from 'lucide-react'

import { formatDate } from '../../lib/datetime.ts'
import { useLang, useLocaleParams, useT } from '../../lib/i18n/index.tsx'
import { cn } from '../../lib/utils.ts'
import { liftCard, pill } from './styles.ts'

export type ActivityCardData = {
  id: string
  slug: string
  title: string
  description: string
  eventDate: string | null
  location: string
  thumbUrl?: string
  fullUrl?: string
}

/**
 * One activity: photo, date, title and the start of the description. Used on
 * the home page and in the archive, so both look the same. The whole card
 * opens the activity's own page, where the full text and photos are.
 *
 * `featured`: the home page's newest activity, shown large, magazine style.
 * Its photo grows to fill the card, however tall the grid makes it.
 */
export function ActivityCard({
  item,
  featured = false,
}: {
  item: ActivityCardData
  featured?: boolean
}) {
  const t = useT()
  const lang = useLang()
  const localeParams = useLocaleParams()

  return (
    // h-full: the grid stretches every card in a row to the same height.
    // relative: the title link's ::after stretches over the whole card.
    <article
      className={cn(
        liftCard,
        'zoom relative flex h-full flex-col overflow-hidden',
      )}
    >
      {item.thumbUrl ? (
        <div
          className={cn(
            'overflow-hidden',
            featured && 'relative min-h-[240px] grow md:min-h-[340px]',
          )}
        >
          <img
            src={item.thumbUrl}
            // The 1600px version for screens that need more than 400px.
            srcSet={
              item.fullUrl
                ? `${item.thumbUrl} 400w, ${item.fullUrl} 1600w`
                : undefined
            }
            sizes={
              featured
                ? '(min-width: 1024px) 780px, 100vw'
                : '(min-width: 768px) 380px, 100vw'
            }
            alt={item.title}
            loading="lazy"
            className={cn(
              'w-full bg-panel object-cover',
              featured ? 'absolute inset-0 h-full' : 'aspect-[4/3]',
            )}
          />
        </div>
      ) : (
        // No photo yet: a quiet panel with the club's logo, not an empty box.
        <div
          className={cn(
            'flex w-full items-center justify-center bg-accent',
            featured ? 'min-h-[240px] grow md:min-h-[340px]' : 'aspect-[4/3]',
          )}
        >
          <img
            src="/logo.png"
            alt=""
            width={92}
            height={74}
            className="h-[74px] w-[92px] object-contain opacity-60"
          />
        </div>
      )}

      <div
        className={cn(
          'flex flex-col gap-3 px-6 pt-5 pb-6',
          featured ? 'md:px-8 md:pt-6 md:pb-8' : 'grow',
        )}
      >
        {(item.eventDate || item.location) && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {item.eventDate && (
              <span className={pill}>
                <CalendarDays aria-hidden="true" className="size-3.5" />
                {formatDate(item.eventDate, lang)}
              </span>
            )}
            {item.location && (
              <span className="inline-flex items-center gap-1 text-[15px] text-subtle">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                {item.location}
              </span>
            )}
          </div>
        )}
        <h3
          className={cn(
            'leading-snug font-semibold text-ink',
            featured
              ? 'text-[24px] md:text-[32px] md:leading-tight'
              : 'text-[21px] md:text-[23px]',
          )}
        >
          {/* One link per card, so a screen reader hears each activity once.
              Its ::after covers the card, so a tap anywhere opens it. */}
          <Link
            to="/{-$locale}/activities/$slug"
            params={{ ...localeParams, slug: item.slug }}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none after:focus-visible:rounded-2xl after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-primary"
          >
            {item.title}
          </Link>
        </h3>
        {item.description && (
          <p
            className={cn(
              'text-base leading-[1.75] whitespace-pre-line text-copy',
              featured ? 'line-clamp-3 md:text-[17px]' : 'line-clamp-4',
            )}
          >
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
  )
}
