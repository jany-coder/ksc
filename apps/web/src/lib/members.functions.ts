import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { memberEditSchema, memberFormSchema } from './member-form.ts'
import { MEMBER_STATUSES } from './member-options.ts'
import { membersSearchSchema } from './members-query.ts'
import {
  archiveMember,
  changeMemberPhone,
  createMember,
  getMember,
  listMembers,
  setMemberStatus,
  updateMember,
} from './members.server.ts'
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

export const setMemberStatusFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), status: z.enum(MEMBER_STATUSES) }))
  .handler(async ({ data }) => {
    const actor = await requirePermission('members.write')
    return setMemberStatus(actor, data.id, data.status)
  })

// Dangerous: super_admin only (CLAUDE.md section 4).
export const archiveMemberFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid() }))
  .handler(async ({ data }) => {
    const actor = await requirePermission('members.delete')
    return archiveMember(actor, data.id)
  })

export const updateMemberFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), values: memberEditSchema }))
  .handler(async ({ data }) => {
    const actor = await requirePermission('members.write')
    return updateMember(actor, data.id, data.values)
  })

// The phone is the login name, so this is super_admin only.
export const changeMemberPhoneFn = createServerFn({ method: 'POST' })
  .validator(z.object({ id: z.uuid(), phone: z.string().max(40) }))
  .handler(async ({ data }) => {
    const actor = await requirePermission('members.changePhone')
    return changeMemberPhone(actor.id, data.id, data.phone)
  })
