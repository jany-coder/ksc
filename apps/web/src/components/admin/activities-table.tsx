import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'

import type { ActivityRow } from '../../lib/activities.server.ts'
import { ACTIVITY_STATUS_LABEL } from '../../lib/activity-form.ts'
import { formatBnDate } from '../../lib/bn-datetime.ts'
import { cn } from '../../lib/utils.ts'

// Display only: the list is small and ordered by the server.
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, ActivityRow>()
const dash = <span className="text-muted-foreground">—</span>

const columns = helper.columns([
  helper.accessor('title', {
    header: 'শিরোনাম',
    cell: ({ getValue, row }) => (
      <span className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-foreground">{getValue()}</span>
        {row.original.featured && (
          <span className="rounded-[5px] border border-border bg-secondary px-1.5 py-px text-[11px] font-semibold text-zinc-600">
            হোমপেজের উপরে
          </span>
        )}
      </span>
    ),
  }),
  helper.accessor('category', {
    header: 'ধরন',
    cell: ({ getValue }) => (
      <span className="text-muted-foreground">{getValue() ?? dash}</span>
    ),
  }),
  helper.accessor('eventDate', {
    header: 'তারিখ',
    cell: ({ getValue }) => {
      const date = getValue()
      return date ? (
        <span className="tabular-nums">{formatBnDate(date)}</span>
      ) : (
        dash
      )
    },
  }),
  helper.accessor('status', {
    header: 'অবস্থা',
    cell: ({ getValue }) => {
      const published = getValue() === 'published'
      return (
        <span
          className={cn(
            'inline-flex rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold',
            published
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-border bg-secondary text-muted-foreground',
          )}
        >
          {ACTIVITY_STATUS_LABEL[getValue()]}
        </span>
      )
    },
  }),
])

export function ActivitiesTable({ rows }: { rows: ActivityRow[] }) {
  const table = useTable({ features, columns, data: rows })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse">
        <caption className="sr-only">কার্যক্রমের তালিকা</caption>
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
