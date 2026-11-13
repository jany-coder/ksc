import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { makeAdmin, removeAdmin } from './admins.server.ts'
import { requirePermission } from './session.server.ts'

const target = z.object({ id: z.uuid() })

// Dangerous: super_admin only (CLAUDE.md section 4).
export const makeAdminFn = createServerFn({ method: 'POST' })
  .validator(target)
  .handler(async ({ data }) => {
    const actor = await requirePermission('admins.manage')
    return makeAdmin(actor.id, data.id)
  })

export const removeAdminFn = createServerFn({ method: 'POST' })
  .validator(target)
  .handler(async ({ data }) => {
    const actor = await requirePermission('admins.manage')
    return removeAdmin(actor.id, data.id)
  })
