import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { deleteImage, galleryAdminData } from './images.server.ts'
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
