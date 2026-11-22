import { Link, createFileRoute } from '@tanstack/react-router'

import { ActivityCard } from '../../../components/public/activity-card.tsx'
import type { ActivityCardData } from '../../../components/public/activity-card.tsx'
import { listArchiveActivitiesFn } from '../../../lib/activities.functions.ts'
import { alternateLinks } from '../../../lib/i18n/hreflang.ts'
import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
import { originOfMatches, socialMeta } from '../../../lib/social.ts'
import { publicData } from '../../../lib/public-data.ts'

// The archive: every published activity that has already happened, newest
// first, grouped by year.
export const Route = createFileRoute('/{-$locale}/activities/')({
  loader: ({ context: { queryClient } }) =>
    publicData(queryClient, ['archive'], () => listArchiveActivitiesFn()),
  head: ({ params, loaderData, matches }) => {
    const lang = params.locale === 'en' ? 'en' : 'bn'
    const t = tFor(lang)
    // The newest activity that has a photo.
    const photo = loaderData?.find((item) => item.fullUrl)?.fullUrl
    return {
      links: alternateLinks('/activities'),
      meta: [
        { title: t('archive.pageTitle') },
        { name: 'description', content: t('archive.description') },
        ...socialMeta({
          origin: originOfMatches(matches),
          lang,
          path: '/activities',
          title: t('archive.pageTitle'),
          description: t('archive.description'),
          image: photo ? { path: photo } : null,
        }),
      ],
    }
  },
  component: ArchivePage,
})

/** Consecutive runs of the same year. The list is already newest first. */
function byYear(items: ActivityCardData[]) {
  const groups: { year: number | null; items: ActivityCardData[] }[] = []
  for (const item of items) {
    const year = item.eventDate ? Number(item.eventDate.slice(0, 4)) : null
    const last = groups.at(-1)
    if (last && last.year === year) last.items.push(item)
    else groups.push({ year, items: [item] })
  }
  return groups
}

function ArchivePage() {
  const items = Route.useLoaderData()
  const t = useT()
  const number = useNumber()
  const localeParams = useLocaleParams()

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-3 text-[28px] font-bold text-brand-deep md:text-[40px]">
        {t('archive.title')}
      </h1>
      <p className="mb-10 text-[17px] leading-[1.7] text-copy md:text-[19px]">
        {t('archive.lead')}
      </p>

      {items.length === 0 ? (
        <p className="rounded-[10px] border border-line bg-card px-6 py-10 text-center text-[17px] text-copy">
          {t('activities.empty')}
        </p>
      ) : (
        byYear(items).map((group) => (
          <section key={group.year ?? 'none'} className="mb-12 last:mb-0">
            <h2 className="mb-6 border-b border-line pb-3 text-2xl font-bold text-brand-deep md:text-[30px]">
              {group.year === null
                ? t('archive.noDate')
                : t('archive.year', { year: number(group.year) })}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(min(300px,100%),1fr))] gap-6">
              {group.items.map((item) => (
                <ActivityCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        ))
      )}

      <Link
        to="/{-$locale}"
        params={localeParams}
        className="mt-12 inline-block font-semibold text-primary underline-offset-2 hover:underline"
      >
        {t('archive.backHome')}
      </Link>
    </main>
  )
}
