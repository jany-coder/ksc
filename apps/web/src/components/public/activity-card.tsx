import { useState } from 'react'

import { formatDate } from '../../lib/datetime.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'

export type ActivityCardData = {
  id: string
  title: string
  description: string
  eventDate: string | null
  location: string
  thumbUrl?: string
  fullUrl?: string
}

// Past this many characters the description is folded to four lines, with a
// "see more" button to open it in place. Counted by code point, so Bengali
// letters count as one each.
const FOLD_AFTER_CHARS = 180

/**
 * One activity: photo, date, title and description. Used on the home page and
 * in the archive, so both look the same.
 */
export function ActivityCard({ item }: { item: ActivityCardData }) {
  const t = useT()
  const lang = useLang()
  const [open, setOpen] = useState(false)
  const long = Array.from(item.description).length > FOLD_AFTER_CHARS
  const textId = `activity-${item.id}-text`

  return (
    <article className="lift flex flex-col overflow-hidden rounded-[10px] border border-line bg-card">
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
          {item.title}
        </h3>
        {item.description && (
          <>
            <p
              id={textId}
              className={`text-base leading-[1.75] whitespace-pre-line text-copy ${
                long && !open ? 'line-clamp-4' : ''
              }`}
            >
              {item.description}
            </p>
            {long && (
              <button
                type="button"
                aria-expanded={open}
                aria-controls={textId}
                onClick={() => setOpen((v) => !v)}
                className="self-start text-[15px] font-semibold text-primary underline-offset-2 hover:underline"
              >
                {open ? t('activities.seeLess') : t('activities.seeMore')}
              </button>
            )}
          </>
        )}
      </div>
    </article>
  )
}
