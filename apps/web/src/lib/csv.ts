// Minimal CSV writer. Two things matter:
//  1. Quoting: a value with a comma, quote or line break goes in "..." and an
//     inner " is doubled (RFC 4180).
//  2. Formula injection: a spreadsheet treats a cell starting with = + - @ (or a
//     tab / carriage return) as a formula. A member could register under the
//     name "=HYPERLINK(...)", and it would run when an admin opens the export.
//     A leading ' makes the spreadsheet show it as plain text.
const FORMULA_START = /^[=+\-@\t\r]/

export function csvCell(value: string | number | boolean | null): string {
  if (value === null) return ''
  let text = String(value)
  if (FORMULA_START.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(
  header: string[],
  rows: (string | number | boolean | null)[][],
): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}
