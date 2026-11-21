import { Link } from '@tanstack/react-router'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Droplet,
  Image,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { DashboardData } from '../../lib/dashboard.server.ts'
import { formatDate, formatMonthShort } from '../../lib/datetime.ts'
import {
  STORAGE_FREE_BYTES,
  STORAGE_STOP_BYTES,
  formatBytes,
} from '../../lib/image-limits.ts'
import { useLang, useNumber, useT } from '../../lib/i18n/index.tsx'
import {
  BLOOD_GROUPS,
  MEMBER_STATUSES,
  STATUS_LABEL_KEY,
  bloodLabel,
} from '../../lib/member-options.ts'
import type { MemberStatus } from '../../lib/member-options.ts'
import { cn } from '../../lib/utils.ts'
import { bloodColor, bloodTint } from './blood-chip.tsx'

// The pieces of the admin dashboard. Each chart is plain HTML and CSS (no
// chart library): bars are <div>s sized in %, so they fit any screen, follow
// the light / dark theme through the colour tokens, and every number is also
// available as text (labels, tooltips, or a table for screen readers).

// h-full: the cards in one row are all as tall as the tallest.
export const card =
  'h-full min-w-0 rounded-[12px] border border-border bg-card p-4'

/** A card's heading, with an optional "See all" link on the right. */
export function CardHeader({
  id,
  title,
  link,
}: {
  id: string
  title: string
  link?: ReactNode
}) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 id={id} className="text-[15px] font-semibold">
        {title}
      </h2>
      {link}
    </div>
  )
}

export function SeeAll({
  to,
  search,
}: {
  to: '/admin/members' | '/admin/activities' | '/admin/notices'
  search?: Record<string, string>
}) {
  const t = useT()
  return (
    <Link
      to={to}
      {...(search ? { search } : {})}
      className="inline-flex shrink-0 items-center gap-0.5 text-[13px] font-medium text-primary hover:underline"
    >
      {t('dash.seeAll')}
      <ChevronRight aria-hidden="true" className="size-3.5 rtl:rotate-180" />
    </Link>
  )
}

// --- the four headline tiles ---

const TONES = {
  green: 'bg-green-50 text-green-700',
  blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
  red: 'bg-red-50 text-red-700',
  violet:
    'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
} as const

/**
 * One headline number: label, value, one line of detail. The whole tile is a
 * link to the page behind the number.
 */
export function StatTile({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  to,
}: {
  label: string
  value: string
  detail: string
  icon: LucideIcon
  tone: keyof typeof TONES
  to: '/admin/members' | '/admin/activities' | '/admin/gallery'
}) {
  return (
    <Link
      to={to}
      className={cn(
        card,
        'group flex flex-col gap-3 transition-colors hover:border-primary focus-visible:border-primary',
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-muted-foreground">
          {label}
        </span>
        <span
          aria-hidden="true"
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-[10px]',
            TONES[tone],
          )}
        >
          <Icon className="size-[18px]" />
        </span>
      </span>
      {/* Proportional figures: tabular digits look loose at this size. */}
      <span className="text-[32px] leading-none font-semibold">{value}</span>
      <span className="text-[13px] leading-snug text-muted-foreground">
        {detail}
      </span>
    </Link>
  )
}

// --- what needs doing ---

export type AttentionItem = {
  key: string
  // How many; null for a state (storage nearly full).
  count: number | null
  label: string
  tone: 'warn' | 'info'
  to:
    '/admin/members' | '/admin/gallery' | '/admin/activities' | '/admin/notices'
  search?: Record<string, string>
}

/**
 * The jobs waiting, one compact row each: the count in a pill, what it is,
 * and an arrow. The whole row is the link.
 */
export function Attention({ items }: { items: AttentionItem[] }) {
  const t = useT()
  const number = useNumber()
  return (
    <section className={card} aria-labelledby="dash-attention">
      <CardHeader id="dash-attention" title={t('dash.attention')} />
      {items.length === 0 ? (
        <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-800">
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
          {t('dash.allGood')}
        </p>
      ) : (
        <ul className="-mx-1 flex flex-col">
          {items.map((item) => (
            <li key={item.key}>
              <Link
                to={item.to}
                search={item.search as never}
                className="flex min-h-10 items-center gap-2.5 rounded-md px-1 text-sm hover:bg-secondary"
              >
                <span
                  className={cn(
                    'inline-flex h-6 min-w-8 shrink-0 items-center justify-center rounded-full px-2 text-xs font-semibold',
                    item.tone === 'warn'
                      ? 'bg-yellow-100 text-yellow-900'
                      : 'bg-secondary text-foreground',
                  )}
                >
                  {item.count === null ? (
                    <AlertTriangle aria-hidden="true" className="size-3.5" />
                  ) : (
                    number(item.count)
                  )}
                </span>
                <span className="min-w-0 grow">{item.label}</span>
                <ChevronRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground rtl:rotate-180"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

// --- donors per blood group: eight small tiles ---

/**
 * One tile per blood group, in its own light colour, with the count. Two rows
 * of four, so all eight are seen at once without scrolling.
 */
export function DonorTiles({ donors }: { donors: DashboardData['donors'] }) {
  const t = useT()
  const number = useNumber()
  const total = BLOOD_GROUPS.reduce((sum, g) => sum + donors[g], 0)

  return (
    <section className={card} aria-labelledby="dash-donors">
      <CardHeader
        id="dash-donors"
        title={t('dash.donorsTitle')}
        link={
          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
            <Droplet aria-hidden="true" className="size-3" />
            {t('dash.donorsTotal', { n: number(total) })}
          </span>
        }
      />
      <ul className="grid grid-cols-4 gap-2">
        {BLOOD_GROUPS.map((group) => {
          const n = donors[group]
          return (
            <li key={group}>
              <Link
                to="/admin/members"
                search={{ blood: group }}
                aria-label={t('dash.donorRow', {
                  group: bloodLabel(group),
                  n: number(n),
                })}
                style={bloodTint(group)}
                className="flex min-w-0 flex-col items-center gap-1 rounded-lg border px-1.5 py-2 transition-[filter] hover:brightness-95 sm:flex-row sm:justify-between sm:px-2.5 dark:hover:brightness-125"
              >
                <span className="flex items-center gap-1.5 text-[13px] font-semibold">
                  <span
                    aria-hidden="true"
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: bloodColor(group) }}
                  />
                  {bloodLabel(group)}
                </span>
                <span
                  className={cn(
                    'text-lg leading-none font-semibold',
                    n === 0 && 'text-muted-foreground',
                  )}
                >
                  {number(n)}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <p className="mt-2.5 text-xs text-muted-foreground">
        {t('dash.donorsNote')}
      </p>
    </section>
  )
}

// --- members by status: a thin segmented bar with its legend ---

const STATUS_COLOR: Record<MemberStatus, string> = {
  active: 'bg-green-600',
  pending: 'bg-yellow-600',
  suspended: 'bg-zinc-400',
}

export function StatusBreakdown({
  counts,
}: {
  counts: DashboardData['members']
}) {
  const t = useT()
  const number = useNumber()
  return (
    <section className={card} aria-labelledby="dash-status">
      <CardHeader
        id="dash-status"
        title={t('dash.statusTitle')}
        link={
          <span className="text-[13px] text-muted-foreground">
            {t('dash.statusTotal', { n: number(counts.all) })}
          </span>
        }
      />
      {counts.all > 0 && (
        // The list below gives every number; the bar is the picture of it.
        <div aria-hidden="true" className="mb-3 flex h-2 gap-[2px]">
          {MEMBER_STATUSES.filter((s) => counts[s] > 0).map((s) => (
            <span
              key={s}
              className={cn(
                'h-full first:rounded-s-full last:rounded-e-full',
                STATUS_COLOR[s],
              )}
              style={{ flexGrow: counts[s] }}
            />
          ))}
        </div>
      )}
      <ul className="flex flex-col">
        {MEMBER_STATUSES.map((status) => (
          <li key={status}>
            <Link
              to="/admin/members"
              search={{ status }}
              className="flex min-h-8 items-center gap-2.5 rounded-md px-1 text-sm hover:bg-secondary"
            >
              <span
                aria-hidden="true"
                className={cn('size-2 rounded-full', STATUS_COLOR[status])}
              />
              <span className="grow">{t(STATUS_LABEL_KEY[status])}</span>
              <span className="font-semibold tabular-nums">
                {number(counts[status])}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// --- the next few activities ---

export function NextActivities({
  items,
}: {
  items: DashboardData['nextActivities']
}) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  return (
    <section className={card} aria-labelledby="dash-next">
      <CardHeader
        id="dash-next"
        title={t('dash.nextTitle')}
        link={<SeeAll to="/admin/activities" />}
      />
      {items.length === 0 ? (
        <p className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <CalendarDays aria-hidden="true" className="size-4" />
          {t('dash.nextNone')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((a) => {
            const [, m, d] = a.eventDate.split('-').map(Number)
            return (
              <li key={a.id}>
                <Link
                  to="/admin/activities/$id"
                  params={{ id: a.id }}
                  className="flex items-center gap-3 rounded-lg border border-border p-2.5 hover:border-primary"
                >
                  {/* A small calendar leaf: day and month. */}
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-accent text-accent-foreground"
                  >
                    <span className="text-lg leading-none font-semibold">
                      {number(d!)}
                    </span>
                    <span className="mt-0.5 text-[10px] leading-none">
                      {formatMonthShort(m!, lang)}
                    </span>
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">
                      {a.title}
                    </span>
                    <span className="truncate text-[13px] text-muted-foreground">
                      {formatDate(a.eventDate, lang)}
                      {a.location && ` · ${a.location}`}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

// --- notices and photo storage ---

export function ContentCard({
  notices,
  photos,
}: {
  notices: DashboardData['notices']
  photos: DashboardData['photos']
}) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  const share = Math.min(1, photos.usedBytes / STORAGE_FREE_BYTES)
  return (
    <section className={card} aria-labelledby="dash-content">
      <CardHeader
        id="dash-content"
        title={t('dash.noticesTitle')}
        link={<SeeAll to="/admin/notices" />}
      />
      <p className="text-sm">
        {t('dash.noticesLine', {
          published: number(notices.published),
          draft: number(notices.draft),
        })}
      </p>
      {notices.urgent > 0 && (
        <p className="mt-1.5 text-[13px] font-medium text-red-700">
          {t('dash.urgentOn', { n: number(notices.urgent) })}
        </p>
      )}

      <div className="mt-3 border-t border-border pt-3">
        <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
          <Image aria-hidden="true" className="size-4 text-muted-foreground" />
          {t('dash.storageTitle')}
        </h3>
        {/* A meter: the fill turns yellow, then red, as the limit nears. */}
        <div
          role="meter"
          aria-label={t('dash.storageTitle')}
          aria-valuemin={0}
          aria-valuemax={STORAGE_FREE_BYTES}
          aria-valuenow={photos.usedBytes}
          aria-valuetext={t('dash.storageUsed', {
            used: formatBytes(photos.usedBytes, lang),
            free: formatBytes(STORAGE_FREE_BYTES, lang),
          })}
          className="h-2 overflow-hidden rounded-full bg-secondary"
        >
          <span
            className={cn(
              'block h-full rounded-full',
              photos.state === 'full'
                ? 'bg-red-600'
                : photos.state === 'warn'
                  ? 'bg-yellow-600'
                  : 'bg-primary',
            )}
            // At least a sliver, so "in use" is visible from the first photo.
            style={{
              width: `${Math.max(share * 100, photos.usedBytes > 0 ? 1.5 : 0)}%`,
            }}
          />
        </div>
        <p className="mt-2 text-[13px]">
          {t('dash.storageUsed', {
            used: formatBytes(photos.usedBytes, lang),
            free: formatBytes(STORAGE_FREE_BYTES, lang),
          })}
        </p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          {t('dash.storageNote', {
            stop: formatBytes(STORAGE_STOP_BYTES, lang),
          })}
        </p>
      </div>
    </section>
  )
}
