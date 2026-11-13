import { describe, expect, it } from 'vitest'

import { activityFormSchema, isRealDate } from './activity-form.ts'

const valid = {
  title: 'শীতবস্ত্র বিতরণ',
  description: '',
  category: '',
  eventDate: '',
  eventTime: '',
  location: '',
  status: 'draft',
  featured: false,
  coverImageId: '',
}
const fails = (patch: object) =>
  !activityFormSchema.safeParse({ ...valid, ...patch }).success

describe('isRealDate', () => {
  it('accepts real days, including a leap day', () => {
    expect(isRealDate('2026-11-14')).toBe(true)
    expect(isRealDate('2028-02-29')).toBe(true)
  })
  it('rejects days that do not exist and bad shapes', () => {
    expect(isRealDate('2026-02-31')).toBe(false)
    expect(isRealDate('2027-02-29')).toBe(false)
    expect(isRealDate('2026-13-01')).toBe(false)
    expect(isRealDate('14-11-2026')).toBe(false)
    expect(isRealDate('')).toBe(false)
  })
})

describe('activityFormSchema', () => {
  it('accepts the minimum: just a title', () => {
    expect(activityFormSchema.safeParse(valid).success).toBe(true)
  })
  it('accepts a full activity', () => {
    const full = {
      ...valid,
      description: 'বিবরণ',
      category: 'রক্তদান',
      eventDate: '2026-12-20',
      eventTime: '15:30',
      location: 'ক্লাব প্রাঙ্গণ',
      status: 'published',
      featured: true,
    }
    expect(activityFormSchema.safeParse(full).success).toBe(true)
  })
  it('requires a title', () => {
    expect(fails({ title: '   ' })).toBe(true)
  })
  it('rejects an impossible date or a malformed time', () => {
    expect(fails({ eventDate: '2026-02-31' })).toBe(true)
    expect(fails({ eventTime: '25:00' })).toBe(true)
    expect(fails({ eventTime: '9:5' })).toBe(true)
  })
  it('only allows the known categories (or none) and the two statuses', () => {
    expect(fails({ category: 'অন্য' })).toBe(true)
    expect(fails({ status: 'archived' })).toBe(true)
  })

  it('accepts a cover photo id or none, but not a made-up value', () => {
    expect(
      fails({ coverImageId: '11111111-1111-4111-8111-111111111111' }),
    ).toBe(false)
    expect(fails({ coverImageId: '' })).toBe(false)
    expect(fails({ coverImageId: 'not-an-id' })).toBe(true)
  })
})
