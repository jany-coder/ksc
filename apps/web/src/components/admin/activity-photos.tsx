import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { useState } from 'react'

import {
  HOME_PHOTO_COUNT,
  imageSrcSet,
  imageUrl,
} from '../../lib/image-limits.ts'
import {
  activityPhotosFn,
  setActivityCoverFn,
} from '../../lib/images.functions.ts'
import { useNumber, useT } from '../../lib/i18n/index.tsx'
import { cn } from '../../lib/utils.ts'
import {
  CaptionField,
  DeletePhotoButton,
  HomeToggle,
} from './photo-controls.tsx'
import { PhotoDropZone, UploadList, usePhotoUpload } from './photo-upload.tsx'

// Under ['images'], so any photo change anywhere refreshes it too.
export const activityPhotosQuery = (activityId: string) =>
  queryOptions({
    queryKey: ['images', 'activity', activityId],
    queryFn: () => activityPhotosFn({ data: { activityId } }),
  })

/**
 * The activity's photos, in the activity editor: add them (drop or pick),
 * choose the cover with the star, caption, show on the homepage, delete.
 * Every change saves at once; the form's Save button is not needed for photos.
 */
export function ActivityPhotos({ activityId }: { activityId: string }) {
  const t = useT()
  const number = useNumber()
  const queryClient = useQueryClient()
  const { data } = useSuspenseQuery(activityPhotosQuery(activityId))
  const { items, busy, upload, retry } = usePhotoUpload(activityId)
  const [error, setError] = useState<string | null>(null)

  const setCover = useMutation({
    mutationFn: (imageId: string) =>
      setActivityCoverFn({ data: { activityId, imageId } }),
    onSuccess: async (result) => {
      setError(result.ok ? null : t('actPhotos.coverError'))
      await queryClient.invalidateQueries({ queryKey: ['images'] })
      await queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: () => setError(t('actPhotos.coverError')),
  })

  // The activity was deleted meanwhile; the page shows its own message.
  if (!data) return null
  const full = data.state === 'full'
  const homeFull = data.homeCount >= HOME_PHOTO_COUNT

  return (
    <section
      aria-labelledby="activity-photos-title"
      className="mt-6 flex flex-col gap-4 rounded-[10px] border border-border bg-card p-5"
    >
      <div>
        <h2 id="activity-photos-title" className="text-[15px] font-semibold">
          {t('actPhotos.title', { n: number(data.photos.length) })}
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t('actPhotos.lead')}
        </p>
      </div>

      <PhotoDropZone onFiles={upload} disabled={busy || full} busy={busy} />
      {full && (
        <p role="alert" className="text-sm text-red-700">
          {t('gal.full')}
        </p>
      )}
      <UploadList items={items} busy={busy} onRetry={retry} />

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {data.photos.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3 p-0">
          {data.photos.map((photo) => {
            const isCover = photo.id === data.coverImageId
            return (
              <li
                key={photo.id}
                className={cn(
                  'relative overflow-hidden rounded-[10px] border border-border bg-card',
                  isCover && 'border-primary ring-2 ring-primary',
                )}
              >
                <img
                  src={imageUrl(photo.id, 'thumb')}
                  srcSet={imageSrcSet(photo.id, photo.width)}
                  sizes="200px"
                  width={photo.width}
                  height={photo.height}
                  loading="lazy"
                  alt={t('gal.photoAlt')}
                  className="aspect-square w-full object-cover"
                />
                {/* The star: pressed on the cover, press another to move it. */}
                <button
                  type="button"
                  aria-pressed={isCover}
                  aria-label={
                    isCover ? t('actPhotos.isCover') : t('actPhotos.makeCover')
                  }
                  title={
                    isCover ? t('actPhotos.isCover') : t('actPhotos.makeCover')
                  }
                  disabled={setCover.isPending || isCover}
                  onClick={() => setCover.mutate(photo.id)}
                  className={cn(
                    'absolute start-2 top-2 inline-flex h-8 items-center gap-1 rounded-md px-2 text-xs font-medium focus-visible:outline-2 focus-visible:outline-primary',
                    isCover
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card/90 text-foreground hover:bg-card',
                  )}
                >
                  <Star
                    aria-hidden="true"
                    className={cn('size-4', isCover && 'fill-current')}
                  />
                  {isCover && t('actPhotos.cover')}
                </button>
                <CaptionField
                  id={photo.id}
                  initial={photo.caption ?? ''}
                  onError={setError}
                />
                <HomeToggle
                  id={photo.id}
                  onHome={photo.onHome}
                  homeFull={homeFull}
                  onError={setError}
                />
                <DeletePhotoButton
                  id={photo.id}
                  isCover={isCover}
                  onError={setError}
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">{t('actPhotos.empty')}</p>
      )}
    </section>
  )
}
