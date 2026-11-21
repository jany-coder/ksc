import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import {
  deleteMemberPhoto,
  getMemberPhotoObject,
  saveMemberPhoto,
} from '../../../lib/member-photo.server.ts'
import { can } from '../../../lib/permissions.ts'
import type { Action } from '../../../lib/permissions.ts'
import { memberFromHeaders } from '../../../lib/session.server.ts'

// A member's photo. Unlike gallery photos this is personal data, so EVERY
// method checks the session and the permission first: anyone can call this URL
// directly (CLAUDE.md section 3). GET needs members.read, POST (upload) and
// DELETE need members.write.
const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

const idSchema = z.uuid()
// One small photo is well under this; it stops huge bodies early.
const MAX_BODY_BYTES = 400_000

async function allowed(request: Request, permission: Action) {
  const member = await memberFromHeaders(request.headers)
  if (!member)
    return { error: json({ ok: false, code: 'UNAUTHENTICATED' }, 401) }
  if (member.mustChangePassword || !can(member.role, permission))
    return { error: json({ ok: false, code: 'FORBIDDEN' }, 403) }
  return { member }
}

type Args = { request: Request; params: { id: string } }

export const Route = createFileRoute('/api/member-photo/$id')({
  server: {
    handlers: {
      GET: async ({ request, params }: Args) => {
        const check = await allowed(request, 'members.read')
        if ('error' in check) return check.error
        if (!idSchema.safeParse(params.id).success)
          return new Response('Not found', { status: 404 })
        const object = await getMemberPhotoObject(params.id)
        if (!object) return new Response('Not found', { status: 404 })
        return new Response(object.body, {
          headers: {
            'Content-Type': 'image/webp',
            // private: never in a shared cache. The URL carries a version, so
            // the browser may keep it for a day.
            'Cache-Control': 'private, max-age=86400',
            ETag: object.httpEtag,
            'X-Content-Type-Options': 'nosniff',
          },
        })
      },

      POST: async ({ request, params }: Args) => {
        const check = await allowed(request, 'members.write')
        if ('error' in check) return check.error
        if (!idSchema.safeParse(params.id).success)
          return json({ ok: false, code: 'NOT_FOUND' }, 404)
        const declared = Number(request.headers.get('content-length') ?? '0')
        if (declared > MAX_BODY_BYTES)
          return json({ ok: false, code: 'TOO_LARGE' }, 413)

        const form = await request.formData().catch(() => null)
        const photo = form?.get('photo')
        if (!(photo instanceof File))
          return json({ ok: false, code: 'INVALID_INPUT' }, 400)
        const result = await saveMemberPhoto(check.member.id, params.id, {
          bytes: await photo.arrayBuffer(),
          width: Number(form?.get('width')),
          height: Number(form?.get('height')),
        })
        if (result.ok) return json(result, 201)
        const status =
          result.code === 'NOT_FOUND'
            ? 404
            : result.code === 'TOO_LARGE'
              ? 413
              : 400
        return json(result, status)
      },

      DELETE: async ({ request, params }: Args) => {
        const check = await allowed(request, 'members.write')
        if ('error' in check) return check.error
        if (!idSchema.safeParse(params.id).success)
          return json({ ok: false, code: 'NOT_FOUND' }, 404)
        const result = await deleteMemberPhoto(check.member.id, params.id)
        return json(result, result.ok ? 200 : 404)
      },
    },
  },
})
