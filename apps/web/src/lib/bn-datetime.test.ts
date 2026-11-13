import { describe, expect, it } from 'vitest'

import { formatBnDate, formatBnTime, formatEventWhen } from './bn-datetime.ts'

describe('formatBnDate', () => {
  it('writes day, month name and year in Bengali, no commas', () => {
    expect(formatBnDate('2026-12-20')).toBe('২০ ডিসেম্বর ২০২৬')
    expect(formatBnDate('2026-01-05')).toBe('৫ জানুয়ারি ২০২৬')
  })
  it('does not group the year digits', () => {
    expect(formatBnDate('2026-11-14')).not.toContain(',')
    expect(formatBnDate('2026-11-14')).toContain('২০২৬')
  })
})

describe('formatBnTime', () => {
  it.each([
    ['03:05', 'রাত ৩:০৫'],
    ['05:00', 'ভোর ৫:০০'],
    ['09:30', 'সকাল ৯:৩০'],
    ['12:00', 'দুপুর ১২:০০'],
    ['15:30', 'বিকাল ৩:৩০'],
    ['18:45', 'সন্ধ্যা ৬:৪৫'],
    ['21:10', 'রাত ৯:১০'],
    ['00:00', 'রাত ১২:০০'],
  ])('%s -> %s', (input, expected) => {
    expect(formatBnTime(input)).toBe(expected)
  })
  it('uses no Latin AM/PM', () => {
    expect(formatBnTime('15:30')).not.toMatch(/[AP]M/)
  })
})

describe('formatEventWhen', () => {
  it('joins date and time', () => {
    expect(formatEventWhen('2026-12-20', '15:30')).toBe(
      '২০ ডিসেম্বর ২০২৬, বিকাল ৩:৩০',
    )
  })
  it('shows only the date when there is no time', () => {
    expect(formatEventWhen('2026-12-20', null)).toBe('২০ ডিসেম্বর ২০২৬')
  })
  it('keeps the visible placeholder when there is no date', () => {
    expect(formatEventWhen(null, null)).toBe('[তারিখ]')
    expect(formatEventWhen(null, '10:00')).toBe('[তারিখ]')
  })
})
