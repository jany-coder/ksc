import { Link } from '@tanstack/react-router'
import {
  createColumnHelper,
  tableFeatures,
  useTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ImageOff } from 'lucide-react'
import { useMemo } from 'react'

import type { ActivityRow } from '../../lib/activities.server.ts'
import { nextActivitiesSearch } from '../../lib/activities-query.ts'
import { categoryName } from '../../lib/activity-category.ts'
import { ACTIVITY_STATUS_LABEL_KEY } from '../../lib/activity-form.ts'
import { formatDate } from '../../lib/datetime.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'
import { formatNumber } from '../../lib/i18n/core.ts'
import type { Lang } from '../../lib/i18n/core.ts'
import { cn } from '../../lib/utils.ts'

// Display only: filtering, sorting and paging happen on the server
// (activities.server.ts), so no table features are registered.
const features = tableFeatures({})
const helper = createColumnHelper<typeof features, ActivityRow>()
const dash = <span className="text-muted-foreground">—</span>

type Sort = 'newest' | 'oldest'

function StatusBadge({ status }: { status: ActivityRow['status'] }) {
  const t = useT()
  return (
    <span
      className={cn(
        'inline-flex rounded-[5px] border px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap',
        status === 'published'
          ? 'border-green-200 bg-green-50 text-green-700'
          : 'border-border bg-secondary text-muted-foreground',
      )}
    >
      {t(ACTIVITY_STATUS_LABEL_KEY[status])}
    </span>
  )
}

function FeaturedBadge() {
  const t = useT()
  return (
    <span className="rounded-[5px] border border-border bg-secondary px-1.5 py-px text-[11px] font-semibold whitespace-nowrap text-zinc-600">
      {t('act.featured')}
    </span>
  )
}

/** The cover's thumbnail, or a quiet empty square. Decorative: the title is beside it. */
function Thumb({ url, className }: { url: string | null; className: string }) {
  return url ? (
    <img
      src={url}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn('shrink-0 rounded-md bg-secondary object-cover', className)}
    />
  ) : (
    <span
      aria-hidden="true"
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md bg-secondary text-zinc-400',
        className,
      )}
    >
      <ImageOff className="size-4" />
    </span>
  )
}

const photoText = (t: ReturnType<typeof useT>, lang: Lang, n: number) =>
  n > 0 ? t('act.photos', { n: formatNumber(n, lang) }) : t('act.noPhotos')

/** The date heading: a link that flips the order, with an arrow showing it. */
function DateHeader({ sort }: { sort: Sort }) {
  const t = useT()
  const Arrow = sort === 'oldest' ? ArrowUp : ArrowDown
  return (
    <Link
      from="/admin/activities/"
      to="/admin/activities"
      search={(prev) =>
        nextActivitiesSearch(prev, {
          sort: sort === 'oldest' ? undefined : 'oldest',
        })
      }
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {t('act.colDate')}
      <Arrow aria-hidden="true" className="size-3.5" />
      <span className="sr-only">{t('act.sortByDate')}</span>
    </Link>
  )
}

// Built inside the component: headings and dates need the reader's language.
function makeColumns(t: ReturnType<typeof useT>, lang: Lang, sort: Sort) {
  return helper.columns([
    helper.accessor('title', {
      header: t('a.colTitle'),
      cell: ({ getValue, row }) => (
        <span className="flex items-center gap-3">
          <Thumb url={row.original.thumbUrl} className="size-10" />
          <span className="flex flex-wrap items-center gap-2">
            {/* A real link to the edit page. */}
            <Link
              to="/admin/activities/$id"
              params={{ id: row.original.id }}
              className="font-medium text-foreground hover:underline"
            >
              {getValue()}
            </Link>
            {row.original.featured && <FeaturedBadge />}
          </span>
        </span>
      ),
    }),
    helper.accessor('category', {
      header: t('act.colType'),
      cell: ({ getValue }) => {
        const kind = getValue()
        return kind ? (
          <span className="text-muted-foreground">
            {categoryName(kind, lang)}
          </span>
        ) : (
          dash
        )
      },
    }),
    helper.accessor('eventDate', {
      header: () => <DateHeader sort={sort} />,
      cell: ({ getValue }) => {
        const date = getValue()
        return date ? (
          <span className="tabular-nums whitespace-nowrap">
            {formatDate(date, lang)}
          </span>
        ) : (
          dash
        )
      },
    }),
    helper.accessor('photoCount', {
      header: t('act.colPhotos'),
      cell: ({ getValue }) => (
        <span
          className={cn(
            'whitespace-nowrap',
            getValue() > 0 ? 'text-zinc-700' : 'text-muted-foreground',
          )}
        >
          {photoText(t, lang, getValue())}
        </span>
      ),
    }),
    helper.accessor('status', {
      header: t('a.status'),
      cell: ({ getValue }) => <StatusBadge status={getValue()} />,
    }),
    // An explicit link, so editing and deleting are easy to find (the delete
    // button itself is on the edit page, behind a confirmation).
    helper.display({
      id: 'actions',
      header: () => <span className="sr-only">{t('a.actions')}</span>,
      cell: ({ row }) => (
        <Link
          to="/admin/activities/$id"
          params={{ id: row.original.id }}
          className="text-[13px] font-medium whitespace-nowrap text-primary hover:underline"
        >
          {t('a.editDelete')}
        </Link>
      ),
    }),
  ])
}

/**
 * The activities list: a table from md up, a list of cards on a phone (a wide
 * table there would have to be scrolled sideways).
 */
export function ActivitiesTable({
  rows,
  sort,
}: {
  rows: ActivityRow[]
  sort: Sort
}) {
  const t = useT()
  const lang = useLang()
  const columns = useMemo(() => makeColumns(t, lang, sort), [t, lang, sort])
  const table = useTable({ features, columns, data: rows })

  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full border-collapse">
          <caption className="sr-only">{t('act.caption')}</caption>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={
                      header.column.id === 'eventDate'
                        ? sort === 'oldest'
                          ? 'ascending'
                          : 'descending'
                        : undefined
                    }
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
                    className="border-b border-zinc-100 px-3.5 py-[9px] align-middle text-sm text-zinc-800"
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Phone: one card per activity, the whole card opens it. */}
      <ul
        aria-label={t('act.caption')}
        className="divide-y divide-zinc-100 md:hidden"
      >
        {rows.map((row) => (
          <li
            key={row.id}
            className="relative flex gap-3 px-4 py-3 active:bg-background"
          >
            <Thumb url={row.thumbUrl} className="size-14" />
            <div className="flex min-w-0 grow flex-col gap-1">
              <Link
                to="/admin/activities/$id"
                params={{ id: row.id }}
                // Stretched over the whole card: one big tap target.
                className="font-medium leading-snug text-foreground after:absolute after:inset-0"
              >
                {row.title}
              </Link>
              <p className="text-[13px] text-muted-foreground">
                {[
                  row.eventDate
                    ? formatDate(row.eventDate, lang)
                    : t('act.noDate'),
                  row.category ? categoryName(row.category, lang) : null,
                  photoText(t, lang, row.photoCount),
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <StatusBadge status={row.status} />
                {row.featured && <FeaturedBadge />}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
