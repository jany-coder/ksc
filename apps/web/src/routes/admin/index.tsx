import { createFileRoute } from '@tanstack/react-router'

import { useT } from '../../lib/i18n/index.tsx'
import { langOfMatches } from '../../lib/i18n/core.ts'
import type { HeadArgs } from '../../lib/i18n/core.ts'
import { tFor } from '../../lib/i18n/messages.ts'

export const Route = createFileRoute('/admin/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('dash.pageTitle') }],
  }),
  component: AdminHome,
})

// Placeholder until the dashboard from the design canvas is built.
function AdminHome() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <h1 className="text-2xl font-semibold">{t('dash.title')}</h1>
      <p className="mt-2 text-muted-foreground">{t('dash.soon')}</p>
    </main>
  )
}
