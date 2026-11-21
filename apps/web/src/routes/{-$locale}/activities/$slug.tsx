import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import { Lightbox } from '../../../components/public/lightbox.tsx'
import { getPublicActivityFn } from '../../../lib/activities.functions.ts'
import { categoryName } from '../../../lib/activity-category.ts'
import { formatEventWhen } from '../../../lib/datetime.ts'
import { imageSrcSet, imageUrl } from '../../../lib/image-limits.ts'
import { alternateLinks } from '../../../lib/i18n/hreflang.ts'
import {
  useLang,
  useLocaleParams,
  useNumber,
  useT,
} from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'

// One activity's own page: the full text and every photo filed under it.
export const Route = createFileRoute('/{-$locale}/activities/$slug')({
  loader: async ({ params }) => {
    const result = await getPublicActivityFn({ data: { slug: params.slug } })
    // A draft or a wrong address: the same "not found" for both.
    if (!result.activity) throw notFound()
    return { activity: result.activity, origin: result.origin }
  },
  // head comes after loader: it reads the loader's data, and TypeScript reads
  // these options in order.
  head: ({ params, loaderData }) => {
    const t = tFor(params.locale === 'en' ? 'en' : 'bn')
    if (!loaderData)
      return { meta: [{ title: t('activityPage.notFoundTitle') }] }
    const { activity, origin } = loaderData
    const path = `/activities/${activity.slug}`
    const pageUrl = `${origin}${params.locale === 'en' ? '/en' : ''}${path}`
    const summary = shorten(activity.description, 160)
    const title = t('activityPage.pageTitle', { title: activity.title })
    // Open Graph tags: what Facebook and WhatsApp show when the link is shared.
    return {
      links: alternateLinks(path),
      meta: [
        { title },
        ...(summary ? [{ name: 'description', content: summary }] : []),
        { property: 'og:type', content: 'article' },
        { property: 'og:title', content: activity.title },
        ...(summary ? [{ property: 'og:description', content: summary }] : []),
        { property: 'og:url', content: pageUrl },
        ...(activity.hero
          ? [
              {
                property: 'og:image',
                content: `${origin}${imageUrl(activity.hero.id, 'full')}`,
              },
              { name: 'twitter:card', content: 'summary_large_image' },
            ]
          : []),
      ],
    }
  },
  notFoundComponent: ActivityNotFound,
  component: ActivityPage,
})

/** Cut to `max` characters (by code point, so no Bengali letter is split). */
function shorten(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  const chars = Array.from(flat)
  return chars.length <= max
    ? flat
    : `${chars.slice(0, max).join('').trimEnd()}…`
}

/** Blank lines in the description start a new paragraph. */
function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
}

function BackLink() {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <Link
      to="/{-$locale}/activities"
      params={localeParams}
      className="mb-8 inline-flex min-h-11 items-center gap-2 text-[17px] font-semibold text-primary hover:underline"
    >
      <ArrowLeft aria-hidden="true" className="size-5" />
      {t('activityPage.back')}
    </Link>
  )
}

function ActivityNotFound() {
  const t = useT()
  return (
    <main className="mx-auto w-full max-w-[860px] px-5 py-12 md:px-8 md:py-16">
      <BackLink />
      <h1 className="mb-3 text-[28px] font-bold text-brand-deep md:text-[36px]">
        {t('activityPage.notFoundTitle')}
      </h1>
      <p className="text-[17px] leading-[1.7] text-copy md:text-[19px]">
        {t('activityPage.notFound')}
      </p>
    </main>
  )
}

function ActivityPage() {
  const { activity } = Route.useLoaderData()
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  // Index of the photo shown large, or null when the lightbox is closed.
  const [open, setOpen] = useState<number | null>(null)
  const hero = activity.hero

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-8 md:py-16">
      <BackLink />

      <article>
        {hero && (
          <img
            src={imageUrl(hero.id, 'full')}
            width={hero.width}
            height={hero.height}
            alt={hero.caption ?? activity.title}
            className="mb-8 max-h-[560px] w-full rounded-[10px] bg-panel object-cover"
          />
        )}

        <div className="max-w-[760px]">
          {activity.category && (
            <p className="mb-2 text-[15px] font-semibold text-primary">
              {categoryName(activity.category, lang)}
            </p>
          )}
          <h1 className="mb-3 text-[28px] leading-tight font-bold text-brand-deep md:text-[40px]">
            {activity.title}
          </h1>
          <p className="mb-8 text-[17px] text-copy md:text-[19px]">
            {formatEventWhen(activity.eventDate, activity.eventTime, lang)}
            {activity.location && ` · ${activity.location}`}
          </p>

          {paragraphs(activity.description).map((text, i) => (
            <p
              key={i}
              className="mb-5 text-[17px] leading-[1.8] whitespace-pre-line text-copy md:text-[19px]"
            >
              {text}
            </p>
          ))}
        </div>

        {activity.photos.length > 0 && (
          <section aria-labelledby="activity-photos" className="mt-12">
            <h2
              id="activity-photos"
              className="mb-5 text-[22px] font-bold text-brand-deep md:text-[28px]"
            >
              {t('activityPage.photos', { n: number(activity.photos.length) })}
            </h2>
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-3 md:gap-4">
              {activity.photos.map((photo, index) => (
                <li key={photo.id}>
                  {/* A real button: keyboard and screen-reader users can open it. */}
                  <button
                    type="button"
                    onClick={() => setOpen(index)}
                    aria-label={t('gallery.openPhoto', {
                      n: number(index + 1),
                    })}
                    className="zoom block w-full cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <img
                      src={imageUrl(photo.id, 'thumb')}
                      srcSet={imageSrcSet(photo.id, photo.width)}
                      sizes="(min-width: 768px) 300px, 100vw"
                      width={photo.width}
                      height={photo.height}
                      loading="lazy"
                      alt={photo.caption ?? ''}
                      className="aspect-[4/3] w-full object-cover"
                    />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>

      {open !== null && (
        <Lightbox
          photos={activity.photos}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  )
}
