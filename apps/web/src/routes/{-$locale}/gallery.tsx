import { Link, createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { formatDate, formatYear } from '../../lib/datetime.ts'
import {
  groupPhotos,
  publicGallerySearchSchema,
} from '../../lib/gallery-filter.ts'
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

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white'

const yearLink =
  'inline-flex min-h-11 items-center rounded-full border px-5 text-[17px] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'

function GalleryPage() {
  const { photos: images, years } = Route.useLoaderData()
  const { year } = Route.useSearch()
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
        <div className="flex flex-col gap-12">
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`group-${group.key}`}>
              <h2
                id={`group-${group.key}`}
                className="mb-1 text-[22px] font-bold text-brand-deep md:text-[28px]"
              >
                {group.title ?? t('gallery.otherPhotos')}
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

// A big photo in the browser's own <dialog>: Esc closes it and focus stays
// inside while it is open, without hand-written code for either.
function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: { id: string; caption: string | null }[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}) {
  const t = useT()
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
  }, [])

  const last = photos.length - 1
  const go = (to: number) => onChange(Math.min(last, Math.max(0, to)))
  const photo = photos[index]

  return (
    <dialog
      ref={dialog}
      aria-label={t('gallery.bigPhoto')}
      onClose={onClose}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1)
        if (e.key === 'ArrowRight') go(index + 1)
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) e.currentTarget.close()
      }}
      className="m-auto h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-black/85"
    >
      <div className="relative flex h-full w-full items-center justify-center p-4 md:p-10">
        {photo && (
          <figure className="flex max-h-full max-w-full flex-col items-center gap-3">
            <img
              src={imageUrl(photo.id, 'full')}
              alt={photo.caption ?? ''}
              className="min-h-0 max-w-full rounded object-contain"
            />
            {photo.caption && (
              <figcaption className="max-w-[60ch] text-center text-base text-white">
                {photo.caption}
              </figcaption>
            )}
          </figure>
        )}
        <button
          type="button"
          aria-label={t('gallery.close')}
          onClick={() => dialog.current?.close()}
          className={`${iconButton} absolute end-4 top-4`}
        >
          <X aria-hidden="true" />
        </button>
        {index > 0 && (
          <button
            type="button"
            aria-label={t('gallery.prev')}
            onClick={() => go(index - 1)}
            className={`${iconButton} absolute start-4 top-1/2 -translate-y-1/2`}
          >
            <ChevronLeft aria-hidden="true" />
          </button>
        )}
        {index < last && (
          <button
            type="button"
            aria-label={t('gallery.next')}
            onClick={() => go(index + 1)}
            className={`${iconButton} absolute end-4 top-1/2 -translate-y-1/2`}
          >
            <ChevronRight aria-hidden="true" />
          </button>
        )}
      </div>
    </dialog>
  )
}
