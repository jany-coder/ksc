import { Link } from '@tanstack/react-router'
import { ArrowRight, Images } from 'lucide-react'

import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'
import { cn } from '../../../lib/utils.ts'
import { SectionHeading } from '../section-heading.tsx'

// A taste of the gallery, on the dark section. Photos come in as props; until
// real ones are uploaded, six placeholder tiles keep the grid. The link to the
// full gallery shows only once there are photos to see.
export type GalleryPhoto = {
  id: string
  thumbUrl: string
  srcSet?: string | undefined
  caption?: string | null
}

// The "bento" layout for six photos: one large, one tall, one wide and three
// small, with the "See all" tile in the last corner. Wide screens: four
// columns, three rows. A phone: the large one across the top, then pairs.
// [classes, `sizes` for the image]
const BENTO: [string, string][] = [
  ['col-span-2 row-span-2', '(min-width: 1024px) 560px, 100vw'],
  ['', '(min-width: 1024px) 280px, 50vw'],
  ['lg:row-span-2', '(min-width: 1024px) 280px, 50vw'],
  ['', '(min-width: 1024px) 280px, 50vw'],
  ['lg:col-span-2', '(min-width: 1024px) 560px, 50vw'],
  ['', '(min-width: 1024px) 280px, 50vw'],
]

const PLACEHOLDERS: MessageKey[] = [
  'teaser.p1',
  'teaser.p2',
  'teaser.p3',
  'teaser.p4',
  'teaser.p5',
  'teaser.p6',
]

export function GalleryTeaser({ photos = [] }: { photos?: GalleryPhoto[] }) {
  const t = useT()
  const number = useNumber()
  const localeParams = useLocaleParams()

  return (
    <section
      id="gallery"
      className="scroll-mt-4 md:scroll-mt-16 bg-brand-deep py-14 md:py-[92px]"
    >
      <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
        <SectionHeading
          tone="dark"
          title={t('teaser.title')}
          subtitle={t('teaser.lead')}
        />
        {photos.length >= BENTO.length ? (
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3 md:auto-rows-[190px] md:gap-4 lg:grid-cols-4">
            {photos.slice(0, BENTO.length).map((photo, i) => (
              <Link
                key={photo.id}
                to="/{-$locale}/gallery"
                params={localeParams}
                className={cn(
                  'zoom group relative overflow-hidden rounded-2xl ring-1 ring-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
                  BENTO[i]![0],
                )}
              >
                <img
                  src={photo.thumbUrl}
                  srcSet={photo.srcSet}
                  sizes={BENTO[i]![1]}
                  alt={photo.caption || t('teaser.photoAlt')}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                />
                {photo.caption && (
                  // The caption on a see-through glass badge, always shown;
                  // one line on the small photos, up to two on the large one.
                  <span
                    aria-hidden="true"
                    className="absolute start-2.5 bottom-2.5 max-w-[calc(100%-1.25rem)] rounded-xl border border-white/20 bg-black/40 px-3 py-1.5 text-[13px] leading-snug font-medium text-white backdrop-blur-md md:start-3 md:bottom-3 md:text-sm"
                  >
                    <span
                      className={cn(
                        'block',
                        i === 0 ? 'line-clamp-2' : 'truncate',
                      )}
                    >
                      {photo.caption}
                    </span>
                  </span>
                )}
              </Link>
            ))}
            <SeeAllTile />
          </div>
        ) : photos.length > 0 ? (
          // Fewer than six: an even grid, with the "See all" tile at the end.
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {photos.map((photo) => (
              <Link
                key={photo.id}
                to="/{-$locale}/gallery"
                params={localeParams}
                className="zoom overflow-hidden rounded-2xl ring-1 ring-white/10"
              >
                <img
                  src={photo.thumbUrl}
                  srcSet={photo.srcSet}
                  sizes="(min-width: 768px) 300px, 100vw"
                  alt={photo.caption || t('teaser.photoAlt')}
                  loading="lazy"
                  className="h-[150px] w-full object-cover md:h-[260px]"
                />
              </Link>
            ))}
            <SeeAllTile />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
            {PLACEHOLDERS.map((label, i) => (
              <div
                key={label}
                className="flex h-[150px] items-center justify-center rounded-2xl border border-mint-line bg-[#164a35] p-3 text-center text-sm text-mint-muted md:h-[260px]"
              >
                {t('teaser.placeholder', {
                  n: number(i + 1),
                  label: t(label),
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

/** The way to the full gallery, as one more glass tile in the grid. */
function SeeAllTile() {
  const t = useT()
  const localeParams = useLocaleParams()
  return (
    <Link
      to="/{-$locale}/gallery"
      params={localeParams}
      className="group flex min-h-[150px] flex-col justify-between rounded-2xl border border-white/15 bg-white/[0.07] p-4 text-white backdrop-blur-xl transition-colors hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:p-5"
    >
      <span className="flex size-11 items-center justify-center rounded-xl bg-white/10 text-mint">
        <Images aria-hidden="true" className="size-[22px]" />
      </span>
      <span className="flex items-center justify-between gap-2 font-heading text-lg leading-snug font-semibold md:text-xl">
        {t('teaser.seeAll')}
        <ArrowRight
          aria-hidden="true"
          className="size-5 shrink-0 transition-transform group-hover:translate-x-1 rtl:rotate-180"
        />
      </span>
    </Link>
  )
}
