import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

import type { MemberRow } from '../../lib/members.server.ts'
import { STATUS_LABEL, bloodLabel } from '../../lib/member-options.ts'
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

// First letter as a person sees it (Bengali conjuncts are several code points).
function initialOf(name: string): string {
  const first = new Intl.Segmenter('bn', { granularity: 'grapheme' })
    .segment(name.trim())
    [Symbol.iterator]()
    .next()
  return first.done ? '?' : first.value.segment
}

const dash = <span className="text-muted-foreground">—</span>

const columns = helper.columns([
  helper.accessor('name', {
    header: 'সদস্য',
    cell: ({ getValue }) => (
      <span className="flex items-center gap-2.5">
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-zinc-600"
        >
          {initialOf(getValue())}
        </span>
        <span className="font-medium text-foreground">{getValue()}</span>
      </span>
    ),
  }),
  helper.accessor('phone', {
    header: 'মোবাইল',
    cell: ({ getValue }) => <span className="tabular-nums">{getValue()}</span>,
  }),
  helper.accessor('bloodGroup', {
    header: 'রক্ত',
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
    header: 'এলাকা',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() ?? dash}</span>
    ),
  }),
  helper.accessor('occupation', {
    header: 'পেশা',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() ?? dash}</span>
    ),
  }),
  helper.accessor('status', {
    header: 'অবস্থা',
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-1.5 text-[13px] text-zinc-700">
        <span
          aria-hidden="true"
          className={cn('size-[7px] rounded-full', STATUS_DOT[getValue()])}
        />
        {STATUS_LABEL[getValue()]}
      </span>
    ),
  }),
])

export function MembersTable({ rows }: { rows: MemberRow[] }) {
  const table = useTable({ features, columns, data: rows })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <caption className="sr-only">সদস্যদের তালিকা</caption>
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
