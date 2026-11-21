import { z } from 'zod'
import { describe, expect, it } from 'vitest'

import {
  EMPTY_PROFILE,
  formatAddress,
  isValidBirthDate,
  profileShape,
  profileToRow,
  rowToProfile,
} from './member-profile.ts'

const schema = z.object(profileShape)
const fails = (patch: object) =>
  !schema.safeParse({ ...EMPTY_PROFILE, ...patch }).success

describe('profile fields', () => {
  it('accepts an empty profile: every field is optional', () => {
    expect(fails({})).toBe(false)
  })
  it('accepts a 4-digit post code only', () => {
    expect(fails({ postCode: '1340' })).toBe(false)
    expect(fails({ postCode: '134' })).toBe(true)
    expect(fails({ postCode: 'abcd' })).toBe(true)
  })
  it('accepts only the listed genders and marital statuses', () => {
    expect(fails({ gender: 'female' })).toBe(false)
    expect(fails({ gender: 'x' })).toBe(true)
    expect(fails({ maritalStatus: 'married' })).toBe(false)
    expect(fails({ maritalStatus: 'divorced' })).toBe(true)
  })
})

describe('isValidBirthDate', () => {
  const today = new Date('2026-11-22T12:00:00Z')
  it('rejects future, too-old and impossible dates', () => {
    expect(isValidBirthDate('1990-05-01', today)).toBe(true)
    expect(isValidBirthDate('2027-01-01', today)).toBe(false)
    expect(isValidBirthDate('1899-12-31', today)).toBe(false)
    expect(isValidBirthDate('1990-02-30', today)).toBe(false)
  })
})

describe('profileToRow / rowToProfile', () => {
  it('turns blanks into NULL and back', () => {
    const row = profileToRow({ ...EMPTY_PROFILE, district: 'Dhaka' })
    expect(row.district).toBe('Dhaka')
    expect(row.upazila).toBeNull()
    expect(rowToProfile(row)).toEqual({ ...EMPTY_PROFILE, district: 'Dhaka' })
  })
})

describe('formatAddress', () => {
  it('joins the parts in order and skips empty ones', () => {
    const row = profileToRow({
      ...EMPTY_PROFILE,
      houseVillage: 'Amtola',
      postOffice: 'Dairy Farm',
      postCode: '1340',
      upazila: 'Savar',
      district: 'Dhaka',
    })
    expect(formatAddress(row)).toBe('Amtola, Dairy Farm - 1340, Savar, Dhaka')
  })
})
