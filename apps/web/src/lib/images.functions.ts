import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import {
  MAX_CAPTION_LENGTH,
  deleteImage,
  galleryAdminData,
  listImages,
  setImageCaption,
} from './images.server.ts'
import { requirePermission } from './session.server.ts'

export const galleryAdminDataFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission('content.write')
    return galleryAdminData()
  },
)

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

// Public: deliberately no permission check, because the gallery is public.
// Safe because it returns only the id and size of each photo: never who
// uploaded it, and never anything about a member.
export const listPublicImagesFn = createServerFn({ method: 'GET' })
  .validator(z.object({ limit: z.number().int().min(1).max(100) }))
  .handler(({ data }) => listImages(data.limit))
