// Minimal CSV writer. Two things matter:
//  1. Quoting: a value with a comma, quote or line break goes in "..." and an
//     inner " is doubled (RFC 4180).
//  2. Formula injection: a spreadsheet treats a cell starting with = + - @ (or a
//     tab / carriage return) as a formula. A member could register under the
//     name "=HYPERLINK(...)", and it would run when an admin opens the export.
//     A leading ' makes the spreadsheet show it as plain text.
const FORMULA_START = /^[=+\-@\t\r]/

/**
 * A value that must stay text even if it looks like a number: a phone number
 * "01712345678" would otherwise open in Excel as 1712345678 (leading zero lost).
 * Written as ="01712345678", which Excel and Google Sheets show as the text.
 * Only for values WE control (digits); user-typed text goes through the
 * formula guard below instead.
 */
export class CsvText {
  readonly digits: string
  constructor(digits: string) {
    if (!/^\d+$/.test(digits)) throw new Error('CsvText takes digits only')
    this.digits = digits
  }
}

export type CsvValue = string | number | boolean | null | CsvText

export function csvCell(value: CsvValue): string {
  if (value === null) return ''
  if (value instanceof CsvText) return `"=""${value.digits}"""`
  let text = String(value)
  if (FORMULA_START.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(header: string[], rows: CsvValue[][]): string {
  return [header, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')
}
