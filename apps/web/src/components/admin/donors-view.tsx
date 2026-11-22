import { Link } from '@tanstack/react-router'
import { Check, Phone } from 'lucide-react'

import { daysBetween, formatDate, todayInDhaka } from '../../lib/datetime.ts'
import {
  DONATION_GAP_DAYS,
  canDonateNow,
  daysUntilEligible,
} from '../../lib/donor-eligibility.ts'
import type { DonorsSearch } from '../../lib/donors-query.ts'
import type { DonorRow, DonorsData } from '../../lib/donors.server.ts'
import { useLang, useNumber, useT } from '../../lib/i18n/index.tsx'
import { BLOOD_GROUPS, bloodLabel } from '../../lib/member-options.ts'
import { cn } from '../../lib/utils.ts'
import { BloodChip, bloodTint } from './blood-chip.tsx'
import { SmallAvatar } from './members-table.tsx'

// The donor lookup (routes/admin/donors.tsx): someone calls the club needing
// blood, an admin picks the group and sees who can give it, those who may
// give now at the top, with a tap to call.

type Donor = DonorRow & { daysUntil: number }

/** The donor lookup page's body, given the list and the URL's filters. */
export function DonorsView({
  data,
  search,
}: {
  data: DonorsData
  search: DonorsSearch
}) {
  const t = useT()
  const number = useNumber()
  const today = todayInDhaka()

  // Those who may give now first (never donated, then longest ago), then
  // the rest by how soon they may give again.
  const all: Donor[] = data.rows
    .map((row) => ({
      ...row,
      daysUntil: daysUntilEligible(row.lastDonationDate, row.gender, today),
    }))
    .sort((a, b) => a.daysUntil - b.daysUntil)
  const readyCount = all.filter((d) => canDonateNow(d.daysUntil)).length
  const shown = search.ready
    ? all.filter((d) => canDonateNow(d.daysUntil))
    : all

  return (
    <main className="flex flex-col gap-4 px-4 py-6 md:p-6">
      <div>
        <h1 className="mb-0.5 text-2xl font-semibold">{t('donors.title')}</h1>
        <p className="max-w-[680px] text-sm text-muted-foreground">
          {t('donors.lead')}
        </p>
      </div>

      {/* The eight groups, each with its number of donors. Picking the
          picked one again shows every group. */}
      <nav
        aria-label={t('donors.byGroup')}
        className="grid grid-cols-4 gap-2 sm:grid-cols-8"
      >
        {BLOOD_GROUPS.map((group) => {
          const active = search.blood === group
          return (
            <Link
              key={group}
              from="/admin/donors"
              to="/admin/donors"
              search={(prev) => ({
                ...prev,
                blood: active ? undefined : group,
              })}
              aria-current={active ? 'true' : undefined}
              {...(active ? { style: bloodTint(group) } : {})}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-[10px] border px-1 py-2.5 text-center transition-colors',
                active
                  ? 'border-2'
                  : 'border-border bg-card hover:bg-secondary',
              )}
            >
              <span className="text-lg leading-none font-bold tabular-nums">
                {bloodLabel(group)}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('donors.count', { n: number(data.counts[group]) })}
              </span>
            </Link>
          )
        })}
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        {search.blood && (
          <Link
            from="/admin/donors"
            to="/admin/donors"
            search={(prev) => ({ ...prev, blood: undefined })}
            className="inline-flex min-h-9 items-center rounded-lg border border-border bg-card px-3 text-[13px] font-semibold hover:bg-secondary"
          >
            {t('donors.allGroups')}
          </Link>
        )}
        {/* A filter that lives in the URL, shown as a checkbox. */}
        <Link
          from="/admin/donors"
          to="/admin/donors"
          search={(prev) => ({ ...prev, ready: prev.ready ? undefined : true })}
          role="checkbox"
          aria-checked={search.ready === true}
          className={cn(
            'inline-flex min-h-9 items-center gap-2 rounded-lg border px-3 text-[13px] font-semibold',
            search.ready
              ? 'border-primary bg-accent text-accent-foreground'
              : 'border-border bg-card hover:bg-secondary',
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              'flex size-4 items-center justify-center rounded border',
              search.ready
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-zinc-400',
            )}
          >
            {search.ready && <Check className="size-3" strokeWidth={3} />}
          </span>
          {t('donors.readyOnly')}
        </Link>
        <p role="status" className="ms-auto text-[13px] text-muted-foreground">
          {t('donors.summary', {
            n: number(all.length),
            ready: number(readyCount),
          })}
        </p>
      </div>

      <div className="overflow-hidden rounded-[10px] border border-border bg-card">
        {shown.length > 0 ? (
          <>
            <DonorTable donors={shown} />
            <DonorCards donors={shown} />
          </>
        ) : (
          <p className="px-4 py-10 text-center text-muted-foreground">
            {all.length === 0 ? t('donors.emptyNone') : t('donors.emptyReady')}
          </p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {t('donors.rule', {
          male: number(DONATION_GAP_DAYS.male),
          female: number(DONATION_GAP_DAYS.female),
        })}
      </p>
    </main>
  )
}

const area = (d: DonorRow) =>
  [d.houseVillage, d.upazila].filter(Boolean).join(', ')

/** Free now, or how many days to go. */
function Readiness({ daysUntil }: { daysUntil: number }) {
  const t = useT()
  const number = useNumber()
  return canDonateNow(daysUntil) ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-green-800">
      <Check aria-hidden="true" className="size-3" strokeWidth={3} />
      {t('donors.readyNow')}
    </span>
  ) : (
    <span className="inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold whitespace-nowrap text-amber-900">
      {t('donors.readyIn', { n: number(daysUntil) })}
    </span>
  )
}

function LastDonation({ date }: { date: string | null }) {
  const t = useT()
  const lang = useLang()
  const number = useNumber()
  if (!date)
    return <span className="text-muted-foreground">{t('drawer.never')}</span>
  const ago = Math.max(0, daysBetween(date, todayInDhaka()))
  return (
    <span>
      {formatDate(date, lang)}{' '}
      <span className="text-muted-foreground">
        ({t('drawer.daysAgo', { n: number(ago) })})
      </span>
    </span>
  )
}

function PhoneLink({ phone }: { phone: string }) {
  return (
    <a
      href={`tel:${phone}`}
      className="inline-flex items-center gap-1.5 font-medium text-primary tabular-nums hover:underline"
    >
      <Phone aria-hidden="true" className="size-3.5" />
      {phone}
    </a>
  )
}

function NameCell({ donor }: { donor: DonorRow }) {
  return (
    <Link
      to="/admin/members/$id"
      params={{ id: donor.id }}
      className="flex min-w-0 items-center gap-2.5 font-medium hover:underline"
    >
      <SmallAvatar row={donor} className="size-7 text-xs" />
      <span className="truncate">{donor.name}</span>
    </Link>
  )
}

/** Wider screens: a table. */
function DonorTable({ donors }: { donors: Donor[] }) {
  const t = useT()
  const th =
    'border-b border-border px-4 py-2.5 text-start text-xs font-semibold text-muted-foreground'
  return (
    <table className="hidden w-full border-collapse text-sm md:table">
      <thead>
        <tr>
          <th className={th}>{t('donors.colName')}</th>
          <th className={th}>{t('donors.colGroup')}</th>
          <th className={th}>{t('donors.colPhone')}</th>
          <th className={th}>{t('donors.colArea')}</th>
          <th className={th}>{t('donors.colLast')}</th>
          <th className={th}>{t('donors.colReady')}</th>
        </tr>
      </thead>
      <tbody>
        {donors.map((d) => (
          <tr key={d.id} className="border-b border-border last:border-b-0">
            <td className="max-w-[240px] px-4 py-2.5">
              <NameCell donor={d} />
            </td>
            <td className="px-4 py-2.5">
              <BloodChip group={d.bloodGroup} />
            </td>
            <td className="px-4 py-2.5">
              <PhoneLink phone={d.phone} />
            </td>
            <td className="max-w-[220px] truncate px-4 py-2.5 text-muted-foreground">
              {area(d) || '—'}
            </td>
            <td className="px-4 py-2.5">
              <LastDonation date={d.lastDonationDate} />
            </td>
            <td className="px-4 py-2.5">
              <Readiness daysUntil={d.daysUntil} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** A phone: one card per donor, the call link easy to tap. */
function DonorCards({ donors }: { donors: Donor[] }) {
  const t = useT()
  return (
    <ul className="m-0 list-none divide-y divide-border p-0 md:hidden">
      {donors.map((d) => (
        <li key={d.id} className="flex flex-col gap-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2">
            <NameCell donor={d} />
            <BloodChip group={d.bloodGroup} />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <PhoneLink phone={d.phone} />
            <Readiness daysUntil={d.daysUntil} />
          </div>
          <p className="m-0 text-[13px] text-muted-foreground">
            {area(d) && <>{area(d)} · </>}
            {t('donors.colLast')}: <LastDonation date={d.lastDonationDate} />
          </p>
        </li>
      ))}
    </ul>
  )
}
