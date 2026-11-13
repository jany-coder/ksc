import { queryOptions, useSuspenseQuery } from '@tanstack/react-query'
import {
  Link,
  createFileRoute,
  redirect,
  useNavigate,
} from '@tanstack/react-router'
import { Download, Plus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'

import { MemberDrawer } from '../../../components/admin/member-drawer.tsx'
import { useNumber, useT } from '../../../lib/i18n/index.tsx'
import { langOfMatches } from '../../../lib/i18n/core.ts'
import type { HeadArgs } from '../../../lib/i18n/core.ts'
import { tFor } from '../../../lib/i18n/messages.ts'
import { MembersTable } from '../../../components/admin/members-table.tsx'
import { buttonVariants } from '../../../components/ui/button.tsx'
import { Input } from '../../../components/ui/input.tsx'
import {
  BLOOD_GROUPS,
  MEMBER_STATUSES,
  STATUS_LABEL_KEY,
  bloodLabel,
} from '../../../lib/member-options.ts'
import { membersSearchSchema } from '../../../lib/members-query.ts'
import type { MembersSearch } from '../../../lib/members-query.ts'
import { listMembersFn } from '../../../lib/members.functions.ts'
import { can } from '../../../lib/permissions.ts'
import { cn } from '../../../lib/utils.ts'

// The key holds every filter, so each combination has its own cache entry.
const membersQuery = (search: MembersSearch) =>
  queryOptions({
    queryKey: ['members', 'list', search],
    queryFn: () => listMembersFn({ data: search }),
  })

export const Route = createFileRoute('/admin/members/')({
  head: ({ matches }: HeadArgs) => ({
    meta: [{ title: tFor(langOfMatches(matches))('members.pageTitle') }],
  }),
  validateSearch: membersSearchSchema,
  beforeLoad: ({ context }) => {
    // The /admin guard already ran; this also keeps people off by role. The
    // server function checks the permission again: that is the real lock.
    if (!can(context.member.role, 'members.read'))
      throw redirect({ to: '/admin' })
  },
  // The open drawer is not part of the list: leave it out of the deps, so opening
  // or closing it does not reload the list.
  loaderDeps: ({ search: { member: _open, ...filters } }) => filters,
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(membersQuery(deps)),
  errorComponent: MembersError,
  component: MembersPage,
})

// Build a search object without keys whose value is undefined, so the URL stays
// clean (/admin/members, not /admin/members?status=undefined).
function next(
  prev: Partial<MembersSearch>,
  patch: Partial<MembersSearch>,
): MembersSearch {
  // Any filter change drops the page (the old page may no longer exist); a
  // caller that wants a page passes it in the patch.
  const merged = { ...prev, page: undefined, ...patch }
  const out: MembersSearch = {}
  if (merged.status) out.status = merged.status
  if (merged.blood) out.blood = merged.blood
  if (merged.q) out.q = merged.q
  if (merged.page && merged.page > 1) out.page = merged.page // page 1 = no param
  return out
}

const chipClass =
  'inline-flex min-h-9 items-center rounded-lg border px-[13px] text-[13px] font-semibold'

function MembersError() {
  const t = useT()
  return (
    <main className="px-4 py-6 md:p-6">
      <p role="alert" className="text-red-700">
        {t('members.loadError')}
      </p>
    </main>
  )
}

function MembersPage() {
  const t = useT()
  const number = useNumber()
  const { member: openMemberId, ...search } = Route.useSearch()
  const { member } = Route.useRouteContext()
  const navigate = useNavigate()
  const { data } = useSuspenseQuery(membersQuery(search))
  const { rows, total, counts, page, pageSize } = data // page: 1 when absent

  // Search as you type, but wait for a pause so each keystroke is not a request.
  const [text, setText] = useState(search.q ?? '')
  useEffect(() => {
    const timer = setTimeout(() => {
      const q = text.trim()
      if (q === (search.q ?? '')) return
      void navigate({
        to: '/admin/members',
        search: (prev) => next(prev, { q: q || undefined }),
        replace: true,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [text, search.q, navigate])

  const from = (page - 1) * pageSize + 1
  const to = (page - 1) * pageSize + rows.length
  const hasPrev = page > 1
  const hasNext = page * pageSize < total

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="mb-0.5 text-2xl font-semibold">
            {t('members.title')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t('members.privacy')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {can(member.role, 'members.export') && (
            // A real download link: the server answers with a file.
            <a
              href="/api/members-export"
              className={buttonVariants({ variant: 'outline' })}
            >
              <Download aria-hidden="true" />
              {t('members.csv')}
            </a>
          )}
          {can(member.role, 'members.write') && (
            <Link to="/admin/members/new" className={buttonVariants()}>
              <Plus aria-hidden="true" />
              {t('members.add')}
            </Link>
          )}
        </div>
      </div>

      <nav
        aria-label={t('members.byStatus')}
        className="flex flex-wrap gap-1 border-b border-border"
      >
        {([undefined, ...MEMBER_STATUSES] as const).map((status) => {
          const active = search.status === status
          const count = status ? counts[status] : counts.all
          return (
            <Link
              key={status ?? 'all'}
              to="/admin/members"
              search={(prev) => next(prev, { status })}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-mb-px inline-flex min-h-9 items-center gap-[7px] border-b-2 px-3 text-sm',
                active
                  ? 'border-primary font-semibold text-primary'
                  : 'border-transparent font-medium text-muted-foreground hover:text-foreground',
              )}
            >
              {status ? t(STATUS_LABEL_KEY[status]) : t('a.all')}
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

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 max-w-[300px] flex-[1_1_220px]">
          <Search
            className="pointer-events-none absolute start-3 top-1/2 size-[15px] -translate-y-1/2 text-zinc-400"
            aria-hidden="true"
          />
          <Input
            type="search"
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-label={t('members.searchLabel')}
            placeholder={t('members.searchPlaceholder')}
            className="ps-9"
          />
        </div>
        {([undefined, ...BLOOD_GROUPS] as const).map((group) => {
          const active = search.blood === group
          return (
            <Link
              key={group ?? 'all'}
              to="/admin/members"
              search={(prev) => next(prev, { blood: group })}
              aria-current={active ? 'true' : undefined}
              className={cn(
                chipClass,
                active
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-border bg-card text-zinc-700 hover:bg-secondary',
              )}
            >
              {group ? bloodLabel(group) : t('a.all')}
            </Link>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {rows.length > 0 ? (
          <MembersTable rows={rows} />
        ) : (
          <p className="px-4 py-10 text-center text-muted-foreground">
            {counts.all === 0
              ? t('members.emptyNone')
              : t('members.emptyFilter')}
          </p>
        )}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border px-4 py-[11px]">
          <span className="text-[13px] text-muted-foreground">
            {t('members.summary', {
              all: number(counts.all),
              total: number(total),
            })}
            {total > 0
              ? t('members.range', { from: number(from), to: number(to) })
              : ''}
          </span>
          <div className="flex gap-1.5">
            <PageLink enabled={hasPrev} page={page - 1} label={t('a.prev')} />
            <PageLink enabled={hasNext} page={page + 1} label={t('a.next')} />
          </div>
        </div>
      </div>

      {openMemberId && (
        <MemberDrawer
          key={openMemberId}
          memberId={openMemberId}
          actor={member}
          onClose={() =>
            void navigate({
              to: '/admin/members',
              search: (prev) => ({ ...prev, member: undefined }),
              resetScroll: false,
            })
          }
        />
      )}
    </main>
  )
}

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
      to="/admin/members"
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
