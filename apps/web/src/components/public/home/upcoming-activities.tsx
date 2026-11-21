import { Link } from '@tanstack/react-router'

import { formatEventWhen } from '../../../lib/datetime.ts'
import { useLang, useLocaleParams, useT } from '../../../lib/i18n/index.tsx'

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
        <div className="mb-9 md:mb-11">
          <h2 className="mb-2.5 text-[28px] font-bold text-brand-deep md:text-[40px]">
            {t('upcoming.title')}
          </h2>
          <p className="text-[17px] text-copy md:text-[19px]">
            {t('upcoming.lead')}
          </p>
        </div>

        {items.length === 0 ? (
          <p className="rounded-[10px] border border-line bg-card px-6 py-10 text-center text-[17px] text-copy">
            {t('upcoming.none')}
          </p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-6">
            {items.map((item) => (
              <article
                key={item.id}
                // relative: the title link's ::after covers the whole card.
                className="lift relative flex flex-col overflow-hidden rounded-[10px] border border-line bg-card"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-[170px] w-full object-cover"
                  />
                ) : (
                  <div className="flex h-[170px] items-center justify-center border-b border-[#dce3dd] bg-[#e8ede9] p-3 text-center text-sm text-subtle">
                    {t('upcoming.imagePlaceholder')}
                  </div>
                )}
                <div className="flex grow flex-col gap-3 px-[26px] pt-[26px] pb-7">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="rounded-[5px] bg-[#e3f0e9] px-[11px] py-[5px] text-sm font-semibold text-brand-deep">
                      {formatEventWhen(
                        item.eventDate,
                        item.eventTime?.slice(0, 5) ?? null,
                        lang,
                      )}
                    </span>
                    {item.location && (
                      <span className="text-[15px] text-subtle">
                        {item.location}
                      </span>
                    )}
                  </div>
                  <h3 className="text-[23px] font-semibold text-ink">
                    <Link
                      to="/{-$locale}/activities/$slug"
                      params={{ ...localeParams, slug: item.slug }}
                      className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none after:focus-visible:rounded-[10px] after:focus-visible:outline-2 after:focus-visible:outline-offset-2 after:focus-visible:outline-primary"
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
                    className="mt-auto pt-1 text-[15px] font-semibold text-primary"
                  >
                    {t('activities.details')} →
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
