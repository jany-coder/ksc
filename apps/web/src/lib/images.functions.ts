import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_CAPTION_LENGTH,
  deleteImage,
  galleryAdminData,
  heroPhotos,
  listHomeImages,
  listImages,
  listPublicGallery,
  publicGalleryYears,
  setImageCaption,
  setHeroPhotos,
  setImageOnHome,
  setImagesActivity,
  activityPhotos,
  setActivityCover,
} from './images.server.ts'
import { HERO_SLIDE_COUNT } from './image-limits.ts'
import {
  galleryFilterSchema,
  publicGallerySearchSchema,
} from './gallery-filter.ts'
import { setHeroSwitch } from './site-settings.server.ts'
import { requirePermission } from './session.server.ts'

export const galleryAdminDataFn = createServerFn({ method: 'GET' })
  .validator(galleryFilterSchema.extend({ offset: z.number().int().min(0) }))
  .handler(async ({ data: { offset, ...filter } }) => {
    await requirePermission('content.write')
    return galleryAdminData(filter, offset)
  })

export const deleteImageFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return deleteImage(data.id)
  })

export const setImageCaptionFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({ id: z.uuid(), caption: z.string().max(MAX_CAPTION_LENGTH) }),
  )
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return setImageCaption(data.id, data.caption)
  })

export const setImageOnHomeFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), onHome: z.boolean() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return setImageOnHome(data.id, data.onHome)
  })

export const setHeroPhotosFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      backgroundId: z.uuid().nullable(),
      slideIds: z.array(z.uuid()).max(HERO_SLIDE_COUNT),
    }),
  )
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return setHeroPhotos(data)
  })

// Turn the hero's background or frame on or off; the picks stay as they are.
export const setHeroSwitchFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({ part: z.enum(['background', 'frame']), on: z.boolean() }),
  )
  .handler(async ({ data }) => {
    const member = await requirePermission('content.write')
    await setHeroSwitch(member.id, data.part, data.on)
    return { ok: true as const }
  })

export const activityPhotosFn = createServerFn({ method: 'GET' })
  .validator(z.object({ activityId: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return activityPhotos(data.activityId)
  })

export const setActivityCoverFn = createServerFn({ method: 'POST' })
  .validator(z.object({ activityId: z.uuid(), imageId: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return setActivityCover(data.activityId, data.imageId)
  })

// Several ids at once, so admins can move a whole selection in one go.
export const setImagesActivityFn = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      ids: z.array(z.uuid()).min(1).max(200),
      activityId: z.uuid().nullable(),
    }),
  )
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return setImagesActivity(data.ids, data.activityId)
  })

// Public: deliberately no permission check, because the gallery is public.
// Safe because it returns only the id and size of each photo: never who
// uploaded it, and never anything about a member.
export const listPublicImagesFn = createServerFn({ method: 'GET' })
  .validator(z.object({ limit: z.number().int().min(1).max(100) }))
  .handler(({ data }) => listImages(data.limit))

// Public, for the same reason as listPublicImagesFn: photos and their sizes only.
export const listHomeImagesFn = createServerFn({ method: 'GET' }).handler(() =>
  listHomeImages(),
)

// Public, for the same reason: photos, their sizes and captions only.
export const heroPhotosFn = createServerFn({ method: 'GET' }).handler(() =>
  heroPhotos(),
)

export const PUBLIC_GALLERY_PAGE = 60

// Public: no permission check. Returns photos with their activity's title and
// date only when that activity is published (see listPublicGallery).
export const listPublicGalleryFn = createServerFn({ method: 'GET' })
  .validator(
    publicGallerySearchSchema.extend({ offset: z.number().int().min(0) }),
  )
  .handler(async ({ data }) => {
    const [page, years] = await Promise.all([
      listPublicGallery({
        year: data.year,
        limit: PUBLIC_GALLERY_PAGE,
        offset: data.offset,
      }),
      publicGalleryYears(),
    ])
    return { ...page, years }
  })
