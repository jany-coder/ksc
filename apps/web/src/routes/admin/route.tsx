import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AdminShell } from '../../components/admin/admin-shell.tsx'
import { getCurrentMemberFn } from '../../lib/auth.functions.ts'
import { can } from '../../lib/permissions.ts'

// Layout route: every page under /admin/... passes through this guard.
//
// This keeps people off the pages. It is NOT the security boundary: server
// functions are plain HTTP endpoints and can be called directly, so each one
// must call requirePermission() itself (CLAUDE.md section 3).
export const Route = createFileRoute('/admin')({
  head: () => ({
    // Admin pages are never indexed.
    meta: [{ name: 'robots', content: 'noindex' }],
  }),
  beforeLoad: async () => {
    const member = await getCurrentMemberFn()
    if (!member) throw redirect({ to: '/login' })
    // Temporary password: nothing else is reachable until it is replaced.
    if (member.mustChangePassword) throw redirect({ to: '/change-password' })
    // Signed in but not staff (a plain member): nothing for them here.
    if (!can(member.role, 'content.write')) throw redirect({ to: '/' })
    return { member }
  },
  component: AdminLayout,
})

function AdminLayout() {
  const { member } = Route.useRouteContext()
  return (
    <AdminShell member={member}>
      <Outlet />
    </AdminShell>
  )
}
