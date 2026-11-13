import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { activityFormSchema } from './activity-form.ts'
import {
  createActivity,
  deleteActivity,
  getActivity,
  listActivities,
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

export const listActivitiesFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission('content.write')
    return listActivities()
  },
)

// Public: deliberately no permission check, because the home page is public.
// Safe only because listUpcomingPublic returns published rows and public columns.
export const listUpcomingActivitiesFn = createServerFn({
  method: 'GET',
}).handler(() => listUpcomingPublic(3))
