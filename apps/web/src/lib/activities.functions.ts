import { createServerFn } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { z } from 'zod'

import { activitiesSearchSchema } from './activities-query.ts'
import { activityFormSchema } from './activity-form.ts'
import {
  createActivity,
  deleteActivity,
  getActivity,
  getPublicActivity,
  listActivities,
  listPastPublic,
  listUpcomingPublic,
  updateActivity,
} from './activities.server.ts'
import { requirePermission } from './session.server.ts'

// Admin: the permission check is the first line, inside the function.
export const createActivityFn = createServerFn({ method: 'POST' })
  .validator(activityFormSchema)
  .handler(async ({ data }) => {
    const actor = await requirePermission('content.write')
    return createActivity(actor.id, data)
  })

export const getActivityFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return getActivity(data.id)
  })

export const updateActivityFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), values: activityFormSchema }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return updateActivity(data.id, data.values)
  })

export const deleteActivityFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return deleteActivity(data.id)
  })

export const listActivitiesFn = createServerFn({ method: 'GET' })
  .validator(activitiesSearchSchema)
  .handler(async ({ data }) => {
    await requirePermission('content.write')
    return listActivities(data)
  })

// Public: deliberately no permission check, because the home page is public.
// Safe only because listUpcomingPublic returns published rows and public columns.
export const listUpcomingActivitiesFn = createServerFn({
  method: 'GET',
}).handler(() => listUpcomingPublic(3))

// Public, like the one above: published activities that have already
// happened, newest first. The home page shows a few, the archive page all.
export const HOME_ACTIVITY_LIMIT = 9

export const listRecentActivitiesFn = createServerFn({
  method: 'GET',
}).handler(() => listPastPublic(HOME_ACTIVITY_LIMIT))

export const listArchiveActivitiesFn = createServerFn({
  method: 'GET',
}).handler(() => listPastPublic(300))

// Public: one published activity and its photos, for /activities/<slug>.
// Drafts give null. Also returns the site's address, because Facebook and
// WhatsApp previews need full URLs (https://…) for the photo and the page.
// VITE_SITE_URL wins when set; otherwise the address this request came to.
export const getPublicActivityFn = createServerFn({ method: 'GET' })
  .validator(z.object({ slug: z.string().min(1).max(200) }))
  .handler(async ({ data }) => {
    const activity = await getPublicActivity(data.slug)
    const configured = (
      import.meta.env.VITE_SITE_URL as string | undefined
    )?.replace(/\/+$/, '')
    const origin = configured || new URL(getRequest().url).origin
    return { activity, origin }
  })
