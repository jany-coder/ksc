import { describe, expect, it } from 'vitest'

import {
  dateRange,
  galleryFilterSchema,
  groupPhotos,
} from './gallery-filter.ts'

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

describe('groupPhotos', () => {
  const photo = (
    id: string,
    activityId: string | null,
    activityTitle: string | null = activityId,
  ) => ({
    id,
    width: 800,
    height: 600,
    caption: null,
    activityId,
    activityTitle,
    activityDate: null,
  })

  it('groups by activity in order, with the rest last', () => {
    const groups = groupPhotos([
      photo('1', 'a'),
      photo('2', 'a'),
      photo('3', null),
      photo('4', 'b'),
    ])
    expect(groups.map((g) => g.key)).toEqual(['a', 'b', 'other'])
    expect(groups[0]!.photos.map((p) => p.index)).toEqual([0, 1])
    expect(groups[2]!.photos.map((p) => p.photo.id)).toEqual(['3'])
  })

  it('puts photos of a draft activity (no public title) under other', () => {
    const groups = groupPhotos([photo('1', 'draft', null)])
    expect(groups.map((g) => g.key)).toEqual(['other'])
  })

  it('gives no other group when every photo has an activity', () => {
    expect(groupPhotos([photo('1', 'a')]).map((g) => g.key)).toEqual(['a'])
  })
})
