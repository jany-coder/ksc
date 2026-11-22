import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { DonorsView } from '../../components/admin/donors-view.tsx'
import { donorsSearchSchema } from '../../lib/donors-query.ts'
import type { DonorsSearch } from '../../lib/donors-query.ts'
import { listDonorsFn } from '../../lib/donors.functions.ts'
import { useT } from '../../lib/i18n/index.tsx'
import { langOfMatches } from '../../lib/i18n/core.ts'
import type { HeadArgs } from '../../lib/i18n/core.ts'
import { tFor } from '../../lib/i18n/messages.ts'
import { can } from '../../lib/permissions.ts'

// The donor lookup: someone calls the club needing blood, an admin picks the
// group and sees who can give it, those who may give now at the top, with a
// tap to call. Admins only (phone numbers): the page checks the role, and the
// server function checks the permission again.

const donorsQuery = (blood: DonorsSearch['blood']) =>
  queryOptions({
    queryKey: ['members', 'donors', blood ?? 'all'],
    queryFn: () => listDonorsFn({ data: { blood } }),
  })

export const Route = createFileRoute('/admin/donors')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('donors.pageTitle') }],
  }),
  validateSearch: donorsSearchSchema,
  beforeLoad: ({ context }) => {
    if (!can(context.member.role, 'members.read'))
      throw redirect({ to: '/admin' })
  },
  // "Only those who can give now" filters on this page; only the group
  // reloads the list.
  loaderDeps: ({ search }) => ({ blood: search.blood }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(donorsQuery(deps.blood)),
  errorComponent: DonorsError,
  component: DonorsPage,
})

function DonorsError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('donors.loadError')}
      </p>
    </main>
  )
}

function DonorsPage() {
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(donorsQuery(search.blood))
  return <DonorsView data={data} search={search} />
}
