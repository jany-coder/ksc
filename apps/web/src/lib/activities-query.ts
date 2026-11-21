import { z } from 'zod'

import { ACTIVITY_STATUSES } from './activity-form.ts'

export const ACTIVITY_PAGE_SIZE = 20

// What the admin activities list can be filtered by. Like the members list
// (members-query.ts) it lives in the URL, so a refresh or a shared link shows
// the same list, and every field is optional with no default (a default would
// make the router add "?page=1" to every visit).
export const activitiesSearchSchema = z.object({
  status: z.enum(ACTIVITY_STATUSES).optional().catch(undefined),
  // A kind's id, or 'none' for activities without one.
  category: z
    .union([z.uuid(), z.literal('none')])
    .optional()
    .catch(undefined),
  year: z.number().int().min(2000).max(2100).optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
  // Newest date first unless this says otherwise.
  sort: z.literal('oldest').optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
})
export type ActivitiesSearch = z.infer<typeof activitiesSearchSchema>

/**
 * The next URL search after a change, without keys whose value is undefined
 * (so the URL stays /admin/activities, not ?status=undefined). Any change but
 * a page change goes back to the first page: the old page may not exist now.
 */
export function nextActivitiesSearch(
  prev: Partial<ActivitiesSearch>,
  patch: Partial<ActivitiesSearch>,
): ActivitiesSearch {
  const merged = { ...prev, page: undefined, ...patch }
  const out: ActivitiesSearch = {}
  if (merged.status) out.status = merged.status
  if (merged.category) out.category = merged.category
  if (merged.year) out.year = merged.year
  if (merged.q) out.q = merged.q
  if (merged.sort) out.sort = merged.sort
  if (merged.page && merged.page > 1) out.page = merged.page // page 1 = no param
  return out
}
