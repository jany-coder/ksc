import { describe, expect, it } from 'vitest'

import { formatDate, formatEventWhen, formatTime } from './datetime.ts'

describe('formatDate', () => {
  it('writes English dates in words', () => {
    expect(formatDate('2026-12-20', 'en')).toBe('20 December 2026')
    expect(formatDate('2026-01-05', 'en')).toBe('5 January 2026')
  })
  it('keeps the Bengali form', () => {
    expect(formatDate('2026-12-20', 'bn')).toBe('২০ ডিসেম্বর ২০২৬')
  })
})

describe('formatTime', () => {
  it('uses a 12-hour clock with AM/PM in English', () => {
    expect(formatTime('15:30', 'en')).toBe('3:30 PM')
    expect(formatTime('09:05', 'en')).toBe('9:05 AM')
    expect(formatTime('00:00', 'en')).toBe('12:00 AM')
    expect(formatTime('12:00', 'en')).toBe('12:00 PM')
  })
  it('keeps the Bengali form', () => {
    expect(formatTime('15:30', 'bn')).toBe('বিকাল ৩:৩০')
  })
})

describe('formatEventWhen', () => {
  it('joins date and time', () => {
    expect(formatEventWhen('2026-12-20', '15:30', 'en')).toBe(
      '20 December 2026, 3:30 PM',
    )
    expect(formatEventWhen('2026-12-20', null, 'en')).toBe('20 December 2026')
  })
  it('shows a visible placeholder when there is no date', () => {
    expect(formatEventWhen(null, null, 'bn')).toBe('[তারিখ]')
    expect(formatEventWhen(null, null, 'en')).toBe('[date]')
  })
})
