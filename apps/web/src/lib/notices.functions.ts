import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { noticeFormSchema } from './notice-form.ts'
import {
  createNotice,
  deleteNotice,
  getNotice,
  listNotices,
  listPublicNotices,
  updateNotice,
} from './notices.server.ts'
import { requirePermission } from './session.server.ts'

// Admin: the permission check is the first line, inside the function.
export const createNoticeFn = createServerFn({ method: 'POST' })
  .validator(noticeFormSchema)
  .handler(async ({ data }) => {
    const actor = await requirePermission('content.write')
    return createNotice(actor.id, data)
  })

export const getNoticeFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return getNotice(data.id)
  })

export const updateNoticeFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), values: noticeFormSchema }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return updateNotice(data.id, data.values)
  })

export const deleteNoticeFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return deleteNotice(data.id)
  })

export const listNoticesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission('content.write')
    return listNotices()
  },
)

// Public: deliberately no permission check, because the home page is public.
// Safe only because listPublicNotices returns published rows and public columns.
export const listPublicNoticesFn = createServerFn({ method: 'GET' }).handler(
  () => listPublicNotices(5),
)
