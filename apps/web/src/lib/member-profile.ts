import { z } from 'zod'

import { isRealDate } from './activity-form.ts'
import type { MessageKey } from './i18n/messages.ts'

// The personal and address details a member record holds beyond name, phone,
// email and blood group. Shared by the public application (/join) and the
// admin forms, so all three ask the same things with the same rules.
//
// Deliberately NOT collected: National ID number. The club does not need it,
// and it is the most damaging thing to lose in a leak (decided 2026-11-22).
//
// Every field is optional and arrives from a form as text ('' = not given),
// becoming NULL in the database.

export const GENDERS = ['male', 'female', 'other'] as const
export type Gender = (typeof GENDERS)[number]
export const GENDER_LABEL_KEY: Record<Gender, MessageKey> = {
  male: 'profile.genderMale',
  female: 'profile.genderFemale',
  other: 'profile.genderOther',
}

export const MARITAL_STATUSES = ['single', 'married', 'other'] as const
export type MaritalStatus = (typeof MARITAL_STATUSES)[number]
export const MARITAL_LABEL_KEY: Record<MaritalStatus, MessageKey> = {
  single: 'profile.maritalSingle',
  married: 'profile.maritalMarried',
  other: 'profile.maritalOther',
}

const optionalText = z.string().trim().max(200, 'val.tooLong')
const optionalName = z.string().trim().max(100, 'val.nameTooLong')

/** "YYYY-MM-DD", a real day, not in the future and not before 1900. */
export function isValidBirthDate(v: string, today = new Date()): boolean {
  if (!isRealDate(v)) return false
  const todayIso = today.toISOString().slice(0, 10)
  return v >= '1900-01-01' && v <= todayIso
}

export const profileShape = {
  fatherName: optionalName,
  motherName: optionalName,
  dateOfBirth: z
    .string()
    .refine((v) => v === '' || isValidBirthDate(v), 'val.birthDateInvalid'),
  gender: z.union([z.enum(GENDERS), z.literal('')]),
  maritalStatus: z.union([z.enum(MARITAL_STATUSES), z.literal('')]),
  occupation: optionalText,
  organization: optionalText,
  // Address, the way Bangladeshi addresses are written.
  houseVillage: optionalText,
  roadWard: optionalText,
  postOffice: optionalText,
  // Bangladeshi post codes are four digits (Savar: 1340).
  postCode: z
    .string()
    .trim()
    .refine((v) => v === '' || /^\d{4}$/.test(v), 'val.postCodeInvalid'),
  upazila: optionalText,
  district: optionalText,
}

export type ProfileValues = {
  [K in keyof typeof profileShape]: z.infer<(typeof profileShape)[K]>
}
export type ProfileKey = keyof ProfileValues

export const PROFILE_KEYS = Object.keys(profileShape) as ProfileKey[]

export const EMPTY_PROFILE: ProfileValues = {
  fatherName: '',
  motherName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  occupation: '',
  organization: '',
  houseVillage: '',
  roadWard: '',
  postOffice: '',
  postCode: '',
  upazila: '',
  district: '',
}

/** As saved in the database: '' becomes NULL. */
export type ProfileRow = {
  [K in ProfileKey]: Exclude<ProfileValues[K], ''> | null
}

const blankToNull = <T extends string>(v: T): Exclude<T, ''> | null =>
  v === '' ? null : (v as Exclude<T, ''>)

/** Form values -> database columns. */
export function profileToRow(v: ProfileValues): ProfileRow {
  return {
    fatherName: blankToNull(v.fatherName),
    motherName: blankToNull(v.motherName),
    dateOfBirth: blankToNull(v.dateOfBirth),
    gender: blankToNull(v.gender),
    maritalStatus: blankToNull(v.maritalStatus),
    occupation: blankToNull(v.occupation),
    organization: blankToNull(v.organization),
    houseVillage: blankToNull(v.houseVillage),
    roadWard: blankToNull(v.roadWard),
    postOffice: blankToNull(v.postOffice),
    postCode: blankToNull(v.postCode),
    upazila: blankToNull(v.upazila),
    district: blankToNull(v.district),
  }
}

/** Database columns -> form values. */
export function rowToProfile(r: ProfileRow): ProfileValues {
  return {
    fatherName: r.fatherName ?? '',
    motherName: r.motherName ?? '',
    dateOfBirth: r.dateOfBirth ?? '',
    gender: r.gender ?? '',
    maritalStatus: r.maritalStatus ?? '',
    occupation: r.occupation ?? '',
    organization: r.organization ?? '',
    houseVillage: r.houseVillage ?? '',
    roadWard: r.roadWard ?? '',
    postOffice: r.postOffice ?? '',
    postCode: r.postCode ?? '',
    upazila: r.upazila ?? '',
    district: r.district ?? '',
  }
}

/**
 * The address on one line, in the usual order, skipping empty parts:
 * "Amtola, Ward 4, Dairy Farm - 1340, Savar, Dhaka".
 */
export function formatAddress(r: ProfileRow): string {
  const post = [r.postOffice, r.postCode].filter(Boolean).join(' - ')
  return [r.houseVillage, r.roadWard, post, r.upazila, r.district]
    .filter(Boolean)
    .join(', ')
}
