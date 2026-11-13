import { z } from 'zod'

import { BLOOD_GROUPS, MEMBER_STATUSES } from './member-options.ts'

export const PAGE_SIZE = 20

// What the members list can be filtered by. It lives in the URL
// (/admin/members?status=active&blood=O%2B&q=...&page=2), so a refresh or a
// shared link shows the same list. `.catch` turns a hand-edited bad value into
// "not set" instead of an error page.
//
// Every field is optional and NO default is filled in (a missing page means 1,
// decided where it is read). A default would make the router rewrite the URL
// to add "?page=1" on every visit.
export const membersSearchSchema = z.object({
  status: z.enum(MEMBER_STATUSES).optional().catch(undefined),
  blood: z.enum(BLOOD_GROUPS).optional().catch(undefined),
  q: z.string().trim().max(60).optional().catch(undefined),
  page: z.number().int().min(1).optional().catch(undefined),
})
export type MembersSearch = z.infer<typeof membersSearchSchema>

/**
 * Make user text safe inside a SQL LIKE pattern. Without this, typing "%" or
 * "_" would match every member instead of the literal character.
 */
export function escapeLike(text: string): string {
  return text.replace(/[\\%_]/g, (c) => `\\${c}`)
}
