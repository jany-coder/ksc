import { formatBnDate, formatBnTime } from './bn-datetime.ts'
import type { Lang } from './i18n/core.ts'

// Dates and times in the reader's language. Bengali uses Bengali digits and the
// way people say the time of day (see bn-datetime.ts); English is "20 December
// 2026, 3:30 PM". Values arrive as plain "YYYY-MM-DD" / "HH:MM" text, so no
// time-zone maths happens here.
const enMonth = new Intl.DateTimeFormat('en-GB', {
  month: 'long',
  timeZone: 'UTC',
})

export function formatDate(iso: string, lang: Lang): string {
  if (lang === 'bn') return formatBnDate(iso)
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1, d))
  return `${d} ${enMonth.format(date)} ${y}`
}

export function formatTime(hhmm: string, lang: Lang): string {
  if (lang === 'bn') return formatBnTime(hhmm)
  const [h, min] = hhmm.split(':').map(Number)
  const hour12 = h! % 12 || 12
  return `${hour12}:${String(min).padStart(2, '0')} ${h! < 12 ? 'AM' : 'PM'}`
}

/** "2026-12-20" + "15:30" -> date and time; a missing date shows a visible placeholder. */
export function formatEventWhen(
  date: string | null,
  time: string | null,
  lang: Lang,
): string {
  if (!date) return lang === 'bn' ? '[তারিখ]' : '[date]'
  return time
    ? `${formatDate(date, lang)}, ${formatTime(time, lang)}`
    : formatDate(date, lang)
}
