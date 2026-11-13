import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { NoticesTable } from '../../../components/admin/notices-table.tsx'
import { buttonVariants } from '../../../components/ui/button.tsx'
import { listNoticesFn } from '../../../lib/notices.functions.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

const noticesQuery = () =>
  queryOptions({
    queryKey: ['notices', 'list'],
    queryFn: () => listNoticesFn(),
  })

export const Route = createFileRoute('/admin/notices/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('not.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // Keeps people off the page; the server function checks the permission too.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(noticesQuery()),
  errorComponent: NoticesError,
  component: NoticesPage,
})

function NoticesError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('not.loadError')}
      </p>
    </main>
  )
}

function NoticesPage() {
  const t = useT()
  const { data: rows } = useSuspenseQuery(noticesQuery())

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">{t('not.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('not.lead')}</p>
        </div>
        <Link to="/admin/notices/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          {t('not.add')}
        </Link>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {rows.length > 0 ? (
          <NoticesTable rows={rows} />
        ) : (
          <p className="px-4 py-10 text-center text-muted-foreground">
            {t('not.empty')}
          </p>
        )}
      </div>
    </main>
  )
}
