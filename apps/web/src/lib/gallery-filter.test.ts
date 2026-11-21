import { describe, expect, it } from 'vitest'

import { dateRange, galleryFilterSchema } from './gallery-filter.ts'

describe('dateRange', () => {
  it('covers a whole year', () => {
    expect(dateRange(2025, undefined)).toEqual({
      from: '2025-01-01',
      to: '2026-01-01',
    })
  })
  it('covers one month, rolling December into the next year', () => {
    expect(dateRange(2025, 3)).toEqual({ from: '2025-03-01', to: '2025-04-01' })
    expect(dateRange(2025, 12)).toEqual({
      from: '2025-12-01',
      to: '2026-01-01',
    })
  })
  it('ignores a month without a year', () => {
    expect(dateRange(undefined, 3)).toBeNull()
  })
})

describe('galleryFilterSchema', () => {
  it('reads numbers that arrive as text', () => {
    expect(galleryFilterSchema.parse({ year: '2025', month: '3' })).toEqual({
      year: 2025,
      month: 3,
    })
  })
  it('drops bad values instead of failing', () => {
    expect(
      galleryFilterSchema.parse({ year: 'abc', month: 13, activity: 'x' }),
    ).toEqual({})
  })
  it('accepts "none" for photos with no activity', () => {
    expect(galleryFilterSchema.parse({ activity: 'none' })).toEqual({
      activity: 'none',
    })
  })
})
