import { createServerFn } from '@tanstack/react-start'

import { activityFormSchema } from './activity-form.ts'
import {
  createActivity,
  listActivities,
  listUpcomingPublic,
} from './activities.server.ts'
import { requirePermission } from './session.server.ts'

// Admin: the permission check is the first line, inside the function.
export const createActivityFn = createServerFn({ method: 'POST' })
  .validator(activityFormSchema)
  .handler(async ({ data }) => {
    const actor = await requirePermission('content.write')
    return createActivity(actor.id, data)
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
