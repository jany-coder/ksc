import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { Plus, Search, Tags } from 'lucide-react'
import { useEffect, useState } from 'react'

import { ActivitiesTable } from '../../../components/admin/activities-table.tsx'
import { categoriesQuery } from '../../../components/admin/category-dialog.tsx'
import { buttonVariants } from '../../../components/ui/button.tsx'
import { Input } from '../../../components/ui/input.tsx'
import { NativeSelect } from '../../../components/ui/native-select.tsx'
import { listActivitiesFn } from '../../../lib/activities.functions.ts'
import {
  activitiesSearchSchema,
  nextActivitiesSearch as next,
} from '../../../lib/activities-query.ts'
import type { ActivitiesSearch } from '../../../lib/activities-query.ts'
import { categoryName } from '../../../lib/activity-category.ts'
import {
  ACTIVITY_STATUSES,
  ACTIVITY_STATUS_LABEL_KEY,
} from '../../../lib/activity-form.ts'
import { formatYear } from '../../../lib/datetime.ts'
import { useLang, useNumber, useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { can } from '../../../lib/permissions.ts'
import { cn } from '../../../lib/utils.ts'

// The key holds every filter, so each combination has its own cache entry.
const activitiesQuery = (search: ActivitiesSearch) =>
  queryOptions({
    queryKey: ['activities', 'list', search],
    queryFn: () => listActivitiesFn({ data: search }),
  })

// Laid out like the members list (status tabs, search and filters, the table,
// the page footer), so the two pages work the same way.
export const Route = createFileRoute('/admin/activities/')({
  validateSearch: activitiesSearchSchema,
  beforeLoad: ({ context }) => {
    // Keeps people off the page; the server function checks the permission too.
    if (!can(context.member.role, 'content.write'))
      throw redirect({ to: '/admin' })
  },
  loaderDeps: ({ search }) => search,
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.ensureQueryData(activitiesQuery(deps)),
      context.queryClient.ensureQueryData(categoriesQuery()),
    ]),
  // After the loader: placed before it, `head` breaks the search types.
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('act.pageTitle') }],
  }),
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
  const lang = useLang()
  const number = useNumber()
  const search = Route.useSearch()
  const { member } = Route.useRouteContext()
  const navigate = useNavigate()
  const { data } = useSuspenseQuery(activitiesQuery(search))
  const { data: kinds } = useSuspenseQuery(categoriesQuery())
  const { rows, total, counts, years, page, pageSize } = data

  const go = (patch: Partial<ActivitiesSearch>, replace = false) =>
    void navigate({
      from: '/admin/activities/',
      to: '/admin/activities',
      search: (prev) => next(prev, patch),
      replace,
    })

  // Search as you type, but wait for a pause so each keystroke is not a request.
  const [text, setText] = useState(search.q ?? '')
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = text.trim()
      if (q === (search.q ?? '')) return
      void navigate({
        from: '/admin/activities/',
        to: '/admin/activities',
        search: (prev) => next(prev, { q: q || undefined }),
        replace: true,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [text, search.q, navigate])

  const filtered = Boolean(search.q || search.year || search.category)
  const from = (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + rows.length
  const hasPrev = page > 1
  const hasNext = page * pageSize < total

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">{t('act.title')}</h1>
          <p className="max-w-[760px] text-sm text-muted-foreground">
            {t('act.lead')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can(member.role, 'categories.manage') && (
            <Link
              to="/admin/activities/categories"
              className={buttonVariants({ variant: 'outline' })}
            >
              <Tags aria-hidden="true" />
              {t('act.manageKinds')}
            </Link>
          )}
          <Link to="/admin/activities/new" className={buttonVariants()}>
            <Plus aria-hidden="true" />
            {t('act.add')}
          </Link>
        </div>
      </div>

      <nav
        aria-label={t('act.byStatus')}
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {([undefined, ...ACTIVITY_STATUSES] as const).map((status) => {
          const active = search.status === status
          const count = status ? counts[status] : counts.all
          return (
            <Link
              key={status ?? 'all'}
              from="/admin/activities/"
              to="/admin/activities"
              search={(prev) => next(prev, { status })}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-mb-px inline-flex min-h-9 items-center gap-[7px] border-b-2 px-3 text-sm',
                active
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {status ? t(ACTIVITY_STATUS_LABEL_KEY[status]) : t('a.all')}
              <span
                className={cn(
                  'rounded-full px-1.5 py-px text-[11px]',
                  active
                    ? 'bg-accent text-primary'
                    : 'bg-secondary text-muted-foreground',
                )}
              >
                {number(count)}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Search first (the quickest way to one activity), then the filters.
          On a phone the search takes a row and the three lists share the next. */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative col-span-2 min-w-0 sm:max-w-[300px] sm:flex-[1_1_220px]">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-[15px] -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label={t('act.searchLabel')}
            placeholder={t('act.searchPlaceholder')}
            className="ps-9"
          />
        </div>
        <div className="sm:w-36">
          <NativeSelect
            aria-label={t('act.yearLabel')}
            value={search.year ?? ''}
            onChange={(e) =>
              go({ year: e.target.value ? Number(e.target.value) : undefined })
            }
          >
            <option value="">{t('act.allYears')}</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {formatYear(y, lang)}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="sm:w-44">
          <NativeSelect
            aria-label={t('act.kindLabel')}
            value={search.category ?? ''}
            onChange={(e) =>
              go({
                category: e.target.value || undefined,
              })
            }
          >
            <option value="">{t('act.allKinds')}</option>
            {kinds.map((k) => (
              <option key={k.id} value={k.id}>
                {categoryName(k, lang)}
              </option>
            ))}
            <option value="none">{t('act.noKind')}</option>
          </NativeSelect>
        </div>
        <div className="col-span-2 sm:w-48">
          <NativeSelect
            aria-label={t('act.sortLabel')}
            value={search.sort ?? 'newest'}
            onChange={(e) =>
              go({ sort: e.target.value === 'oldest' ? 'oldest' : undefined })
            }
          >
            <option value="newest">{t('act.sortNewest')}</option>
            <option value="oldest">{t('act.sortOldest')}</option>
          </NativeSelect>
        </div>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {rows.length > 0 ? (
          <ActivitiesTable rows={rows} sort={search.sort ?? 'newest'} />
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-muted-foreground">
            <p>{counts.all === 0 ? t('act.empty') : t('act.emptyFilter')}</p>
            {filtered && (
              <Link
                to="/admin/activities"
                search={search.status ? { status: search.status } : {}}
                onClick={() => setText('')}
                className="text-sm font-medium text-primary hover:underline"
              >
                {t('act.clearFilters')}
              </Link>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-4 py-[11px]">
          <span className="text-[13px] text-muted-foreground">
            {t('act.summary', {
              all: number(counts.all),
              total: number(total),
            })}
            {total > 0
              ? t('act.range', { from: number(from), to: number(to) })
              : ''}
          </span>
          <div className="flex gap-1.5">
            <PageLink enabled={hasPrev} page={page - 1} label={t('a.prev')} />
            <PageLink enabled={hasNext} page={page + 1} label={t('a.next')} />
          </div>
        </div>
      </div>
    </main>
  )
}

// The same previous / next links as the members list.
const pageClass =
  'inline-flex min-h-8 items-center rounded-md border border-border bg-card px-3 text-[13px] text-zinc-700'

function PageLink({
  enabled,
  page,
  label,
}: {
  enabled: boolean
  page: number
  label: string
}) {
  return enabled ? (
    <Link
      from="/admin/activities/"
      to="/admin/activities"
      search={(prev) => next(prev, { page })}
      className={cn(pageClass, 'hover:bg-secondary')}
    >
      {label}
    </Link>
  ) : (
    <span
      aria-disabled="true"
      className={cn(pageClass, 'cursor-not-allowed opacity-50')}
    >
      {label}
    </span>
  )
}
