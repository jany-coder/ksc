import { createFileRoute } from '@tanstack/react-router'

import { auth } from '../../../lib/auth.ts'

// One catch-all route hands every /api/auth/* request to Better Auth.
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }: { request: Request }) => auth.handler(request),
      POST: ({ request }: { request: Request }) => auth.handler(request),
    },
  },
})
