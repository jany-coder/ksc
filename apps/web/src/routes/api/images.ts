import { createFileRoute } from '@tanstack/react-router'

import { saveImage } from '../../lib/images.server.ts'
import { can } from '../../lib/permissions.ts'
import { memberFromHeaders } from '../../lib/session.server.ts'

// Photo upload. A plain route (not a server function) because it receives
// files. The browser has already shrunk the photo to two small WebP files, so
// this sends them through the Worker into R2 (the bucket is bound, there are no
// keys). The permission check runs first: anyone can call this URL directly.
const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

// Two small photos are well under this; it stops huge bodies early.
const MAX_BODY_BYTES = 1_500_000

export const Route = createFileRoute('/api/images')({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const member = await memberFromHeaders(request.headers)
        if (!member) return json({ ok: false, code: 'UNAUTHENTICATED' }, 401)
        if (member.mustChangePassword || !can(member.role, 'content.write'))
          return json({ ok: false, code: 'FORBIDDEN' }, 403)

        const declared = Number(request.headers.get('content-length') ?? '0')
        if (declared > MAX_BODY_BYTES)
          return json({ ok: false, code: 'TOO_LARGE' }, 413)

        const form = await request.formData().catch(() => null)
        const full = form?.get('full')
        const thumb = form?.get('thumb')
        if (!(full instanceof File) || !(thumb instanceof File))
          return json({ ok: false, code: 'INVALID_INPUT' }, 400)

        const result = await saveImage(member.id, {
          full: await full.arrayBuffer(),
          thumb: await thumb.arrayBuffer(),
          width: Number(form?.get('width')),
          height: Number(form?.get('height')),
        })
        if (result.ok) return json(result, 201)
        const status =
          result.code === 'STORAGE_FULL'
            ? 507
            : result.code === 'TOO_LARGE'
              ? 413
              : 400
        return json(result, status)
      },
    },
  },
})
