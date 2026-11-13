import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'

import { getDashboardFn } from '../../lib/dashboard.functions.ts'
import { useT } from '../../lib/i18n/index.tsx'
import { langOfMatches } from '../../lib/i18n/core.ts'
import type { HeadArgs } from '../../lib/i18n/core.ts'
import { tFor } from '../../lib/i18n/messages.ts'
import {
  BLOOD_GROUPS,
  MEMBER_STATUSES,
  STATUS_LABEL_KEY,
  bloodLabel,
} from '../../lib/member-options.ts'
import { can } from '../../lib/permissions.ts'

const dashboardQuery = () =>
  queryOptions({
    queryKey: ['dashboard'],
    queryFn: () => getDashboardFn(),
  })

export const Route = createFileRoute('/admin/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('dash.pageTitle') }],
  }),
  loader: ({ context }) =>
    // Only admins see numbers; a plain member has nothing to load.
    can(context.member.role, 'members.read')
      ? context.queryClient.ensureQueryData(dashboardQuery())
      : undefined,
  errorComponent: DashboardError,
  component: AdminHome,
})

function DashboardError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('dash.loadError')}
      </p>
    </main>
  )
}

const card = 'rounded-[10px] border border-border bg-card p-5'

function AdminHome() {
  const t = useT()
  const { member } = Route.useRouteContext()
  return (
    <main className="px-4 py-6 md:p-6">
      <h1 className="text-2xl font-semibold">{t('dash.title')}</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">{t('dash.lead')}</p>
      {can(member.role, 'members.read') && <Figures />}
    </main>
  )
}

function Figures() {
  const t = useT()
  const { data } = useSuspenseQuery(dashboardQuery())

  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2">
      <section className={card} aria-labelledby="dash-members">
        <h2 id="dash-members" className="text-[15px] font-semibold">
          {t('dash.members')}
        </h2>
        <p className="mt-2 text-3xl font-semibold tabular-nums">
          {data.members.all}
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            {t('dash.membersTotal')}
          </span>
        </p>
        <ul className="mt-3 space-y-1 text-sm">
          {MEMBER_STATUSES.map((status) => (
            <li key={status} className="flex justify-between">
              <Link
                to="/admin/members"
                search={{ status }}
                className="text-muted-foreground hover:text-foreground"
              >
                {t(STATUS_LABEL_KEY[status])}
              </Link>
              <span className="tabular-nums">{data.members[status]}</span>
            </li>
          ))}
        </ul>
        {data.members.pending > 0 && (
          <Link
            to="/admin/members"
            search={{ status: 'pending' }}
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            {t('dash.pendingHint')}
          </Link>
        )}
      </section>

      <section className={card} aria-labelledby="dash-donors">
        <h2 id="dash-donors" className="text-[15px] font-semibold">
          {t('dash.donors')}
        </h2>
        <ul className="mt-3 grid grid-cols-4 gap-2">
          {BLOOD_GROUPS.map((group) => (
            <li
              key={group}
              className="rounded-lg border border-border px-2 py-2 text-center"
            >
              <div className="text-xs text-muted-foreground">
                {bloodLabel(group)}
              </div>
              <div className="text-lg font-semibold tabular-nums">
                {data.donors[group]}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <PublishCard
        title={t('dash.activities')}
        to="/admin/activities"
        counts={data.activities}
      />
      <PublishCard
        title={t('dash.notices')}
        to="/admin/notices"
        counts={data.notices}
      />
    </div>
  )
}

function PublishCard({
  title,
  to,
  counts,
}: {
  title: string
  to: '/admin/activities' | '/admin/notices'
  counts: { published: number; draft: number }
}) {
  const t = useT()
  return (
    <section className={card}>
      <h2 className="text-[15px] font-semibold">
        <Link to={to} className="hover:underline">
          {title}
        </Link>
      </h2>
      <dl className="mt-3 flex gap-8">
        <div>
          <dd className="text-2xl font-semibold tabular-nums">
            {counts.published}
          </dd>
          <dt className="text-sm text-muted-foreground">
            {t('dash.published')}
          </dt>
        </div>
        <div>
          <dd className="text-2xl font-semibold tabular-nums">
            {counts.draft}
          </dd>
          <dt className="text-sm text-muted-foreground">{t('dash.draft')}</dt>
        </div>
      </dl>
    </section>
  )
}
