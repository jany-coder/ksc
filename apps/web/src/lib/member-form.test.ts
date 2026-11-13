import { describe, expect, it } from 'vitest'

import { memberFormSchema } from './member-form.ts'

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
