import { describe, expect, it } from 'vitest'

import {
  categoryFormSchema,
  categoryName,
  categorySlug,
  selectableCategories,
} from './activity-category.ts'

const ok = (nameBn: string, nameEn: string) =>
  categoryFormSchema.safeParse({ nameBn, nameEn }).success

describe('categoryFormSchema', () => {
  it('accepts a Bengali and an English name', () => {
    expect(ok('বৃক্ষরোপণ', 'Tree planting')).toBe(true)
    expect(ok('ত্রাণ ও সহায়তা', 'Relief & support')).toBe(true)
  })
  it('needs both names', () => {
    expect(ok('  ', 'Sports')).toBe(false)
    expect(ok('খেলাধুলা', '')).toBe(false)
  })
  it('keeps the English name in English letters', () => {
    expect(ok('খেলাধুলা', 'খেলাধুলা')).toBe(false)
    expect(ok('খেলাধুলা', '-sports')).toBe(false)
  })
  it('limits the length', () => {
    expect(ok('ক'.repeat(41), 'Sports')).toBe(false)
  })
})

describe('categoryName / categorySlug', () => {
  const kind = { nameBn: 'শিক্ষা', nameEn: 'Education' }
  it('picks the reader’s language', () => {
    expect(categoryName(kind, 'bn')).toBe('শিক্ষা')
    expect(categoryName(kind, 'en')).toBe('Education')
  })
  it('makes a plain URL part', () => {
    expect(categorySlug('Relief & support')).toBe('relief-support')
    expect(categorySlug("Women's day")).toBe('women-s-day')
  })
})

describe('selectableCategories', () => {
  const kinds = [
    { id: 'a', hidden: false },
    { id: 'b', hidden: true },
  ]
  it('leaves hidden kinds out, except the one already chosen', () => {
    expect(selectableCategories(kinds, '').map((k) => k.id)).toEqual(['a'])
    expect(selectableCategories(kinds, 'b').map((k) => k.id)).toEqual([
      'a',
      'b',
    ])
  })
})
