import { describe, expect, it } from 'vitest'

import { normalizePhone, toAsciiDigits } from './phone.ts'

describe('normalizePhone', () => {
  const stored = '01712345678'

  it('leaves an already-normalised number unchanged', () => {
    expect(normalizePhone('01712345678')).toBe(stored)
  })

  it.each([
    ['dashes', '017-1234-5678'],
    ['spaces', '017 1234 5678'],
    ['dots and brackets', '(017) 1234.5678'],
    ['surrounding whitespace', '  01712345678\n'],
    ['plus country code', '+8801712345678'],
    ['country code without plus', '8801712345678'],
    ['country code with spaces', '+880 1712-345678'],
    ['00 international prefix', '008801712345678'],
    ['country code plus a leading 0', '+88001712345678'],
    ['leading 0 dropped', '1712345678'],
    ['Bengali digits', '০১৭১২৩৪৫৬৭৮'],
    ['Bengali digits with country code', '+৮৮০১৭১২৩৪৫৬৭৮'],
  ])('resolves %s to the same stored value', (_label, input) => {
    expect(normalizePhone(input)).toBe(stored)
  })

  it.each([
    ['empty string', ''],
    ['letters only', 'abc'],
    ['too short', '0171234'],
    ['too long', '017123456789'],
    ['wrong prefix (landline style)', '02-9876543'],
    ['02 is not a mobile prefix', '02712345678'],
    ['012 is not allocated', '01212345678'],
    ['another country code', '+919876543210'],
    ['letters mixed in', '0171234abcd'],
  ])('returns null for %s', (_label, input) => {
    expect(normalizePhone(input)).toBeNull()
  })

  it('accepts every valid operator prefix 013 to 019', () => {
    for (const p of ['013', '014', '015', '016', '017', '018', '019']) {
      expect(normalizePhone(`${p}12345678`)).toBe(`${p}12345678`)
    }
  })
})

describe('toAsciiDigits', () => {
  it('converts Bengali digits and leaves everything else alone', () => {
    expect(toAsciiDigits('০১৭১-২৩abc')).toBe('0171-23abc')
    expect(toAsciiDigits('0171')).toBe('0171')
  })
})
