import { Link } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import { imageUrl } from '../../lib/image-limits.ts'
import { useLocaleParams, useNumber, useT } from '../../lib/i18n/index.tsx'

const iconButton =
  'inline-flex size-11 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 focus-visible:outline-2 focus-visible:outline-white'

// How far a finger must travel sideways to count as a swipe, in pixels.
const SWIPE_PX = 50

export type LightboxPhoto = {
  id: string
  caption: string | null
  // When set, a link under the photo opens its activity's page. Left out on
  // the activity page itself, where the reader already is.
  activitySlug?: string | null
}

/**
 * A big photo in the browser's own <dialog>: Esc closes it and focus stays
 * inside while it is open, without hand-written code for either. Arrow keys,
 * the on-screen buttons and a sideways swipe move between photos. The photos
 * either side are fetched ahead, so the next one is ready on a slow connection.
 */
export function Lightbox({
  photos,
  index,
  onChange,
  onClose,
}: {
  photos: LightboxPhoto[]
  index: number
  onChange: (index: number) => void
  onClose: () => void
}) {
  const t = useT()
  const number = useNumber()
  const localeParams = useLocaleParams()
  const dialog = useRef<HTMLDialogElement>(null)
  // Where a touch began, to tell a swipe from a tap.
  const touchStart = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const el = dialog.current
    if (el && !el.open) el.showModal()
  }, [])

  const last = photos.length - 1
  const go = (to: number) => onChange(Math.min(last, Math.max(0, to)))
  const photo = photos[index]

  // Warm the browser cache with the neighbours. Image objects that are never
  // shown still download, and the <img> below then finds them cached.
  useEffect(() => {
    for (const near of [photos[index - 1], photos[index + 1]]) {
      if (near) new Image().src = imageUrl(near.id, 'full')
    }
  }, [photos, index])

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
      onTouchStart={(e) => {
        const touch = e.touches[0]
        touchStart.current = touch
          ? { x: touch.clientX, y: touch.clientY }
          : null
      }}
      onTouchEnd={(e) => {
        const start = touchStart.current
        const touch = e.changedTouches[0]
        touchStart.current = null
        if (!start || !touch) return
        const dx = touch.clientX - start.x
        const dy = touch.clientY - start.y
        // Mostly sideways and far enough: a swipe. Finger to the left = next.
        if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
          go(dx < 0 ? index + 1 : index - 1)
        }
      }}
      className="m-auto h-dvh max-h-none w-dvw max-w-none bg-transparent p-0 backdrop:bg-black/85"
    >
      <div className="relative flex h-full w-full items-center justify-center p-4 pt-16 md:p-10 md:pt-16">
        {photos.length > 1 && (
          <p
            aria-live="polite"
            className="absolute start-4 top-6 m-0 text-base text-white tabular-nums"
          >
            <span aria-hidden="true">
              {number(index + 1)} / {number(photos.length)}
            </span>
            <span className="sr-only">
              {t('gallery.position', {
                n: number(index + 1),
                total: number(photos.length),
              })}
            </span>
          </p>
        )}
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
            {photo.activitySlug && (
              <Link
                to="/{-$locale}/activities/$slug"
                params={{ ...localeParams, slug: photo.activitySlug }}
                className="text-base font-semibold text-white underline underline-offset-4 hover:text-white/80"
              >
                {t('gallery.aboutActivity')}
              </Link>
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
