import { Link } from '@tanstack/react-router'

import { useLocaleParams, useNumber, useT } from '../../../lib/i18n/index.tsx'
import type { MessageKey } from '../../../lib/i18n/messages.ts'

// A taste of the gallery, on the dark section. Photos come in as props; until
// real ones are uploaded, six placeholder tiles keep the grid. The link to the
// full gallery shows only once there are photos to see.
export type GalleryPhoto = {
  id: string
  thumbUrl: string
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
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-4">
          {photos.length > 0
            ? photos.map((photo) => (
                <div key={photo.id} className="zoom overflow-hidden rounded-lg">
                  <img
                    src={photo.thumbUrl}
                    alt={t('teaser.photoAlt')}
                    loading="lazy"
                    className="h-[230px] w-full object-cover"
                  />
                </div>
              ))
            : PLACEHOLDERS.map((label, i) => (
                <div
                  key={label}
                  className="flex h-[230px] items-center justify-center rounded-lg border border-mint-line bg-[#164a35] p-3 text-center text-sm text-mint-muted"
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
