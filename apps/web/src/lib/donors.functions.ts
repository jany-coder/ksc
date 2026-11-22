import { createServerFn } from '@tanstack/react-start'

import { donorsSearchSchema } from './donors-query.ts'
import { listDonors } from './donors.server.ts'
import { requirePermission } from './session.server.ts'

// Admins only: the list has donors' phone numbers and addresses. The check is
// here, on the server function, not only on the page (CLAUDE.md section 3).
export const listDonorsFn = createServerFn({ method: 'GET' })
  .validator(donorsSearchSchema)
  .handler(async ({ data }) => {
    await requirePermission('members.read')
    return listDonors(data.blood)
  })
