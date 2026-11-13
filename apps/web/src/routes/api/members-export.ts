import { createFileRoute } from '@tanstack/react-router'

import { DEFAULT_LANG, readLangFromCookieHeader } from '../../lib/i18n/core.ts'
import { exportMembersCsv } from '../../lib/members.server.ts'
import { can } from '../../lib/permissions.ts'
import { memberFromHeaders } from '../../lib/session.server.ts'

// The byte-order mark makes Excel read the file as UTF-8, so Bengali shows correctly.
const BOM = String.fromCharCode(0xfeff)

// A plain download link (/api/members-export) rather than a server function,
// because the browser must receive a FILE. The permission check is still the
// first thing that runs: this URL can be opened by anyone, so it answers 401 /
// 403 unless the caller is a signed-in super_admin.
export const Route = createFileRoute('/api/members-export')({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        const member = await memberFromHeaders(request.headers)
        if (!member) return new Response('Unauthorized', { status: 401 })
        if (member.mustChangePassword || !can(member.role, 'members.export'))
          return new Response('Forbidden', { status: 403 })

        // The column headings follow the language the admin chose in the panel.
        const lang =
          readLangFromCookieHeader(request.headers.get('cookie')) ??
          DEFAULT_LANG
        const { csv } = await exportMembersCsv(member.id, lang)
        const date = new Date().toISOString().slice(0, 10)
        return new Response(`${BOM}${csv}`, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="members-${date}.csv"`,
            // Personal data: never store a copy in a cache.
            'Cache-Control': 'no-store',
          },
        })
      },
    },
  },
})
