import { describe, expect, it } from 'vitest'

import {
  memberEditSchema,
  memberFormSchema,
  memberToEditValues,
} from './member-form.ts'

const valid = {
  name: 'নমুনা',
  phone: '017-1234-5678',
  email: '',
  bloodGroup: 'O+',
  address: '',
  area: '',
  occupation: '',
  status: 'active',
  willingToDonate: true,
  consent: true,
}

const fails = (patch: object) =>
  !memberFormSchema.safeParse({ ...valid, ...patch }).success

describe('memberFormSchema', () => {
  it('accepts a complete valid member', () => {
    expect(memberFormSchema.safeParse(valid).success).toBe(true)
  })

  it('accepts the minimum: name, phone, status, consent', () => {
    expect(
      memberFormSchema.safeParse({ ...valid, bloodGroup: '' }).success,
    ).toBe(true)
  })

  it('requires a name', () => {
    expect(fails({ name: '   ' })).toBe(true)
  })

  it('accepts any common phone format but rejects non-numbers', () => {
    for (const phone of ['+8801712345678', '০১৭১২৩৪৫৬৭৮', '01712345678']) {
      expect(fails({ phone })).toBe(false)
    }
    for (const phone of ['', '12345', 'abc', '+919876543210']) {
      expect(fails({ phone })).toBe(true)
    }
  })

  it('allows an empty email but rejects a malformed one', () => {
    expect(fails({ email: '' })).toBe(false)
    expect(fails({ email: 'a@b.com' })).toBe(false)
    expect(fails({ email: 'not-an-email' })).toBe(true)
  })

  it('only allows real blood groups, or empty for unknown', () => {
    expect(fails({ bloodGroup: '' })).toBe(false)
    expect(fails({ bloodGroup: 'AB-' })).toBe(false)
    expect(fails({ bloodGroup: 'Z+' })).toBe(true)
  })

  it('only allows the three statuses', () => {
    expect(fails({ status: 'banned' })).toBe(true)
  })

  it('refuses to save without consent', () => {
    expect(fails({ consent: false })).toBe(true)
  })

  it('does not let a form set the role', () => {
    const parsed = memberFormSchema.parse({ ...valid, role: 'super_admin' })
    expect('role' in parsed).toBe(false)
  })
})

describe('memberEditSchema', () => {
  const edit = {
    name: 'নমুনা',
    email: '',
    bloodGroup: 'O+',
    address: '',
    area: '',
    occupation: '',
    willingToDonate: true,
    lastDonationDate: '',
  }
  const editFails = (patch: object) =>
    !memberEditSchema.safeParse({ ...edit, ...patch }).success

  it('accepts a full edit, with no consent or status needed', () => {
    expect(memberEditSchema.safeParse(edit).success).toBe(true)
  })

  it('never takes phone, role, status or consent from the edit form', () => {
    const parsed = memberEditSchema.parse({
      ...edit,
      phone: '01999999999',
      role: 'super_admin',
      status: 'active',
      consent: false,
    })
    expect(parsed).not.toHaveProperty('phone')
    expect(parsed).not.toHaveProperty('role')
    expect(parsed).not.toHaveProperty('status')
    expect(parsed).not.toHaveProperty('consent')
  })

  it('still checks the name and blood group', () => {
    expect(editFails({ name: '   ' })).toBe(true)
    expect(editFails({ bloodGroup: 'Z+' })).toBe(true)
  })

  it('accepts no donation date or a real one, but not a made-up day', () => {
    expect(editFails({ lastDonationDate: '' })).toBe(false)
    expect(editFails({ lastDonationDate: '2026-05-20' })).toBe(false)
    expect(editFails({ lastDonationDate: '2026-02-31' })).toBe(true)
    expect(editFails({ lastDonationDate: '20-05-2026' })).toBe(true)
  })
})

describe('memberToEditValues', () => {
  it('turns missing values into empty strings, as the form expects', () => {
    expect(
      memberToEditValues({
        name: 'নমুনা',
        email: null,
        bloodGroup: null,
        address: null,
        area: null,
        occupation: null,
        willingToDonate: false,
        lastDonationDate: null,
      }),
    ).toEqual({
      name: 'নমুনা',
      email: '',
      bloodGroup: '',
      address: '',
      area: '',
      occupation: '',
      willingToDonate: false,
      lastDonationDate: '',
    })
  })
})
