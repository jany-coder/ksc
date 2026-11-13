import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

import { ActivitiesTable } from '../../../components/admin/activities-table.tsx'
import { buttonVariants } from '../../../components/ui/button.tsx'
import { listActivitiesFn } from '../../../lib/activities.functions.ts'
import { useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'

const activitiesQuery = () =>
  queryOptions({
    queryKey: ['activities', 'list'],
    queryFn: () => listActivitiesFn(),
  })

export const Route = createFileRoute('/admin/activities/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('act.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // Keeps people off the page; the server function checks the permission too.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(activitiesQuery()),
  errorComponent: ActivitiesError,
  component: ActivitiesPage,
})

function ActivitiesError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('act.loadError')}
      </p>
    </main>
  )
}

function ActivitiesPage() {
  const t = useT()
  const { data: rows } = useSuspenseQuery(activitiesQuery())

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">{t('act.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('act.lead')}</p>
        </div>
        <Link to="/admin/activities/new" className={buttonVariants()}>
          <Plus aria-hidden="true" />
          {t('act.add')}
        </Link>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {rows.length > 0 ? (
          <ActivitiesTable rows={rows} />
        ) : (
          <p className="px-4 py-10 text-center text-muted-foreground">
            {t('act.empty')}
          </p>
        )}
      </div>
    </main>
  )
}
