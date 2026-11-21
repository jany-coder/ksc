import { describe, expect, it } from 'vitest'

import {
  formatDate,
  formatEventWhen,
  formatMonth,
  formatMonthYear,
  formatTime,
  formatYear,
} from './datetime.ts'

describe('formatDate', () => {
  it('writes English dates in words', () => {
    expect(formatDate('2026-12-20', 'en')).toBe('20 December 2026')
    expect(formatDate('2026-01-05', 'en')).toBe('5 January 2026')
  })
  it('keeps the Bengali form', () => {
    expect(formatDate('2026-12-20', 'bn')).toBe('২০ ডিসেম্বর ২০২৬')
  })
})

describe('formatMonthYear', () => {
  it('writes month and year', () => {
    expect(formatMonthYear('2026-03-14', 'en')).toBe('March 2026')
    expect(formatMonthYear('2026-03-14', 'bn')).toBe('মার্চ ২০২৬')
  })
})

describe('formatMonth and formatYear', () => {
  it('names a month and writes a year without a comma', () => {
    expect(formatMonth(12, 'en')).toBe('December')
    expect(formatMonth(12, 'bn')).toBe('ডিসেম্বর')
    expect(formatYear(2025, 'bn')).toBe('২০২৫')
    expect(formatYear(2025, 'en')).toBe('2025')
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
