import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import { useT } from '../../lib/i18n/index.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import type { MemberRow } from '../../lib/members.server.ts'
import { STATUS_LABEL_KEY, bloodLabel } from '../../lib/member-options.ts'
import type { MemberStatus } from '../../lib/member-options.ts'
import { cn } from '../../lib/utils.ts'

// The table only displays rows. Filtering, paging and sorting happen on the
// server (see members.server.ts), so no table features are registered.
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, MemberRow>()

const STATUS_DOT: Record<MemberStatus, string> = {
  active: 'bg-green-600',
  pending: 'bg-yellow-600',
  suspended: 'bg-zinc-400',
}

const ROLE_KEY = {
  super_admin: 'role.super_admin',
  admin: 'role.admin',
  member: 'role.member',
} as const satisfies Record<MemberRow['role'], MessageKey>

// First letter as a person sees it (Bengali conjuncts are several code points).
function initialOf(name: string): string {
  const first = new Intl.Segmenter('bn', { granularity: 'grapheme' })
    .segment(name.trim())
    [Symbol.iterator]()
    .next()
  return first.done ? '?' : first.value.segment
}

const dash = <span className="text-muted-foreground">—</span>

// Built inside the component, because the headings and the role badge need the
// reader's language (t).
function makeColumns(t: ReturnType<typeof useT>) {
  return helper.columns([
    helper.accessor('name', {
      header: t('members.colMember'),
      cell: ({ getValue, row }) => (
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <span
            aria-hidden="true"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-zinc-600"
          >
            {initialOf(getValue())}
          </span>
          {/* A real link: opens the detail drawer (?member=<id>), so it works with
            middle-click and "copy link address" too. */}
          <Link
            to="/admin/members"
            search={(prev) => ({ ...prev, member: row.original.id })}
            resetScroll={false}
            className="font-medium text-foreground hover:underline"
          >
            {getValue()}
          </Link>
          {/* Role is separate from status: shown only for the club's admins. */}
          {row.original.role !== 'member' && (
            <span className="rounded-[5px] border border-border bg-secondary px-1.5 py-px text-[11px] font-semibold text-zinc-600">
              {t(ROLE_KEY[row.original.role])}
            </span>
          )}
        </span>
      ),
    }),
    helper.accessor('phone', {
      header: t('members.colMobile'),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{getValue()}</span>
      ),
    }),
    helper.accessor('bloodGroup', {
      header: t('members.colBlood'),
      cell: ({ getValue }) => {
        const group = getValue()
        return group ? (
          <span className="inline-flex min-w-[38px] justify-center rounded-[5px] border border-red-200 bg-red-50 px-[7px] py-0.5 text-xs font-semibold text-red-800">
            {bloodLabel(group)}
          </span>
        ) : (
          dash
        )
      },
    }),
    helper.accessor('area', {
      header: t('members.colArea'),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() ?? dash}</span>
      ),
    }),
    helper.accessor('occupation', {
      header: t('members.colOccupation'),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() ?? dash}</span>
      ),
    }),
    helper.accessor('status', {
      header: t('a.status'),
      cell: ({ getValue }) => (
        <span className="inline-flex items-center gap-1.5 text-[13px] text-zinc-700">
          <span
            aria-hidden="true"
            className={cn('size-[7px] rounded-full', STATUS_DOT[getValue()])}
          />
          {t(STATUS_LABEL_KEY[getValue()])}
        </span>
      ),
    }),
  ])
}

export function MembersTable({ rows }: { rows: MemberRow[] }) {
  const t = useT()
  const columns = useMemo(() => makeColumns(t), [t])
  const table = useTable({ features, columns, data: rows })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <caption className="sr-only">{t('members.caption')}</caption>
        <thead>
          {table.getHeaderGroups().map((group) => (
            <tr key={group.id}>
              {group.headers.map((header) => (
                <th
                  key={header.id}
                  scope="col"
                  className="border-b border-border bg-background px-3.5 py-[9px] text-start text-xs font-semibold whitespace-nowrap text-muted-foreground"
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id} className="hover:bg-background">
              {row.getAllCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-b border-zinc-100 px-3.5 py-[11px] align-middle text-sm text-zinc-800"
                >
                  <table.FlexRender cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
