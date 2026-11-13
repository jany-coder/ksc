import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { useMemo } from 'react'

import { formatDate } from '../../lib/datetime.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'
import type { Lang } from '../../lib/i18n/core.ts'
import { NOTICE_STATUS_LABEL_KEY } from '../../lib/notice-form.ts'
import type { NoticeRow } from '../../lib/notices.server.ts'
import { cn } from '../../lib/utils.ts'

// Display only: the list is small and ordered by the server.
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, NoticeRow>()
const dash = <span className="text-muted-foreground">—</span>

// Built inside the component: headings and dates need the reader's language.
function makeColumns(t: ReturnType<typeof useT>, lang: Lang) {
  return helper.columns([
    helper.accessor('title', {
      header: t('a.colTitle'),
      cell: ({ getValue, row }) => (
        <span className="flex flex-wrap items-center gap-2">
          {/* A real link to the edit page. */}
          <Link
            to="/admin/notices/$id"
            params={{ id: row.original.id }}
            className="font-medium text-foreground hover:underline"
          >
            {getValue()}
          </Link>
          {row.original.urgent && (
            <span className="rounded-[5px] border border-red-200 bg-red-50 px-1.5 py-px text-[11px] font-semibold text-red-700">
              {t('not.urgentTag')}
            </span>
          )}
        </span>
      ),
    }),
    helper.accessor('publishedDate', {
      header: t('not.colPublished'),
      cell: ({ getValue }) => {
        const date = getValue()
        return date ? (
          <span className="tabular-nums">{formatDate(date, lang)}</span>
        ) : (
          dash
        )
      },
    }),
    helper.accessor('status', {
      header: t('a.status'),
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
            {t(NOTICE_STATUS_LABEL_KEY[getValue()])}
          </span>
        )
      },
    }),
    // An explicit link, so editing and deleting are easy to find (the delete
    // button itself is on the edit page, behind a confirmation).
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('a.actions')}</span>,
      cell: ({ row }) => (
        <Link
          to="/admin/notices/$id"
          params={{ id: row.original.id }}
          className="text-[13px] font-medium whitespace-nowrap text-primary hover:underline"
        >
          {t('a.editDelete')}
        </Link>
      ),
    }),
  ])
}

export function NoticesTable({ rows }: { rows: NoticeRow[] }) {
  const t = useT()
  const lang = useLang()
  const columns = useMemo(() => makeColumns(t, lang), [t, lang])
  const table = useTable({ features, columns, data: rows })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse">
        <caption className="sr-only">{t('not.caption')}</caption>
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
