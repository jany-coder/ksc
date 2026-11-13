import { describe, expect, it } from 'vitest'

import { csvCell, toCsv } from './csv.ts'

describe('csvCell', () => {
  it('leaves plain text alone, Bengali included', () => {
    expect(csvCell('রহিম')).toBe('রহিম')
  })

  it('writes null as an empty cell', () => {
    expect(csvCell(null)).toBe('')
  })

  it('quotes values with commas, quotes or line breaks', () => {
    expect(csvCell('a,b')).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell('line1\nline2')).toBe('"line1\nline2"')
  })

  it('defuses spreadsheet formulas', () => {
    expect(csvCell('=SUM(A1)')).toBe("'=SUM(A1)")
    expect(csvCell('+1')).toBe("'+1")
    expect(csvCell('-1')).toBe("'-1")
    expect(csvCell('@cmd')).toBe("'@cmd")
  })

  it('keeps a number that merely contains a dash safe, not altered', () => {
    expect(csvCell('2026-11-14')).toBe('2026-11-14')
  })
})

describe('toCsv', () => {
  it('joins rows with CRLF', () => {
    expect(toCsv(['a', 'b'], [['1', true]])).toBe('a,b\r\n1,true')
  })
})
