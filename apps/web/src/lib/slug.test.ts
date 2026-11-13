import { describe, expect, it } from 'vitest'

import { makeSlug, randomSuffix } from './slug.ts'

const ENGLISH_ONLY = /^[a-z0-9]+(-[a-z0-9]+)*$/

describe('makeSlug', () => {
  it('uses the English words of an English title', () => {
    expect(makeSlug({ title: 'Winter Clothes Distribution' }, 'k3x9a2')).toBe(
      'winter-clothes-distribution-k3x9a2',
    )
  })

  it('drops punctuation and collapses separators', () => {
    expect(makeSlug({ title: 'Blood Camp, 2026!!  --  Savar' }, 'x1')).toBe(
      'blood-camp-2026-savar-x1',
    )
  })

  it('does not transliterate a Bengali title: uses category and date instead', () => {
    expect(
      makeSlug(
        { title: 'শীতবস্ত্র বিতরণ', categorySlug: 'relief', date: '2026-12-20' },
        'abc123',
      ),
    ).toBe('relief-2026-12-20-abc123')
  })

  it('uses only the English words of a mixed title', () => {
    expect(
      makeSlug(
        { title: 'রক্তদান Camp ২০২৬', categorySlug: 'blood-donation' },
        's',
      ),
    ).toBe('camp-s')
  })

  it('falls back to the category alone, then to plain "activity"', () => {
    expect(makeSlug({ title: 'বিতরণ', categorySlug: 'sports' }, 's')).toBe(
      'sports-s',
    )
    expect(makeSlug({ title: 'বিতরণ' }, 's')).toBe('activity-s')
    expect(makeSlug({ title: '' }, 's')).toBe('activity-s')
  })

  it('never contains a Bengali letter, whatever the input', () => {
    for (const title of ['শীতবস্ত্র', 'রক্ত Camp ঢাকা', '!!!', 'ক'.repeat(100)]) {
      expect(makeSlug({ title }, 'abc123')).toMatch(ENGLISH_ONLY)
    }
  })

  it('caps the readable part and never leaves a double hyphen', () => {
    const slug = makeSlug({ title: 'a'.repeat(80) + ' tail' }, 'sfx')
    expect(slug.length).toBeLessThanOrEqual(50 + 1 + 3)
    expect(slug).not.toMatch(/--/)
  })

  it('adds a different suffix each time by default', () => {
    const a = makeSlug({ title: 'Same' })
    const b = makeSlug({ title: 'Same' })
    expect(a).not.toBe(b)
    expect(randomSuffix(6)).toMatch(/^[a-z0-9]{6}$/)
  })
})
