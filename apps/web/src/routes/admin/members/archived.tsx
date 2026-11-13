import {
  useQueryClient,
  queryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../components/ui/button.tsx'
import { formatDate } from '../../../lib/datetime.ts'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { useLang, useT } from '../../../lib/i18n/index.tsx'
import { tFor } from '../../../lib/i18n/messages.ts'
import {
  listArchivedMembersFn,
  restoreMemberFn,
} from '../../../lib/members.functions.ts'
import { can } from '../../../lib/permissions.ts'

const archivedQuery = () =>
  queryOptions({
    queryKey: ['members', 'archived'],
    queryFn: () => listArchivedMembersFn(),
  })

export const Route = createFileRoute('/admin/members/archived')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('bin.pageTitle') }],
  }),
  beforeLoad: ({ context }) => {
    // The server function checks again; this keeps people off the page.
    if (!can(context.member.role, 'members.delete'))
      throw redirect({ to: '/admin/members' })
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(archivedQuery()),
  errorComponent: BinError,
  component: BinPage,
})

function BinError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('bin.loadError')}
      </p>
    </main>
  )
}

function BinPage() {
  const t = useT()
  const lang = useLang()
  const queryClient = useQueryClient()
  const { data: rows } = useSuspenseQuery(archivedQuery())
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState(false)

  async function restore(id: string) {
    setBusyId(id)
    setError(false)
    try {
      await restoreMemberFn({ data: { id } })
      // "Not found" means someone already restored it: the list just refreshes.
      await queryClient.invalidateQueries({ queryKey: ['members'] })
      await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    } catch {
      setError(true)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <main className="px-4 py-6 md:p-6">
      <Link
        to="/admin/members"
        className="mb-3 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t('memberNew.back')}
      </Link>
      <h1 className="text-2xl font-semibold">{t('bin.title')}</h1>
      <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
        {t('bin.lead')}
      </p>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {t('bin.restoreFailed')}
        </p>
      )}
      <div className="mt-5 max-w-2xl overflow-hidden rounded-[10px] border border-border bg-card">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-muted-foreground">
            {t('bin.empty')}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((row) => (
              <li
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <div className="font-medium">{row.name}</div>
                  <div className="text-[13px] text-muted-foreground">
                    {t('bin.deletedOn', {
                      date: formatDate(row.archivedDate, lang),
                    })}{' '}
                    · {t('bin.daysLeft', { n: String(row.daysLeft) })}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={busyId === row.id}
                  onClick={() => void restore(row.id)}
                >
                  {busyId === row.id ? t('a.wait') : t('bin.restore')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
