import { Link } from '@tanstack/react-router'

import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// A taste of the gallery, on the dark section. Photos come in as props; until
// real ones are uploaded, six placeholder tiles keep the grid. The link to the
// full gallery shows only once there are photos to see.
export type GalleryPhoto = {
  id: string
  thumbUrl: string
  srcSet?: string | undefined
}

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
        <div className="mb-9 md:mb-11">
          <h2 className="mb-2.5 text-[28px] font-bold text-background md:text-[40px]">
            {t('teaser.title')}
          </h2>
          <p className="text-[17px] text-mint-muted md:text-[19px]">
            {t('teaser.lead')}
          </p>
        </div>
        {/* Fixed column counts (2, then 3) that divide the six photos evenly,
            so no row is left half-empty at any screen width. */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
          {photos.length > 0
            ? photos.map((photo) => (
                <div key={photo.id} className="zoom overflow-hidden rounded-lg">
                  <img
                    src={photo.thumbUrl}
                    srcSet={photo.srcSet}
                    sizes="(min-width: 768px) 300px, 100vw"
                    alt={t('teaser.photoAlt')}
                    loading="lazy"
                    className="h-[150px] w-full object-cover md:h-[260px]"
                  />
                </div>
              ))
            : PLACEHOLDERS.map((label, i) => (
                <div
                  key={label}
                  className="flex h-[150px] md:h-[260px] items-center justify-center rounded-lg border border-mint-line bg-[#164a35] p-3 text-center text-sm text-mint-muted"
                >
                  {t('teaser.placeholder', {
                    n: number(i + 1),
                    label: t(label),
                  })}
                </div>
              ))}
        </div>
        {photos.length > 0 && (
          <Link
            to="/{-$locale}/gallery"
            params={localeParams}
            className="mt-8 inline-block text-[17px] font-semibold text-background underline underline-offset-4 hover:text-mint-muted"
          >
            {t('teaser.seeAll')}
          </Link>
        )}
      </div>
    </section>
  )
}
