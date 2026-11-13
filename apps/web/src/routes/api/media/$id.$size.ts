import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { getImageObject } from '../../../lib/images.server.ts'

// Serves a gallery photo from R2. Public: gallery photos are meant to be seen,
// and a photo holds no member data. It asks only R2 (no database), so a page
// full of thumbnails costs no database work. The id and size are checked first,
// so nobody can use this URL to read any other key in the bucket.
const params = z.object({ id: z.uuid(), size: z.enum(['thumb', 'full']) })

export const Route = createFileRoute('/api/media/$id/$size')({
  server: {
    handlers: {
      GET: async ({
        params: raw,
      }: {
        params: { id: string; size: string }
      }) => {
        const parsed = params.safeParse(raw)
        if (!parsed.success) return new Response('Not found', { status: 404 })

        const object = await getImageObject(parsed.data.id, parsed.data.size)
        if (!object) return new Response('Not found', { status: 404 })

        return new Response(object.body, {
          headers: {
            'Content-Type': 'image/webp',
            // The file behind an id never changes, so browsers may keep it.
            'Cache-Control': 'public, max-age=31536000, immutable',
            ETag: object.httpEtag,
            'X-Content-Type-Options': 'nosniff',
          },
        })
      },
    },
  },
})
