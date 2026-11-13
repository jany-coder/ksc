import { createServerFn } from '@tanstack/react-start'

import { getDashboard } from './dashboard.server.ts'
import { requirePermission } from './session.server.ts'

export const getDashboardFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    await requirePermission('members.read')
    return getDashboard()
  },
)
