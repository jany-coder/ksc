import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { memberFormSchema } from './member-form.ts'
import { membersSearchSchema } from './members-query.ts'
import { createMember, getMember, listMembers } from './members.server.ts'
import { requirePermission } from './session.server.ts'

// The permission check is the FIRST line, inside the server function: a route
// guard alone does not protect it, since anyone can call this endpoint directly.
export const listMembersFn = createServerFn({ method: 'GET' })
  .validator(membersSearchSchema)
  .handler(async ({ data }) => {
    await requirePermission('members.read')
    return listMembers(data)
  })

export const createMemberFn = createServerFn({ method: 'POST' })
  .validator(memberFormSchema)
  .handler(async ({ data }) => {
    const actor = await requirePermission('members.write')
    return createMember(actor.id, data)
  })

export const getMemberFn = createServerFn({ method: 'GET' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    await requirePermission('members.read')
    return getMember(data.id)
  })
