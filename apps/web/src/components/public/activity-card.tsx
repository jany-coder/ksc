import { Link } from '@tanstack/react-router'

import { formatDate } from '../../lib/datetime.ts'
import { useLang, useLocaleParams, useT } from '../../lib/i18n/index.tsx'

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
 */
export function ActivityCard({ item }: { item: ActivityCardData }) {
  const t = useT()
  const lang = useLang()
  const localeParams = useLocaleParams()

  return (
    // h-full: the grid stretches every card in a row to the same height.
    // relative: the title link's ::after stretches over the whole card.
    <article className="lift relative flex h-full flex-col overflow-hidden rounded-[10px] border border-line bg-card">
      {item.thumbUrl ? (
        <img
          src={item.thumbUrl}
          // The 1600px version for screens that need more than 400px.
          srcSet={
            item.fullUrl
              ? `${item.thumbUrl} 400w, ${item.fullUrl} 1600w`
              : undefined
          }
          sizes="(min-width: 768px) 380px, 100vw"
          alt={item.title}
          loading="lazy"
          className="aspect-[4/3] w-full bg-panel object-cover"
        />
      ) : (
        // No photo yet: a quiet panel with the club's logo, not an empty box.
        <div className="flex aspect-[4/3] w-full items-center justify-center bg-accent">
          <img
            src="/logo.png"
            alt=""
            width={92}
            height={74}
            className="h-[74px] w-[92px] object-contain opacity-60"
          />
        </div>
      )}

      <div className="flex grow flex-col gap-3 px-6 pt-6 pb-7">
        {(item.eventDate || item.location) && (
          <div className="flex flex-wrap items-center gap-2.5">
            {item.eventDate && (
              <span className="rounded-[5px] bg-[#e3f0e9] px-[11px] py-[5px] text-sm font-semibold text-brand-deep">
                {formatDate(item.eventDate, lang)}
              </span>
            )}
            {item.location && (
              <span className="text-[15px] text-subtle">{item.location}</span>
            )}
          </div>
        )}
        <h3 className="text-[21px] leading-snug font-semibold text-ink md:text-[23px]">
          {/* One link per card, so a screen reader hears each activity once.
              Its ::after covers the card, so a tap anywhere opens it. */}
          <Link
            to="/{-$locale}/activities/$slug"
            params={{ ...localeParams, slug: item.slug }}
            className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none after:focus-visible:rounded-[10px] after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-primary"
          >
            {item.title}
          </Link>
        </h3>
        {item.description && (
          <p className="line-clamp-4 text-base leading-[1.75] whitespace-pre-line text-copy">
            {item.description}
          </p>
        )}
        <span
          aria-hidden="true"
          className="mt-auto pt-1 text-[15px] font-semibold text-primary"
        >
          {t('activities.details')} →
        </span>
      </div>
    </article>
  )
}
