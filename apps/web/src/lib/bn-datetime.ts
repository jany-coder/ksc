// Bengali date and time text for the public site, built from parts so we control
// the wording. The browser's own bn-BD time format writes "PM" in Latin letters
// and adds commas, which looks wrong on a Bengali-first site.
const digits = new Intl.NumberFormat('bn-BD', { useGrouping: false })
const twoDigits = new Intl.NumberFormat('bn-BD', {
  useGrouping: false,
  minimumIntegerDigits: 2,
})
const monthName = new Intl.DateTimeFormat('bn-BD', {
  month: 'long',
  timeZone: 'UTC',
})

// Part of the day, in the way people say it. Hour is 0-23.
function periodOf(hour: number): string {
  if (hour < 4) return 'রাত'
  if (hour < 6) return 'ভোর'
  if (hour < 12) return 'সকাল'
  if (hour < 15) return 'দুপুর'
  if (hour < 18) return 'বিকাল'
  if (hour < 20) return 'সন্ধ্যা'
  return 'রাত'
}

/** "2026-12-20" -> "২০ ডিসেম্বর ২০২৬". */
export function formatBnDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1, d))
  return `${digits.format(d!)} ${monthName.format(date)} ${digits.format(y!)}`
}

/** "15:30" -> "বিকাল ৩:৩০". */
export function formatBnTime(hhmm: string): string {
  const [h, min] = hhmm.split(':').map(Number)
  const hour12 = h! % 12 || 12
  return `${periodOf(h!)} ${digits.format(hour12)}:${twoDigits.format(min!)}`
}

/** "2026-12-20" + "15:30" -> "২০ ডিসেম্বর ২০২৬, বিকাল ৩:৩০". Missing date -> placeholder. */
export function formatEventWhen(
  date: string | null,
  time: string | null,
): string {
  if (!date) return '[তারিখ]'
  return time
    ? `${formatBnDate(date)}, ${formatBnTime(time)}`
    : formatBnDate(date)
}
