import { formatMonth, formatMonthYear, formatYear } from '../../lib/datetime.ts'
import type { GalleryFilter } from '../../lib/gallery-filter.ts'
import type { Lang } from '../../lib/i18n/core.ts'
import { useLang, useT } from '../../lib/i18n/index.tsx'
import type { ActivityOption } from '../../lib/images.server.ts'
import { Button } from '../ui/button.tsx'
import { NativeSelect } from '../ui/native-select.tsx'

// "ইফতার আয়োজন · মার্চ ২০২৬": the month tells two yearly events apart.
export function activityLabel(activity: ActivityOption, lang: Lang): string {
  return activity.eventDate
    ? `${activity.title} · ${formatMonthYear(activity.eventDate, lang)}`
    : activity.title
}

// "2026-03-14" -> [2026, 3]
const yearMonthOf = (iso: string) =>
  iso.split('-').map(Number) as [number, number]

/**
 * Year, month and activity filters for the admin gallery. The choices come from
 * the activities' own dates, so only years and months that have an activity
 * are offered. Changing a wider filter clears the narrower ones below it.
 */
export function GalleryFilters({
  filter,
  activities,
  onChange,
}: {
  filter: GalleryFilter
  activities: ActivityOption[]
  onChange: (next: GalleryFilter) => void
}) {
  const t = useT()
  const lang = useLang()

  const dated = activities.filter((a) => a.eventDate !== null)
  const years = [
    ...new Set(dated.map((a) => yearMonthOf(a.eventDate!)[0])),
  ].sort((a, b) => b - a)
  const months =
    filter.year === undefined
      ? []
      : [
          ...new Set(
            dated
              .map((a) => yearMonthOf(a.eventDate!))
              .filter(([y]) => y === filter.year)
              .map(([, m]) => m),
          ),
        ].sort((a, b) => a - b)
  // The activity list narrows to the chosen year and month.
  const shownActivities = activities.filter((a) => {
    if (filter.year === undefined) return true
    if (!a.eventDate) return false
    const [y, m] = yearMonthOf(a.eventDate)
    return (
      y === filter.year && (filter.month === undefined || m === filter.month)
    )
  })

  const noActivity = filter.activity === 'none'
  const anyFilter =
    filter.year !== undefined ||
    filter.month !== undefined ||
    filter.activity !== undefined

  return (
    <section
      aria-label={t('gal.filters')}
      className="flex flex-wrap items-end gap-3 rounded-[10px] border border-border bg-card p-4"
    >
      <div className="flex w-full flex-col gap-1 sm:w-32">
        <label htmlFor="filter-year" className="text-sm font-medium">
          {t('gal.filterYear')}
        </label>
        <NativeSelect
          id="filter-year"
          value={filter.year ?? ''}
          disabled={noActivity}
          onChange={(e) =>
            onChange({
              year: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">{t('gal.filterAll')}</option>
          {years.map((year) => (
            <option key={year} value={year}>
              {formatYear(year, lang)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex w-full flex-col gap-1 sm:w-36">
        <label htmlFor="filter-month" className="text-sm font-medium">
          {t('gal.filterMonth')}
        </label>
        <NativeSelect
          id="filter-month"
          value={filter.month ?? ''}
          disabled={noActivity || filter.year === undefined}
          onChange={(e) =>
            onChange({
              year: filter.year,
              month: e.target.value ? Number(e.target.value) : undefined,
            })
          }
        >
          <option value="">{t('gal.filterAll')}</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {formatMonth(month, lang)}
            </option>
          ))}
        </NativeSelect>
      </div>

      <div className="flex w-full min-w-0 flex-col gap-1 sm:w-72">
        <label htmlFor="filter-activity" className="text-sm font-medium">
          {t('gal.filterActivity')}
        </label>
        <NativeSelect
          id="filter-activity"
          value={filter.activity ?? ''}
          onChange={(e) => {
            const value = e.target.value
            if (value === '')
              onChange({ year: filter.year, month: filter.month })
            // "No activity" photos have no date, so the date filters go.
            else if (value === 'none') onChange({ activity: 'none' })
            else
              onChange({
                year: filter.year,
                month: filter.month,
                activity: value,
              })
          }}
        >
          <option value="">{t('gal.filterAllActivities')}</option>
          <option value="none">{t('gal.filterNoActivity')}</option>
          {shownActivities.map((activity) => (
            <option key={activity.id} value={activity.id}>
              {activityLabel(activity, lang)}
            </option>
          ))}
        </NativeSelect>
      </div>

      {anyFilter && (
        <Button type="button" variant="outline" onClick={() => onChange({})}>
          {t('gal.filterClear')}
        </Button>
      )}
    </section>
  )
}
