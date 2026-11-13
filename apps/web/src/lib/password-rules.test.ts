import { describe, expect, it } from 'vitest'

import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  changePasswordSchema,
} from './password-rules.ts'

const ok = { currentPassword: 'old-password-1', newPassword: 'new-password-2' }

describe('changePasswordSchema', () => {
  it('accepts a valid change', () => {
    expect(changePasswordSchema.safeParse(ok).success).toBe(true)
  })

  it('rejects a new password shorter than the minimum', () => {
    const short = 'a'.repeat(MIN_PASSWORD_LENGTH - 1)
    expect(
      changePasswordSchema.safeParse({ ...ok, newPassword: short }).success,
    ).toBe(false)
  })

  it('accepts exactly the minimum and the maximum length', () => {
    for (const n of [MIN_PASSWORD_LENGTH, MAX_PASSWORD_LENGTH]) {
      const newPassword = 'a'.repeat(n)
      expect(
        changePasswordSchema.safeParse({ ...ok, newPassword }).success,
      ).toBe(true)
    }
  })

  it('rejects a new password over the maximum', () => {
    const long = 'a'.repeat(MAX_PASSWORD_LENGTH + 1)
    expect(
      changePasswordSchema.safeParse({ ...ok, newPassword: long }).success,
    ).toBe(false)
  })

  it('rejects reusing the current password', () => {
    const same = {
      currentPassword: 'same-password-1',
      newPassword: 'same-password-1',
    }
    const result = changePasswordSchema.safeParse(same)
    expect(result.success).toBe(false)
  })

  it('requires the current password', () => {
    expect(
      changePasswordSchema.safeParse({ ...ok, currentPassword: '' }).success,
    ).toBe(false)
  })

  it('does not force capitals or symbols', () => {
    expect(
      changePasswordSchema.safeParse({ ...ok, newPassword: 'alllowercase' })
        .success,
    ).toBe(true)
  })
})
