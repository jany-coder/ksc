import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { listPublicImagesFn } from '../../lib/images.functions.ts'
import { imageUrl } from '../../lib/image-limits.ts'
import { useNumber, useT } from '../../lib/i18n/index.tsx'
import { tFor } from '../../lib/i18n/messages.ts'

export const Route = createFileRoute('/{-$locale}/gallery')({
  head: ({ params }) => {
    const t = tFor(params.locale === 'en' ? 'en' : 'bn')
    return {
      meta: [
        { title: t('gallery.pageTitle') },
        { name: 'description', content: t('gallery.description') },
      ],
    }
  },
  loader: () => listPublicImagesFn({ data: { limit: 100 } }),
  component: GalleryPage,
})

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white'

function GalleryPage() {
  const images = Route.useLoaderData()
  const t = useT()
  const number = useNumber()
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

      {images.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] gap-4 p-0">
          {images.map((image, index) => (
            <li key={image.id}>
              {/* A real button: keyboard and screen-reader users can open it. */}
              <button
                type="button"
                onClick={() => setOpen(index)}
                aria-label={t('gallery.openPhoto', { n: number(index + 1) })}
                className="zoom block w-full cursor-zoom-in overflow-hidden rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <img
                  src={imageUrl(image.id, 'thumb')}
                  width={image.width}
                  height={image.height}
                  loading="lazy"
                  alt=""
                  className="aspect-[4/3] w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-[17px] text-copy">{t('gallery.empty')}</p>
      )}

      {open !== null && (
        <Lightbox
          ids={images.map((image) => image.id)}
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
  ids,
  index,
  onChange,
  onClose,
}: {
  ids: string[]
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

  const last = ids.length - 1
  const go = (to: number) => onChange(Math.min(last, Math.max(0, to)))
  const id = ids[index]

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
        {id && (
          <img
            src={imageUrl(id, 'full')}
            alt=""
            className="max-h-full max-w-full rounded object-contain"
          />
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
