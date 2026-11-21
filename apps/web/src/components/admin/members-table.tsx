import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import { useT } from '../../lib/i18n/index.tsx'
import { BloodChip } from './blood-chip.tsx'
import type { MessageKey } from '../../lib/i18n/messages.ts'
import type { MemberRow } from '../../lib/members.server.ts'
import { STATUS_LABEL_KEY } from '../../lib/member-options.ts'
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

/**
 * The 128px copy of their photo, or the first letter, in a circle.
 * Decorative: the name is right beside it.
 */
function SmallAvatar({
  row,
  className,
}: {
  row: MemberRow
  className: string
}) {
  return row.photoUrl ? (
    <img
      src={row.photoUrl}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn(
        'shrink-0 rounded-full bg-secondary object-cover',
        className,
      )}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-secondary font-semibold text-zinc-600',
        className,
      )}
    >
      {initialOf(row.name)}
    </span>
  )
}

function RoleTag({ role }: { role: MemberRow['role'] }) {
  const t = useT()
  // Role is separate from status: shown only for the club's admins.
  return role === 'member' ? null : (
    <span className="rounded-[5px] border border-border bg-secondary px-1.5 py-px text-[11px] font-semibold whitespace-nowrap text-zinc-600">
      {t(ROLE_KEY[role])}
    </span>
  )
}

function StatusText({ status }: { status: MemberStatus }) {
  const t = useT()
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-zinc-700">
      <span
        aria-hidden="true"
        className={cn('size-[7px] rounded-full', STATUS_DOT[status])}
      />
      {t(STATUS_LABEL_KEY[status])}
    </span>
  )
}

// Built inside the component, because the headings and the role badge need the
// reader's language (t).
function makeColumns(t: ReturnType<typeof useT>) {
  return helper.columns([
    helper.accessor('name', {
      header: t('members.colMember'),
      cell: ({ getValue, row }) => (
        <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
          <SmallAvatar row={row.original} className="size-7 text-xs" />
          {/* A real link: opens the detail drawer (?member=<id>), so it works with
            middle-click and "copy link address" too. */}
          <Link
            from="/admin/members/"
            to="/admin/members"
            search={(prev) => ({ ...prev, member: row.original.id })}
            resetScroll={false}
            className="font-medium text-foreground hover:underline"
          >
            {getValue()}
          </Link>
          <RoleTag role={row.original.role} />
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
        return group ? <BloodChip group={group} /> : dash
      },
    }),
    helper.accessor('houseVillage', {
      header: t('members.colVillage'),
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
      cell: ({ getValue }) => <StatusText status={getValue()} />,
    }),
  ])
}

/**
 * The members list: a table from md up, a list of cards on a phone (the same
 * as the activities list), so nothing has to be scrolled sideways.
 */
export function MembersTable({ rows }: { rows: MemberRow[] }) {
  const t = useT()
  const columns = useMemo(() => makeColumns(t), [t])
  const table = useTable({ features, columns, data: rows })

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
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

      {/* Phone: one card per member; the whole card opens the quick look. */}
      <ul
        aria-label={t('members.caption')}
        className="divide-y divide-zinc-100 md:hidden"
      >
        {rows.map((row) => (
          <li
            key={row.id}
            className="relative flex items-center gap-3 px-4 py-3 active:bg-background"
          >
            <SmallAvatar row={row} className="size-11 text-base" />
            <div className="flex min-w-0 grow flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <Link
                  from="/admin/members/"
                  to="/admin/members"
                  search={(prev) => ({ ...prev, member: row.id })}
                  resetScroll={false}
                  // Stretched over the whole card: one big tap target.
                  className="font-medium text-foreground after:absolute after:inset-0"
                >
                  {row.name}
                </Link>
                <RoleTag role={row.role} />
              </span>
              <span className="truncate text-[13px] text-muted-foreground">
                <span className="tabular-nums">{row.phone}</span>
                {row.houseVillage && ` · ${row.houseVillage}`}
              </span>
              <StatusText status={row.status} />
            </div>
            {row.bloodGroup && <BloodChip group={row.bloodGroup} />}
          </li>
        ))}
      </ul>
    </>
  )
}
