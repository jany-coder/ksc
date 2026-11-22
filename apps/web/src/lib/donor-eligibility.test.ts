import { describe, expect, it } from 'vitest'

import {
  canDonateNow,
  daysUntilEligible,
  donationGapDays,
} from './donor-eligibility.ts'

describe('donationGapDays', () => {
  it('is 3 months for men and 4 for women', () => {
    expect(donationGapDays('male')).toBe(90)
    expect(donationGapDays('female')).toBe(120)
  })
  it('uses the longer gap when the gender is unknown or other', () => {
    expect(donationGapDays(null)).toBe(120)
    expect(donationGapDays('other')).toBe(120)
  })
})

describe('daysUntilEligible', () => {
  it('lets someone who never donated give now, ahead of everyone', () => {
    const d = daysUntilEligible(null, 'male', '2026-11-22')
    expect(canDonateNow(d)).toBe(true)
    expect(d).toBeLessThan(-10_000)
  })
  it('counts down to the end of the gap', () => {
    // 2026-10-23 is 30 days before 2026-11-22: 60 days to go for a man.
    expect(daysUntilEligible('2026-10-23', 'male', '2026-11-22')).toBe(60)
    expect(daysUntilEligible('2026-10-23', 'female', '2026-11-22')).toBe(90)
  })
  it('is zero on the day the gap ends, and negative after', () => {
    expect(daysUntilEligible('2026-08-24', 'male', '2026-11-22')).toBe(0)
    expect(canDonateNow(0)).toBe(true)
    expect(daysUntilEligible('2026-01-01', 'male', '2026-11-22')).toBeLessThan(
      0,
    )
  })
})
