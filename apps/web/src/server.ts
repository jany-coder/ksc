import handler from '@tanstack/react-start/server-entry'

import { purgeArchivedMembers } from './lib/members.server.ts'

// The Worker's entry point. Web requests go to TanStack Start exactly as
// before; the extra `scheduled` function is what Cloudflare calls on the cron
// schedule in wrangler.jsonc ("triggers"). It is not reachable from the web.
export default {
  fetch: handler.fetch,

  // Once a day: really delete members who were archived more than 30 days ago.
  // Only a count is logged, never a name or a phone number (CLAUDE.md s.3).
  async scheduled(
    _controller: unknown,
    _env: unknown,
    ctx: { waitUntil: (promise: Promise<unknown>) => void },
  ) {
    ctx.waitUntil(
      purgeArchivedMembers().then((removed) => {
        console.log(`purge: removed ${removed} archived member(s)`)
      }),
    )
  },
}
