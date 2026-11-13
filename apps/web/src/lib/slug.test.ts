import { describe, expect, it } from 'vitest'

import { makeSlug, randomSuffix } from './slug.ts'

describe('makeSlug', () => {
  it('keeps Bengali letters, including vowel signs and conjuncts', () => {
    expect(makeSlug('শীতবস্ত্র বিতরণ', 'abc123')).toBe('শীতবস্ত্র-বিতরণ-abc123')
  })

  it('lower-cases Latin text and drops punctuation', () => {
    expect(makeSlug('Blood Camp, 2026!', 'x1')).toBe('blood-camp-2026-x1')
  })

  it('collapses runs of spaces and symbols into one hyphen', () => {
    expect(makeSlug('a   --  b', 'z')).toBe('a-b-z')
  })

  it('falls back when nothing usable is left', () => {
    expect(makeSlug('!!! ???', 'q')).toBe('karjokrom-q')
    expect(makeSlug('', 'q')).toBe('karjokrom-q')
  })

  it('caps the length of the readable part', () => {
    const slug = makeSlug('a'.repeat(200), 'sfx')
    expect(slug.length).toBeLessThanOrEqual(60 + 1 + 3)
  })

  it('never ends the readable part with a hyphen', () => {
    expect(makeSlug('abc ' + 'x'.repeat(56) + ' tail', 's')).not.toMatch(/--/)
  })

  it('adds a different suffix each time by default', () => {
    expect(makeSlug('একই নাম')).not.toBe(makeSlug('একই নাম'))
    expect(randomSuffix(6)).toMatch(/^[a-z0-9]{6}$/)
  })
})
