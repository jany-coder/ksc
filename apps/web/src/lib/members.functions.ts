import { createServerFn } from '@tanstack/react-start'

import { membersSearchSchema } from './members-query.ts'
import { listMembers } from './members.server.ts'
import { requirePermission } from './session.server.ts'

// The permission check is the FIRST line, inside the server function: a route
// guard alone does not protect it, since anyone can call this endpoint directly.
export const listMembersFn = createServerFn({ method: 'GET' })
  .validator(membersSearchSchema)
  .handler(async ({ data }) => {
    await requirePermission('members.read')
    return listMembers(data)
  })
