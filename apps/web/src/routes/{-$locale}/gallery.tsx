import { Link, createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { Lightbox } from '../../components/public/lightbox.tsx'

import { formatDate, formatYear } from '../../lib/datetime.ts'
import {
  groupPhotos,
  publicGallerySearchSchema,
} from '../../lib/gallery-filter.ts'
import type { PublicGalleryPhoto } from '../../lib/gallery-filter.ts'
import { listPublicGalleryFn } from '../../lib/images.functions.ts'
import { imageUrl } from '../../lib/image-limits.ts'
import {
  useLang,
  useLocaleParams,
  useNumber,
  useT,
} from '../../lib/i18n/index.tsx'
import { alternateLinks } from '../../lib/i18n/hreflang.ts'
import { tFor } from '../../lib/i18n/messages.ts'

export const Route = createFileRoute('/{-$locale}/gallery')({
  // ?year=2025 shows one year's activities; a bad value is simply dropped.
  validateSearch: publicGallerySearchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ deps }) =>
    listPublicGalleryFn({ data: { year: deps.year, offset: 0 } }),
  // After validateSearch and loader: TypeScript reads these options in order,
  // and an untyped head() before them would hide the search type.
  head: ({ params }) => {
    const t = tFor(params.locale === 'en' ? 'en' : 'bn')
    return {
      links: alternateLinks('/gallery'),
      meta: [
        { title: t('gallery.pageTitle') },
        { name: 'description', content: t('gallery.description') },
      ],
    }
  },
  component: GalleryPage,
})

const yearLink =
  'inline-flex min-h-11 items-center rounded-full border px-5 text-[17px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

// Keyed by year: switching year starts again from the first page.
function GalleryPage() {
  const { year } = Route.useSearch()
  return <GalleryBody key={year ?? 'all'} />
}

function GalleryBody() {
  const first = Route.useLoaderData()
  const { year } = Route.useSearch()
  const years = first.years
  // Photos fetched by "Show more", after the first page from the loader.
  const [more, setMore] = useState<PublicGalleryPhoto[]>([])
  const [hasMore, setHasMore] = useState(first.hasMore)
  const [loadingMore, setLoadingMore] = useState(false)
  const [moreError, setMoreError] = useState(false)
  const images = [...first.photos, ...more]

  async function showMore() {
    setLoadingMore(true)
    setMoreError(false)
    try {
      const page = await listPublicGalleryFn({
        data: { year, offset: images.length },
      })
      setMore((list) => [...list, ...page.photos])
      setHasMore(page.hasMore)
    } catch {
      setMoreError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const localeParams = useLocaleParams()
  const groups = groupPhotos(images)
  // Index of the photo shown large, or null when the lightbox is closed.
  const [open, setOpen] = useState<number | null>(null)

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-12 md:px-8 md:py-16">
      <h1 className="mb-3 text-[28px] font-bold text-brand-deep md:text-[40px]">
        {t('gallery.title')}
      </h1>
      <p className="mb-8 text-[17px] leading-[1.7] text-copy md:text-[19px]">
        {t('gallery.lead')}
      </p>

      {/* Years as real links, so each year has its own shareable URL. */}
      {years.length > 0 && (
        <nav aria-label={t('gallery.years')} className="mb-10">
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {[undefined, ...years].map((y) => {
              const current = y === year
              return (
                <li key={y ?? 'all'}>
                  <Link
                    to="/{-$locale}/gallery"
                    params={localeParams}
                    search={y === undefined ? {} : { year: y }}
                    aria-current={current ? 'page' : undefined}
                    className={
                      current
                        ? `${yearLink} border-brand-deep bg-brand-deep text-background`
                        : `${yearLink} border-brand-deep/30 text-brand-deep hover:border-brand-deep`
                    }
                  >
                    {y === undefined
                      ? t('gallery.allYears')
                      : formatYear(y, lang)}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      {groups.length > 0 ? (
        <>
          <div className="flex flex-col gap-12">
            {groups.map((group) => (
              <section key={group.key} aria-labelledby={`group-${group.key}`}>
                <h2
                  id={`group-${group.key}`}
                  className="mb-1 text-[22px] font-bold text-brand-deep md:text-[28px]"
                >
                  {group.title && group.slug ? (
                    <Link
                      to="/{-$locale}/activities/$slug"
                      params={{ ...localeParams, slug: group.slug }}
                      className="hover:underline hover:underline-offset-4"
                    >
                      {group.title}
                    </Link>
                  ) : (
                    t('gallery.otherPhotos')
                  )}
                </h2>
                {group.date && (
                  <p className="mb-4 text-[17px] text-copy">
                    {formatDate(group.date, lang)}
                  </p>
                )}
                <ul
                  className={`m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4 p-0 ${group.date ? '' : 'mt-4'}`}
                >
                  {group.photos.map(({ photo: image, index }) => (
                    <li key={image.id}>
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
                          src={imageUrl(image.id, 'thumb')}
                          width={image.width}
                          height={image.height}
                          loading="lazy"
                          alt={image.caption ?? ''}
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          {hasMore && (
            <div className="mt-10 flex flex-col items-center gap-3">
              <button
                type="button"
                disabled={loadingMore}
                onClick={() => void showMore()}
                className="inline-flex min-h-12 items-center rounded-full bg-brand-deep px-7 text-[17px] font-semibold text-background hover:bg-brand-deep/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
              >
                {loadingMore ? t('gallery.loadingMore') : t('gallery.showMore')}
              </button>
              {moreError && (
                <p role="alert" className="text-[17px] text-copy">
                  {t('gallery.moreError')}
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-[17px] text-copy">
          {year === undefined ? t('gallery.empty') : t('gallery.emptyYear')}
        </p>
      )}

      {open !== null && (
        <Lightbox
          photos={images}
          index={open}
          onChange={setOpen}
          onClose={() => setOpen(null)}
        />
      )}
    </main>
  )
}
